
(async () => {

    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

    const routes = require('./routes');
    const { executeMigration } = require('./database/index');
    
    executeMigration();
    routes.startServer();
})();