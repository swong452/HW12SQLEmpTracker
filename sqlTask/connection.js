const mysql = require("mysql");
const util = require("util");

var connection = mysql.createConnection({
    user: "root",
    password: "password",
    host: "localhost",
    port: "3306",
    database: "employeeDB"
})

connection.connect();

// Later on, certain query needs to be asynchronously executed first, 
// while other funciton need to wait for those result,
// and continue
// i.e we need asyn and await feature
// to do that, connection.query which is a callback function
// need to be promisify.
connection.query = util.promisify(connection.query);

module.exports = connection;