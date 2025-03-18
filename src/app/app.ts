// dprint-ignore
import launcher from '@framework/launcher.js';
// dprint-ignore
import { apiRouter } from '@app/middleware/api.js';

(async () => {
    launcher.mainRouter.use('/api', apiRouter.routes(), apiRouter.allowedMethods());
    launcher.init().listen();
})();
