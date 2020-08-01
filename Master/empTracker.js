var inquirer = require("inquirer");
//const sqlDB = require("./sqlTask");
//const db = require("../db");
const db = require("./sqlTask");
require("console.table");

startMenu();

function startMenu() {
    inquirer.prompt(
        {
            type: "list",
            name: "selection",
            choices: ["Add Employee", "Remove Employee", "Update Employee",
                "View Employee", "Add Department", "Remove Department", "View All Department",
                "Add Role", "Remove Role", "View All Roles"],
            message: "Please choose one option"
        }).then(function (choice) {

            switch (choice.selection) {
                case "Add Employee":
                //addDept();  // Start to add dept, then will call addRole() and addEmp()
                case "Remove Employee":
                    removeEmp();
                    break;
                case "Update Employee":
                    updateEmp();
                case "View Employee":
                    viewEmpScreen(); // View by Emp Manager
                default:
                //console.log("default");
            }
        })
}

// This function will collect new employee data. ANd try to Department first
function addDept() {
    console.log("Add employee Function");
    // Collect new employee info
    inquirer.prompt([

        { type: "input", name: "firstN", message: "What is new employee First Name ?" },
        { type: "input", name: "lastN", message: "What is new employee Last Name ?" },
        { type: "input", name: "dept", message: "What is new employee Dept ?" },
        { type: "input", name: "title", message: "What is new employee Title ?" },
        { type: "input", name: "salary", message: "What is new employee Salary ?" },
        { type: "input", name: "manager", message: "What is new employee Manager (if no, hit enter) ?" }
    ]).then(function (empData) {
        //Add Dept if not exists
        var deptExist = "select name from department where name = ?"
        connection.query(deptExist, [empData.dept], function (err, response) {
            console.log("Returned Res is:", response);
            //console.log("Returned Res NAME is:", response[0].name);

            // when select statement return sth, response is NOT an empty array [], 
            // meaning this is a new department
            if (response.length > 0) {
                // As Dept already exists. No need to add new dept. Go to check role
                console.log("This dept already exists");
                addRole(empData)
            } else {
                var insertSql = "insert into department set name = ?"
                connection.query(insertSql, [empData.dept], function (err, res) {
                    if (err) throw err;
                    console.log("Added Dept: ", res);
                    addRole(empData, res.insertId)
                });
            }
        })
    })
}

// Add unique Title to the Role table.
function addRole(empData, deptID) {
    console.log("Add Role with these 2 x param:", empData, deptID);
    //Check if Title already exists
    var roleExist = "select title from roles where title = ?"
    connection.query(roleExist, [empData.title], function (err, response) {
        console.log("Returned Role Res is:", response);

        // when select statement return sth, response array len > 0 
        // meaning this department already exist.
        if (response.length > 0) {
            // As Role already exists. No need to add new dept. Go to check role
            console.log("This Role alredy exists");
            // Need to extract this Role ID, and pass to addEmp()
            addEmp(empData, "3")
        } else {
            var insertSql = "insert into roles set title = ?, salary = ?, department_id = ?"
            connection.query(insertSql, [empData.title, empData.salary, deptID], function (err, res) {
                if (err) throw err;
                console.log("Added Role: ", res);
                // if empData.manager != NULL, select the mgr id from employee table
                // then pass this id to addEmp()

                addEmp(empData, res.insertId) // Pass that role ID, to employee tbl to fill role_id field 
            });
        }
    })
}


function addEmp(empData, roleID) {
    console.log("Add emp with these 2 x param:", empData, roleID);

    var insertSql = "insert into employee set first_name = ?, last_name = ?, role_id = ?"
    connection.query(insertSql, [empData.firstN, empData.lastN, roleID], function (err, res) {
        if (err) throw err;
        console.log("Added Emp: ", res);
        startMenu();
    });
}


// removeEmp(): List out all Employee first
// Then let user choose an employee, and delete
function removeEmp() {
    console.log("Start removeEmp");

    // Idea is to construct an array which has all the employee name
    // Display those choices using console.table
    // Then, use await prompt, list out all choices
    // Once user selected, pass that user to next sql statement to remove.

    /*
    var allEmpSql = "select last_name, first_name from employee"
    connection.query(allEmpSql, function (err, res) {
        if (err) throw err;
        // console.log("Added Emp: ", res);
        console.table(res);
    */
}


function viewEmpScreen() {
    const empList = db.listAllEmp();
    console.log("viewEmpScreen", empList);
    console.table(empList);
}



