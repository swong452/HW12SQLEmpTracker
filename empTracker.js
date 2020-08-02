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
                "View Employee", "View Employee By Manager", "View Departments", "Add Department", "Remove Department",
                "View Roles", "Add Role", "Remove Role", "Update Role", "Quit"],
            message: "Please choose one option"
        }).then(function (choice) {

            switch (choice.selection) {
                case "Add Employee":
                    return empInfo();
                case "Remove Employee":
                    return removeEmp();
                case "Update Employee Manager":
                    return updateMgr();
                case "View Employee":
                    return viewEmp();
                case "View Employee By Manager":
                    return viewEmpByMgr();
                case "Add Role":
                    return addNewRole();
                case "View Roles":
                    return viewRoles();
                case "Remove Role":
                    return removeRole();
                case "Update Role":
                    return updateRole();
                case "Add Department":
                    return addNewDept();
                case "View Departments":
                    return viewDept();
                case "Remove Department":
                    return removeDept();
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
        { type: "input", name: "mgrLastN", message: "What is new employee Manager last name (if no, hit enter) ?" },
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


// removeDept(): delete a dept; and all the role, and employee tied to that dept
async function removeDept() {
    console.log("Remove Dept, and subsequent role and associated employees of that Dept");

    // Create a current Role List array 
    const deptList = await db.listAllDept();

    // convert previously created department object, into new array that
    // only has 2 x kv pair. Such that, this new arry used in inquirer prompt
    const deptChoice = deptList.map(({ name, id }) => ({
        name: name,
        value: id
    }));

    // Create an object deptData 
    const deptData = await prompt([
        {
            type: "list",
            name: "dept_id",
            message: "Which department you like to shutdown & delete ?",
            choices: deptChoice
        }
    ]);

    var delDept = await db.deleteDept(deptData.dept_id);
    startMenu();
} // end removeDept




// Add new employee
async function addEmp(empData, roleID) {

    // If empData.manager !="" Search for Manager ID.
    if (empData.mgrFirstN.length > 0) {
        const empIDArray = await db.getEmpID(empData.mgrFirstN, empData.mgrLastN);

        if (empIDArray.length > 0) {
            // This manager actually exists with a valid employee id
            var newEmp = await db.addEmp(empData.firstN, empData.lastN, roleID, empIDArray[0].id);
            startMenu();
        }
    } else {
        // Else, default mgrID = Null.
        console.log("No Manager defined");
        var newEmp = await db.addEmpNoMgr(empData.firstN, empData.lastN, roleID);
        startMenu();
    }

} // end addEmp


// removeEmp(): List out all Employee first , user choose which one to delete
async function removeEmp() {
    console.log("Start removeEmp");

    // Idea is to construct an array which has all the employee name
    // Display those choices using console.table
    // Then, use await prompt, list out all choices
    // Once user selected, pass that user to next sql statement to remove.

    const empList = await db.listAllEmp();

    // Create a current emp List array 
    const empChoice = empList.map(({ first_name, last_name, id }) => ({
        name: `${first_name} ${last_name}`,
        value: id
    }));

    // Create an object empData that ask which emp you want role update ?
    const empData = await prompt([
        {
            type: "list",
            name: "emp_id",
            message: "Which employee would you like to Delete ?",
            choices: empChoice
        }
    ]);

    var delEmp = await db.deleteEmp(empData.emp_id);
    startMenu();
} // end removeEmp()


// addNewRole(): Add a new role ONLY - not necessary add new emp
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

    addRole(roleData, roleData.dept_id, false);
} // end addNewRole



// Add existing OR New Title to the Role table from New Employee
async function addRole(empData, deptID, newEmp = true) {

    // Check if Role or Title exists.
    var role = await db.ifRoleExist(empData.title);
    // when select statement return sth, response array len > 0 
    // meaning this Role already exist.
    if (role.length > 0) {
        // As Role already exists. Extract this Role ID, and pass to addEmp()
        var roleID = await db.getRoleID(empData.title);

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


// Update an existing Title to the Roles available from row table
async function updateRole() {
    console.log("Update current role to a New role");

    // List out the emp that needs role to be updated:
    const empList = await db.getEmpNameID();


    // Create a current emp List array 
    const empChoice = empList.map(({ first_name, last_name, id }) => ({
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



// removeRole(): delete a role; and all the employee tied to that role. 
async function removeRole() {
    console.log("Remove role and associated employee");

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
            message: "Which new role you like to delete ?",
            choices: roleChoice
        }
    ]);

    var updateRole = await db.deleteRole(roleData.role_id);
    startMenu();
} // end removeRole






// updateMgr(): Update an employee's Manger, to another new Manager
// Basically update the employee mgr_id , to another employee ID that you select. 
async function updateMgr() {
    console.log("Update employee Manger");

    // List out all employee
    const empList = await db.listAllEmp();

    // Create a current emp List array 
    const empChoice = empList.map(({ first_name, last_name, id }) => ({
        name: `${first_name} ${last_name}`,
        value: id
    }));

    // Create an object empData that ask which emp you want role update ?
    const empData = await prompt([
        {
            type: "list",
            name: "emp_id",
            message: "Which employee would you like , to move to another new manager ?",
            choices: empChoice
        },
        {
            type: "list",
            name: "newMgr_id",
            message: "Which employee would you like to promot to the new Manager, of the previously choosen employee ?",
            choices: empChoice
        },
    ]);

    console.log("empData obj with new Manger is: ", empData);
    var updateMgr = await db.updateMgr(empData.emp_id, empData.newMgr_id);
    startMenu();

} // end updateMgr




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

// List out all Empy by manager
async function viewEmpByMgr() {
    // List out all manager first
    const mgrList = await db.listMgr();

    // Create a current Mgr List array 
    const mgrChoice = mgrList.map(({ first_name, last_name, id }) => ({
        name: `${first_name} ${last_name}`,
        value: id
    }));
    console.log("mgChoice:", mgrChoice);

    // Create an object mgrData that ask which mgr you want to choose ?
    const mgrData = await prompt([
        {
            type: "list",
            name: "mgr_id",
            message: "Which manager would you like to see, his/her team members ?",
            choices: mgrChoice
        }
    ]);

    // Find all the employee that has this Manager_id
    const empMgrList = await db.listEmpByMgr(mgrData.mgr_id);
    console.table(empMgrList);
    startMenu();
} // end viewEmpByMgr

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


