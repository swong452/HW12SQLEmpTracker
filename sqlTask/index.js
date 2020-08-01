// Create a Class called empCRUD where it has various function 
// related to view, add, remove , or update employee using mySQL
// Since it is using mysql ; it needs input of a connection object,
// which is returned by connection.js

const connection = require("./connection");

class empCRUD {
    constructor(connection) {
        this.connection = connection;
    }

    // Add New Employee
    addEmp(fname, lname, roleID, mgrID) {
        var insertSql = "insert into employee set first_name = ?, last_name = ?, role_id = ?, manager_id=?;"
        return this.connection.query(insertSql, [fname, lname, roleID, mgrID]);
    }

    // Add New Employee
    addEmpNoMgr(fname, lname, roleID) {
        var insertSql = "insert into employee set first_name = ?, last_name = ?, role_id = ?;"
        return this.connection.query(insertSql, [fname, lname, roleID]);
    }

    // List all employee info 
    listAllEmp() {
        // Notice at the end , we rename the table name from employee to manager. If keep using employee.id = employee.manager_id
        // you will get an error "Not unique table/alias"
        var listEmp = "select employee.id, employee.first_name, employee.last_name, roles.title, roles.salary, department.name as department , manager.first_name as manager from employee left join roles on employee.role_id  = roles.id left join department on roles.department_id = department.id left join employee manager on manager.id = employee.manager_id;"
        return this.connection.query(listEmp);
    }

    // ListAllDept
    listAllDept() {
        var listDeptSql = "select name, id from department;"
        return this.connection.query(listDeptSql);
    }

    // Retrieve Emp ID , and names only
    getEmpID() {
        var empIDSql = "select first_name, last_name, id from employee;"
        return this.connection.query(empIDSql);
    }


    // Check if dept exists
    ifDeptExist(dept) {
        var deptExist = "select name from department where name = ?;"
        return this.connection.query(deptExist, [dept]);
    }

    // Add new department 
    addDept(dept) {
        var insertSql = "insert into department set name = ?;"
        return this.connection.query(insertSql, [dept]);
    }

    // Retrieve dept ID , so Roles table use the same dept ID 
    getDeptID(dept) {
        var deptIDSql = "select id from department where name = ?;"
        return this.connection.query(deptIDSql, [dept]);
    }

    // check if current role exists
    ifRoleExist(role) {
        var roleExist = "select title from roles where title = ?;"
        return this.connection.query(roleExist, [role]);
    }

    // Add new Role
    addRole(role, salary, deptID) {
        var insertSql = "insert into roles set title = ?, salary = ?, department_id = ?;"
        return this.connection.query(insertSql, [role, salary, deptID]);
    }

    // Retrieve role ID , so emp table use the same role ID
    getRoleID(role) {
        var roleIDSql = "select id from roles where title = ?;"
        return this.connection.query(roleIDSql, [role]);
    }

    updateRole(empID, roleID) {
        var updateRoleSql = "update employee set role_id = ? where id = ?;"
        return this.connection.query(updateRoleSql, [roleID, empID]);
    }

    // List All Roles
    listAllRoles() {
        var listRolesSql = "select roles.id, roles.title, roles.salary, department.name as department from roles left join department on roles.department_id = department.id;"
        return this.connection.query(listRolesSql);
    }





} // end Class

// Here we initiated an instace of class empCURD by passing in the connection obj in
module.exports = new empCRUD(connection)