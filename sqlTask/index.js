// Create a Class called empCRUD where it has various function 
// related to view, add, remove , or update employee using mySQL
// Since it is using mysql ; it needs input of a connection object,
// which is returned by connection.js

const connection = require("./connection");

class empCRUD {
    constructor (connection) {
        this.connection = connection;
    }

    // List all employee info 
    listAllEmp() {
        var listEmp = "select * from employee;"

        // this connection.query return result
        //this.connection.query(listEmp, function (err, res) {
        //    console.log("query result", res);
        //})

        // This, however, does not...
        return this.connection.query(listEmp);
        //console.log("executed query", emplist);
        //return emplist;
    }
}

// Here we initiated an instace of class empCURD by passing in the connection obj in
module.exports = new empCRUD (connection)