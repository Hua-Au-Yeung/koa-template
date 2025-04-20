// dprint-ignore
import Launcher from '@framework/launcher.js';
// dprint-ignore
import { apiRouter } from '@app/router/api-template.js';
// dprint-ignore
import { template } from '@app/middleware/template.js';

(async () => {
    const launcher = new Launcher({});
    launcher.addRouter('/api/v1', apiRouter.routes(), apiRouter.allowedMethods());

    launcher
        .addMiddleware(template);

    launcher
        .useMiddlewares()
        .serverListen();
})();
