
const fs = require('fs');

const knexConfig = require('knex');
const knex = knexConfig({
    client: 'pg',
    connection: process.env.DATABASE_URL ? (process.env.DATABASE_URL + '?ssl=true') : {
        host : 'localhost',
        user : 'postgres',
        password : 'masterkey',
        database : 'ProjectManagerV2'
    }
});

exports.getKnex = () => {

    return knex;
};

exports.executeMigration = async () => {

    try {
        await knex.raw('SELECT id FROM users LIMIT 1');
    }
    catch(error) {

        if (error.message.indexOf('relation "users" does not exist') === -1) {

            return;
        }

        const script = fs.readFileSync('./api/database/scripts/migration-20210517.sql', 'utf-8');
        await knex.raw(script);
        console.log('Migração aplicada');
    }
};

const types = require("pg").types;
const TIMESTAMP_OID = 1114;
types.setTypeParser(TIMESTAMP_OID, function(value) {
    // Example value string: "2018-10-04 12:30:21.199"
    return value && new Date(value + "+00");
});