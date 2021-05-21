
const knexConfig = require('knex');
const knex = knexConfig({
    client: 'pg',
    connection: {
    host : 'localhost',
    user : 'postgres',
    password : 'masterkey',
        database : 'ProjectManagerV2'
    }
});

exports.getKnex = () => {

    return knex;
};