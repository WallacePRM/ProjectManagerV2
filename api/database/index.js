
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

const types = require("pg").types;
const TIMESTAMP_OID = 1114;
types.setTypeParser(TIMESTAMP_OID, function(value) {
    // Example value string: "2018-10-04 12:30:21.199"
    return value && new Date(value + "+00");
});