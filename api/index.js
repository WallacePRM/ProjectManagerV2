
(async () => {

    const routes = require('./routes');
    const { executeMigration } = require('./database/index');
    
    executeMigration();
    routes.startServer();
})();