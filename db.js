const mysql = require("mysql2/promise")
const { objectToValues } = require("sql-escaper")

const pool = mysql.createPool({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: 'escola',
    database: '3DSC'
})

module.exports = Object.freeze({
    pool: pool
})