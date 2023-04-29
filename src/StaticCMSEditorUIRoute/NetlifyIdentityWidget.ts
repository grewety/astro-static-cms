import identity from "netlify-identity-widget";
import { Logger } from "tslog";

const logger = new Logger({
  minLevel: 1 /* 0:silly 1:trace 2:debug 3:info 4:warn 5:error 6:fatal */,
});

export function NetlifyIdentityWidget(editorPath: string) {
  identity.on("init", (user) => {
    logger.debug(`NetlifyIdentityWidget init with user "${user}"`);
    if (!user) {
      identity.on("login", () => {
        document.location.href = editorPath;
      });
    }
  });
  logger.debug(`NetlifyIdentityWidget init for "${editorPath}"`);
  identity.init();
}
