const { Pool } = require("pg");
const { port, user, password } = require("pg/lib/defaults");

const dbPool = new Pool({
    database: "personalweb_kholisn",
    port: "5432",
    user: "postgres",
    password: "kholis1233"
})

module.exports = dbPool;