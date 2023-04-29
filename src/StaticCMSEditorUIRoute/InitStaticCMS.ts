import CMS from "@staticcms/core";
import { Logger } from "tslog";
import type { InitStaticCMSOptions } from "./InitStaticCMSOptions.js";

const logger = new Logger({
  minLevel: 1 /* 0:silly 1:trace 2:debug 3:info 4:warn 5:error 6:fatal */,
});

/**
 * Initialise Static CMS (https://www.staticcms.org/docs/configuration-options)
 * @param config
 * @param previewStyles
 * @param previewTemplate Uses registerPreviewTemplate() (https://www.staticcms.org/docs/custom-previews) to assign
 *                        a React components for the corresponding collection.
 */
export default function initStaticCMS({
                                        config,
                                        previewStyles = [],
                                        previewTemplates = [],
                                        minLogLevel = 4,
                                      }: InitStaticCMSOptions) {
  logger.settings.minLevel = minLogLevel;
  try {
    logger.debug("Backend used:", JSON.stringify(config.backend, null, 2));
    CMS.init({
      config: {
        // Don’t try to load config.yml as we’re providing the config below
        load_config_file: false,
        ...config,
      },
    });
  } catch (e) {
    if (e instanceof Error)
      logger.error("StaticCMS initialisation: FAILED: " + e.message);
  }

  /**
   * One drawback of using Static CMS is that it registers all preview styles globally — not scoped
   * to a specific collection. You lose Astro components’ scoped styling anyway by being forced
   * to use React, but just be extra careful.
   * (https://docs.astro.build/de/guides/styling/#scoped-styles)
   *
   * The (undocumented?) `raw: true` setting treats the first argument as
   * a raw CSS string to inject instead of as a URL to load a stylesheet from.
   */
  previewStyles.forEach(({value, raw}) => {
    CMS.registerPreviewStyle(value, {raw});
  });

  // Definition of registerPreviewTemplate() function
  // (https://github.com/StaticJsCMS/static-cms/blob/main/packages/core/src/lib/registry.ts#L123)
  previewTemplates.forEach(([collection_name, component]) => {
    CMS.registerPreviewTemplate(collection_name, component);
  });
}
