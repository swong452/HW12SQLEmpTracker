var inquirer = require("inquirer");
const { prompt } = require("inquirer");
const db = require("./sqlTask");
require("console.table");

startMenu();

async function startMenu() {
    inquirer.prompt(
        {
            type: "list",
            name: "selection",
            choices: ["Add Employee", "Remove Employee", "Update Employee Manager",
                "View Employee", "Add Department", "Remove Department", "View Departments",
                "Add Role", "Remove Role", "View Roles", "Update Role", "Quit"],
            message: "Please choose one option"
        }).then(function (choice) {

            switch (choice.selection) {
                case "Add Employee":
                    return empInfo();  // Start to add dept, then will call addRole() and addEmp()
                case "Remove Employee":
                    return removeEmp();
                case "Update Employee Manager":
                    return updateEmp();
                case "View Employee":
                    return viewEmp();
                case "Add Role":
                    return addNewRole();
                case "View Roles":
                    return viewRoles();
                case "Update Role":
                    return updateRole();
                case "Add Department":
                    return addNewDept();
                case "View Departments":
                    return viewDept();
                default:
                    return quit();
            }
        })
}

// This function will collect new employee data. ANd try to Department first
async function empInfo() {
    console.log("Collect New Employee Info");
    // Collect new employee info
    inquirer.prompt([

        { type: "input", name: "firstN", message: "What is new employee First Name ?" },
        { type: "input", name: "lastN", message: "What is new employee Last Name ?" },
        { type: "input", name: "dept", message: "What is new employee Dept ?" },
        { type: "input", name: "title", message: "What is new employee Title ?" },
        { type: "input", name: "salary", message: "What is new employee Salary ?" },
        { type: "input", name: "mgrFirstN", message: "What is new employee Manager first name (if no, hit enter) ?" },
        { type: "input", name: "mgrlastN", message: "What is new employee Manager last name (if no, hit enter) ?" },
    ]).then(async function (empData) {

        //Add Dept if not exists
        var dept = await db.ifDeptExist(empData.dept);
        console.log("dept returned", dept);
        if (dept.length > 0) {
            // As Dept already exists. No need to add new dept. Go to check role
            console.log("This dept already exists");

            // Get the current DeptID; pass it to create new Role if needed
            var deptID = await db.getDeptID(empData.dept);
            addRole(empData, deptID[0].id, true)
        } else {
            // New department
            var newDept = await db.addDept(empData.dept);
            addRole(empData, newDept.insertId, true);
        }

    }) // end .then
} // end addDept


// Add a new Dept Without adding new Emp
async function addNewDept() {
    console.log("Add Brand New Dept");

    // Create an object roleData that has these fields: title, salary, and department
    const deptData = await prompt([
        {
            name: "dept",
            message: "What is the name of the new Department?"
        }
    ]);
    console.log("New deptData obj: ", deptData);
    var newDept = await db.addDept(deptData.dept);
    startMenu();
} // end addNewRole



// Add a new role ONLY - not necessary add new emp
async function addNewRole() {
    console.log("Add Brand New role");

    // Create a Department List array with all fields from mysql
    const departments = await db.listAllDept();

    // convert previously created department object, into new array that
    // only has 2 x kv pair. Such that, this new arry used in inquirer prompt
    const deptChoice = departments.map(({ id, name }) => ({
        name: name,
        value: id
    }));

    console.log("new deptChoice", deptChoice);

    // Create an object roleData that has these fields: title, salary, and department
    const roleData = await prompt([
        {
            name: "title",
            message: "What is the name of the Newrole?"
        },
        {
            name: "salary",
            message: "What is the salary of the role?"
        },
        {
            type: "list",
            name: "dept_id",
            message: "Which department does the role belong to?",
            choices: deptChoice
        }
    ]);
    console.log("New roleData obj: ", roleData);
    addRole(roleData, roleData.dept_id, false);
} // end addNewRole


// Add existing OR New Title to the Role table from New Employee
async function addRole(empData, deptID, newEmp = true) {
    console.log("From new emp - check Role with these 2 x param:", empData, deptID);
    //Check if Title already exists

    var role = await db.ifRoleExist(empData.title);
    // when select statement return sth, response array len > 0 
    // meaning this Role already exist.
    if (role.length > 0) {
        // As Role already exists. Extract this Role ID, and pass to addEmp()
        var roleID = await db.getRoleID(empData.title);
        console.log("This Role already exists with Role ID", roleID, roleID[0].id);
        if (newEmp == true) {
            addEmp(empData, roleID[0].id);
        } else {
            // For add new role, after checking, just get back to menu
            startMenu();
        }
    } else {
        // Create new role using the passed in department iD
        var newRole = await db.addRole(empData.title, empData.salary, deptID);
        // if empData.manager != NULL, select the mgr id from employee table
        // then pass this id to addEmp()
        if (newEmp == true) {
            addEmp(empData, newRole.insertId) // Pass that role ID, to employee tbl to fill role_id field 
        } else {
            // For add new role, after checking, just get back to menu
            startMenu();
        }
    };
} // end addRole


// Add new employee
async function addEmp(empData, roleID) {
    console.log("Add emp with these 2 x param:", empData, roleID);

    // If empData.manager !="" Search for Manager ID.
    if (empData.mgrFirstN.length > 0) {
        const empIDArray = await db.getEmpID(empData.mgrFirstN, empData.mgrLastN);
        console.log("employee ID array: ", empIDArray);
        if (empIDArray.length > 0) {
            // This manager actually exists with a valid employee id
            var newEmp = await db.addEmp(empData.firstN, empData.lastN, roleID, empIDArray[0].id);
        }
        //var newEmp = await db.addEmp(empData.firstN, empData.lastN, roleID, mgrID);
    } else {
        // Else, default mgrID = Null.
        console.log("No Manager defined");
        var newEmp = await db.addEmpNoMgr(empData.firstN, empData.lastN, roleID);
    }
    //console.log("new employee added", newEmp);
    startMenu();
}



// Update an existing Title to the Roles available from row table
async function updateRole() {
    console.log("Update current role to a New role");

    // List out the emp that needs role to be updated:
    const empList = await db.getEmpNameID();
    //console.log("get emp id :", empList);

    // Create a current emp List array 
    const empChoice = empList.map(({first_name, last_name, id }) => ({
        name: `${first_name} ${last_name}`,
        value: id
    }));

    // Create an object empData that ask which emp you want role update ?
    const empData = await prompt([
        {
            type: "list",
            name: "emp_id",
            message: "Which employee you want role updated ?",
            choices: empChoice
        }
    ]);

    // Create a current Role List array 
    const roleList = await db.listAllRoles();

    // convert previously created department object, into new array that
    // only has 2 x kv pair. Such that, this new arry used in inquirer prompt
    const roleChoice = roleList.map(({ id, title }) => ({
        name: title,
        value: id
    }));

    // Create an object roleData 
    const roleData = await prompt([
        {
            type: "list",
            name: "role_id",
            message: "Which new role you like to assign ?",
            choices: roleChoice
        }
    ]);
    console.log("Choosen roleData obj: ", empData.emp_id, roleData.role_id);
    var updateRole = await db.updateRole(empData.emp_id, roleData.role_id);
    startMenu();

} // end updateRole







// removeEmp(): List out all Employee first
// Then let user choose an employee, and delete
async function removeEmp() {
    console.log("Start removeEmp");

    // Idea is to construct an array which has all the employee name
    // Display those choices using console.table
    // Then, use await prompt, list out all choices
    // Once user selected, pass that user to next sql statement to remove.

}


async function viewDept() {
    const deptList = await db.listAllDept();
    console.table(deptList);
    startMenu();
}


async function viewEmp() {
    const empList = await db.listAllEmp();
    console.table(empList);
    startMenu();
}


async function viewRoles() {
    const roleList = await db.listAllRoles();
    console.table(roleList);
    startMenu();
}


// Quit() would just not return to the menu
async function quit() {
    console.log("Good bye");
    process.exit();
}


