import type { AstroIntegration, AstroUserConfig, HookParameters, AstroConfig } from "astro";
import type { Config, PreviewStyle } from "@staticcms/core";
import { Plugin } from "vite";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import * as fs from "fs";
import { Logger } from "tslog";
import { AddressInfo } from "net";
import treeKill from "tree-kill";

const logger = new Logger({
  minLevel: 1 /* 0:silly 1:trace 2:debug 3:info 4:warn 5:error 6:fatal */,
});

export const defaultSkipIntegrationOnCommand: string[] = [
  "add",
  "build",
  "docs",
  "preview",
  "sync",
  "telemetry",
];

export const defaultEditorPath = "/staticcms";

export interface CustomPreviewStyles {
  href?: string[];
  css?: string[];
  local_import?: string[];
}

export type ConfigPreviewTemplate = [
  collection_name: string,
  component: string,
  import_component: string
];

export interface injectJavaScriptCode {
  js_code: string;
}

export interface AstroStaticCMSPlugin {
  config: Omit<Config, "load_config_file">;
  editorPath?: string;
  skipIntegrationOnCommand?: string[];
  previewStyles?: CustomPreviewStyles;
  previewTemplates?: ConfigPreviewTemplate[];
  injectBeforeInitStaticCMS?: injectJavaScriptCode[];
  minLogLevel?: number; /* 0:silly 1:trace 2:debug 3:info 4:warn 5:error 6:fatal */
}

let startDefaultProxyServer = false;
let defaultProxyServerPort: number | undefined;

/**
 * This function generates the module "virtual:astro-staticcms-configuration"
 * which will be imported in `static-cms-admin-ui.astro` in order to launch
 * the Static CMS editors UI at a specific Astro URI route/path.
 * @param config
 * @param previewStyles
 * @param previewTemplates
 */
function createVirtualConfigurationModule({
                                            config: cmsConfig,
                                            previewStyles,
                                            previewTemplates = [],
                                            injectBeforeInitStaticCMS = [],
                                            minLogLevel = 4
                                          }: AstroStaticCMSPlugin) {
  const styles: PreviewStyle[] = [];
  const eval_styles: string[] = [];
  const templates: string[] = [];
  const custom_templates: { [name: string]: boolean } = {};
  let first_defaultpreviewtemplate_import = true;

  logger.debug(
    "createVirtualConfigurationModule(), injectBeforeInitStaticCMS:",
    JSON.stringify(injectBeforeInitStaticCMS, null, 2)
  );
  previewTemplates.forEach((entry) => {
    const [collection_name, component, import_component] = entry;
    injectBeforeInitStaticCMS.push({js_code: import_component});
    templates.push(`['${collection_name}', ${component}]`);
    // Remember that user defined its own preview template for this Static CMS collection.
    custom_templates[collection_name] = true;
  });

  // Apply for any other Static CMS collection our default preview template
  // where the user did not (!custom_templates[entry.name]).
  cmsConfig.collections.forEach((collection, index) => {
    if (
      typeof collection?.name === "string" &&
      !custom_templates[collection.name]
    ) {
      // Import the default preview template module only once.
      if (first_defaultpreviewtemplate_import) {
        injectBeforeInitStaticCMS.push({
          js_code:
            "import DefaultPreviewTemplate from '@grewety/astro-static-cms/StaticCMSPreviewTemplate';",
        });
        first_defaultpreviewtemplate_import = false;
      }
      logger.info(
        `Default Static CMS preview template applied to collection[${index}] "${
          collection?.name ? collection.name : collection?.label
        }".`
      );
      templates.push(`['${collection.name}', DefaultPreviewTemplate]`);

      // https://www.staticcms.org/docs/collection-overview#editor
      if (
        collection?.editor !== undefined &&
        collection.editor?.frame === false
      ) {
        logger.info(
          `Enable frame for collection[${index}] "${
            collection?.name ? collection.name : collection?.label
          }" in Static CMS preview pane otherwise the default preview template does not work correctly.`
        );
        collection["editor"]["frame"] = true;
      }
    }
  });

  if (startDefaultProxyServer) {
    /**
     * In development mode we are using the Local Backend.
     * (https://www.staticcms.org/docs/local-backend)
     * The local backend allows you to use Static CMS with a local git repository, instead of working
     * with a live repo, regardless of backend provider. It will read and write file from your
     * local file system inside your local git repository. You will still need to manually commit and push
     * any files you have changed or added after completing the edits.
     * @see {@link https://github.com/StaticJsCMS/static-cms/blob/main/packages/core/src/interface.ts#L752|Definition}
     */
    cmsConfig.backend = {
      name: "proxy",
      branch: "master",
      proxy_url: `http://localhost:${defaultProxyServerPort}/api/v1/`,
    };
  }

  /*
   * We have to transform the previewStyles configuration so Static CMS
   * understands this. Only inline style (raw=true) or a links to a CSS ref are supported.
   * (https://github.com/StaticJsCMS/static-cms/blob/e70df54723023776e5d81a82a05c50a991493cc9/packages/core/src/components/Editor/EditorPreviewPane/EditorPreviewPane.tsx#L86)
   * The type definition of the array of styles is PreviewStyle in https://github.com/StaticJsCMS/static-cms/blob/e70df54723023776e5d81a82a05c50a991493cc9/packages/core/src/interface.ts#L877
   */
  const customStyles: CustomPreviewStyles = {...previewStyles};

  customStyles.href?.forEach((entry) => {
    styles.push({value: entry, raw: false});
  });
  customStyles.css?.forEach((entry) => {
    styles.push({value: entry, raw: true});
  });
  if (!customStyles?.local_import) customStyles.local_import = [];
  customStyles.local_import.push(
    "@grewety/astro-static-cms/StaticCMSPreviewTemplate/Default.css"
  );
  customStyles.local_import.forEach((entry, index) => {
    const name = `style__${index}`;
    injectBeforeInitStaticCMS.push({
      js_code: `import ${name} from '${entry}?inline';`,
    });
    eval_styles.push(`{value: ${name}, raw: true}`);
  });
  const ret = `import initStaticCMS from "@grewety/astro-static-cms/StaticCMSEditorUIRoute";
let startStaticCMS = true;
window.initStaticCMSParams = {
  config: JSON.parse('${JSON.stringify(cmsConfig)}'),
  previewStyles: [...${JSON.stringify(styles)},${eval_styles.join(",")}],
  previewTemplates: [${templates.join(",")}],
  minLogLevel: ${minLogLevel},
};
${injectBeforeInitStaticCMS.map((entry) => entry.js_code).join("\n")}
startStaticCMS && initStaticCMS(window.initStaticCMSParams);
`;
  logger.debug("Dynamic created Static CMS configuration:", ret);
  return ret;
}

/**
 * Virtual Modules Convention for Vite
 * (https://vitejs.dev/guide/api-plugin.html#virtual-modules-convention)
 */
function VitePluginAstroStaticCMS({
                                    config: cmsConfig,
                                    previewStyles,
                                    previewTemplates,
                                    injectBeforeInitStaticCMS,
                                    minLogLevel
                                  }: AstroStaticCMSPlugin): Plugin {
  // virtualModuleId is used in `staticcms-editor-ui.astro` to reference the dynamic-created configuration.
  const virtualModuleId = "virtual:astro-staticcms-configuration";
  const resolvedVirtualModuleId = "\0" + virtualModuleId;

  return {
    name: "vite-plugin-astro-staticcms-editor-ui",

    resolveId(id) {
      if (id === virtualModuleId) return resolvedVirtualModuleId;
    },

    load(id) {
      if (id === resolvedVirtualModuleId) {
        return createVirtualConfigurationModule({
          config: cmsConfig,
          previewStyles,
          previewTemplates,
          injectBeforeInitStaticCMS,
          minLogLevel
        });
      }
    },
  };
}

export const enableNetlifyIdentityWidget = (
  editorPath: string = defaultEditorPath
): injectJavaScriptCode => {
  logger.debug("NetlifyIdentityWidget injected.");
  return {
    js_code: `import { NetlifyIdentityWidget } from "@grewety/astro-static-cms/StaticCMSEditorUIRoute";\nNetlifyIdentityWidget("${editorPath}");`,
  };
};

/**
 * Enable Static CMS editor's UI at a dedicated `editorPath`.
 *
 * @param config - The configuration options can be found in Static CMS documentation at https://www.staticcms.org/docs/configuration-options
 * @param editorPath - Where to find Static CMS editor's UI in the URI for the local development mode. This is not used in production. Default is "/staticcms" (defaultEditorPath). Have to start with a "/" (slash).
 * @param skipIntegrationOnCommand - Which Astro CLI commands are not dedicated for Static CMS integration. Typically only the local development mode is appropriate. Default is `defaultSkipIntegrationOnCommand`.
 * @param minLogLevel - 0:silly 1:trace 2:debug 3:info 4:warn 5:error 6:fatal
 */
export default function AstroConfigStaticCMS({
                                               config: cmsConfig,
                                               editorPath = defaultEditorPath,
                                               skipIntegrationOnCommand = defaultSkipIntegrationOnCommand,
                                               previewStyles,
                                               previewTemplates = [],
                                               injectBeforeInitStaticCMS = [],
                                               minLogLevel = 4,
                                             }: AstroStaticCMSPlugin) {
  logger.settings.minLevel = minLogLevel;
  if (!editorPath.startsWith("/")) {
    throw new Error(
      `"editorPath" option must be a root-relative pathname, starting with "/", got "${editorPath}".`
    );
  }
  if (editorPath.endsWith("/")) {
    editorPath = editorPath.slice(0, -1);
  }

  let proxy: ReturnType<typeof spawn>;
  let currentAstroConfig: AstroConfig | undefined;

  const killProxy = () => {
    if (startDefaultProxyServer && proxy.pid) {
      treeKill(proxy.pid, 'SIGINT', (code) => {
        if (code) {
          logger.warn(`Stopping @staticcms/proxy-server on port ${defaultProxyServerPort} failed: ${code.message}`)
        } else {
          logger.info(`Stop @staticcms/proxy-server on port ${defaultProxyServerPort}.`);
        }
      });
    }
  };

  /**
   * Type definition of AstroIntegration
   * (https://docs.astro.build/de/reference/integrations-reference/)
   * (https://github.com/withastro/astro/blob/main/packages/astro/src/%40types/astro.ts#L1529)
   */
  const AstroStaticCMSIntegration: AstroIntegration = {
    name: "static-cms",
    hooks: {
      "astro:config:setup": ({
                               command,
                               config: astroConfig, // Definition: https://github.com/withastro/astro/blob/main/packages/astro/src/core/config/schema.ts#L42
                               injectRoute,
                               updateConfig,
                             }: HookParameters<"astro:config:setup">) => {
        if (skipIntegrationOnCommand.includes(command)) {
          logger.info(
            `Disabled Static CMS integration for "astro ${command}". You can change the behaviour with the "skipIntegrationOnCommand" option.`
          );
        } else {
          logger.info(`Static CMS integration enabled for "astro ${command}".`);
          logger.debug("Preconfigure StaticCMS with ", cmsConfig);
          // When using the default proxy server port
          if (cmsConfig.local_backend === undefined) {
            cmsConfig.local_backend = true;
          }
          if (cmsConfig.local_backend) {
            if (!cmsConfig.backend) {
              startDefaultProxyServer = true;
              logger.debug(
                `Default @staticcms/proxy-server will be started because "config.local_backend" not configured.`
              );
            } else if (
              cmsConfig.backend.name === "proxy" &&
              !cmsConfig.backend?.proxy_url
            ) {
              startDefaultProxyServer = true;
              logger.debug(
                `Default @staticcms/proxy-server will be started because 'proxy_url' not set for an alternative backend.`
              );
            }
          }
          if (startDefaultProxyServer) {
            // In order to support multiple parallel instances of the proxy server, e.g. while testing in
            // concurrency, we use Astros port number as base.
            defaultProxyServerPort = astroConfig.server.port + 100;

            const git_dir = fileURLToPath(astroConfig.root);
            logger.debug(`Following directory is used as Git repository: ${git_dir}`);
          }
          // `media_folder` is a mandatory configuration option.
          // (https://www.staticcms.org/docs/configuration-options#media-folder)
          if (cmsConfig.media_folder === undefined) {
            logger.debug(
              `astroConfig.srcDir="${astroConfig.srcDir}"; astroConfig.root="${astroConfig.root}"`
            );
            const defaultMediaFolderSearch: string[] = [
              "src/assets/media",
              "src/assets/images",
              "public/assets/media",
              "public/assets/images",
              "src/assets",
              "public/assets",
              "assets/images",
              "assets/media",
              "assets",
              "public",
            ];
            defaultMediaFolderSearch.every((dir) => {
              const fqdir = path.resolve(fileURLToPath(astroConfig.root), dir);
              logger.debug(
                `Because "media_folder" was not set we check existence of "${fqdir}".`
              );
              if (fs.existsSync(fqdir)) {
                logger.warn(
                  `We are using config.media_folder='${dir}' as default because not specified by configuration. Please set "config.media_folder" even if this directory is the right one.`
                );
                cmsConfig.media_folder = dir;
                return false;
              }
              return true;
            });
          }
          const fqdir = path.resolve(fileURLToPath(astroConfig.root), cmsConfig?.media_folder || "__not_defined__");
          if (!fs.existsSync(fqdir)) {
            throw new Error(
              `Please define a existing subdirectory of "${astroConfig.root}" for StaticCMS "config.media_folder" instead of "${cmsConfig?.media_folder}". "${fqdir}" does not exists.`
            );
          }
          const newConfig: AstroUserConfig = {
            // Default to the URL provided by Netlify when building there. See:
            // https://docs.netlify.com/configure-builds/environment-variables/#deploy-urls-and-metadata
            site: astroConfig.site || process.env.URL,
            vite: {
              /* Vite Plugin API
               * (https://vitejs.dev/guide/api-plugin.html) */
              plugins: [
                VitePluginAstroStaticCMS({
                  config: cmsConfig,
                  previewStyles,
                  previewTemplates,
                  injectBeforeInitStaticCMS,
                  minLogLevel
                }),
              ],
            },
          };
          logger.debug(`Using the following site: "${newConfig.site}"`);
          updateConfig(newConfig);
          currentAstroConfig = {...astroConfig};
          injectRoute({
            pattern: editorPath,
            entryPoint:
              "@grewety/astro-static-cms/StaticCMSEditorUIRoute/staticcms-editor-ui.astro",
          });
        }
      },
      "astro:build:setup": ({vite}: HookParameters<"astro:build:setup">) => {
        logger.debug("astro:build:setup");
        logger.debug(vite);
      },
      "astro:build:ssr": (options: HookParameters<"astro:build:ssr">) => {
        logger.debug("astro:build:ssr");
        logger.debug(options.manifest);
      },
      "astro:build:done": (/*options: HookParameters<"astro:build:done">*/) => {
        logger.debug("astro:build:done");
      },
      "astro:server:start": (options: { address: AddressInfo }) => {
        logger.debug("astro:server:start", JSON.stringify(options, null, 2));
        defaultProxyServerPort = options.address.port + 100;
        if (startDefaultProxyServer && currentAstroConfig?.root) {
          const git_dir = fileURLToPath(currentAstroConfig?.root);
          const git_check = path.resolve(git_dir, '.git', 'config');
          if (!fs.existsSync(git_check)) {
            logger.error(`Check for ${git_check} failed. A Git repository in ${git_dir} is mandatory for @staticcms/proxy-server.`);
          }
          const run_proxy_server = path.join(git_dir, "node_modules", ".bin", "static-cms-proxy-server");
          logger.info(
            `Start ${run_proxy_server} on port ${defaultProxyServerPort} from @staticcms/proxy-server in following directory: ${git_dir}`
          );
          proxy = spawn(run_proxy_server, {
            stdio: "inherit",
            // Run in shell on Windows to make sure the npm package can be found.
            shell: process.platform === 'win32',
            cwd: git_dir, // or set GIT_REPO_DIRECTORY environment variable to it
            env: {...process.env, 'PORT': defaultProxyServerPort.toString()}
          });
          proxy.on('spawn', () => {
            logger.debug(`static-cms-proxy-server spawned.`);
          });
          proxy.on('error', (code) => {
            logger.warn(`static-cms-proxy-server could not be spawned (${code}). Maybe @staticcms/proxy-server is not installed/in your dependencies or an Git repository does not exist.`);
          });
          proxy.on('exit', (code) => {
            if (code != null) {
              logger.warn(`static-cms-proxy-server process on port ${defaultProxyServerPort} exited with code ${code}. Maybe @staticcms/proxy-server is not installed/in your dependencies or an Git repository does not exist.`);
            }
            logger.debug(`static-cms-proxy-server process exited with code ${code}`);
          });
          process.on("exit", (code) => {
            logger.info(`Main process stopped with code ${code}.`);
            killProxy();
          });
        }
      },
      "astro:server:done": () => {
        logger.debug("astro:server:done");
        killProxy();
      },
    },
  };
  return AstroStaticCMSIntegration;
}
