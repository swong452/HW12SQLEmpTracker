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
       
        //var listEmp = "select employee.id, employee.first_name, employee.last_name, roles.title, roles.salary, department.name as department , employee.manager_id, concat(manager.first_name, \" \", manager.last_name) as manager from employee left join roles on employee.role_id  = roles.id left join department on roles.department_id = department.id left join employee manager on manager.id = employee.manager_id order by employee.first_name;"
        var listEmp = "select employee.id, employee.first_name, employee.last_name, roles.title, roles.salary, department.name as department , employee.manager_id, concat(manager.first_name, \" \", manager.last_name) as manager from employee left join roles on employee.role_id  = roles.id left join department on roles.department_id = department.id left join employee manager on employee.manager_id = manager.id order by employee.first_name;"
       
        return this.connection.query(listEmp);
    }

    // List all managers where manager_id field is non zero
    listMgr() {
        var listMgr = "select first_name, last_name, id from employee where id = ANY \
        (select manager_id from employee where manager_id is NOT NULL);"
        return this.connection.query(listMgr);
    }

    // List all employee info by manager_id
    listEmpByMgr(mgr_id) {
        var listEmpByMgr = "select employee.id, employee.first_name, employee.last_name, roles.title, roles.salary, department.name as department , employee.manager_id from employee left join roles on employee.role_id  = roles.id left join department on roles.department_id = department.id left join employee manager on manager.id = employee.manager_id where employee.manager_id = ? order by employee.first_name;"
        return this.connection.query(listEmpByMgr, [mgr_id]);
    }

    updateMgr(empID, mgrID) {
        var updateMgrSql = "update employee set manager_id = ? where id = ?;"
        return this.connection.query(updateMgrSql, [mgrID, empID]);
    }

    deleteEmp(empID) {
        var deleteEmpSql = "delete from employee where id = ?;"
        return this.connection.query(deleteEmpSql, [empID]);

    }
    // Retrieve Emp Name and ID only
    getEmpNameID() {
        var empNameIDSql = "select first_name, last_name, id from employee;"
        return this.connection.query(empNameIDSql);
    }

    // Retrieve Emp Name and ID only
    getEmpID(fname, lname) {
        var empIDSql = "select id from employee where first_name = ?;"
        return this.connection.query(empIDSql, [fname]);
    }

    // ListAllDept
    listAllDept() {
        var listDeptSql = "select name, id from department order by name;"
        return this.connection.query(listDeptSql);
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

    deleteDept(id) {
        var deleteDeptSql = "delete from department where id = ?;"
        return this.connection.query(deleteDeptSql, [id]);
    }


    // Retrieve dept ID , so Roles table use the same dept ID 
    getDeptID(dept) {
        var deptIDSql = "select id from department where name = ?;"
        return this.connection.query(deptIDSql, [dept]);
    }

    /*
    getDeptBudget() {
        var deptBgtSql = "SELECT department.id, department.name, SUM(roles.salary) AS Budget FROM employee LEFT JOIN roles on employee.role_id = roles.id LEFT JOIN department on roles.department_id = department.id GROUP BY department.id, department.name;"
        return this.connection.query(deptBgtSql);
    }
    */

    getDeptBudget() {
        var deptBgtSql = "SELECT department.id, department.name, SUM(roles.salary) AS Budget FROM department LEFT JOIN roles on department.id = roles.department_id LEFT JOIN employee on roles.id = employee.role_id GROUP BY department.id, department.name;"
        return this.connection.query(deptBgtSql);
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

    deleteRole(role_ID) {
        var deleteRoleSql = "delete from roles where id = ?;"
        return this.connection.query(deleteRoleSql, [role_ID]);
    }


    // Retrieve role ID from role table base on title
    getRoleID(role) {
        var roleIDSql = "select id from roles where title = ?;"
        return this.connection.query(roleIDSql, [role]);
    }

    // Retrieve role ID base on employee ID
    getRoleIDBaseEmpID(empID) {
        var roleIDBaseEmpIDSql = "select id from employee where id = ?;"
        return this.connection.query(roleIDBaseEmpIDSql, [empID]);
    }

    // Retrieve title base on role_id
    getRole() {
        var getRoleSql = "select title from employee where role_id = ?;"
        return this.connection.query(getRoleSql);
    }


    updateRole(empID, roleID) {
        var updateRoleSql = "update employee set role_id = ? where id = ?;"
        return this.connection.query(updateRoleSql, [roleID, empID]);
    }

    // List All Roles
    listAllRoles() {
        var listRolesSql = "select roles.id, roles.title, roles.salary, department.name as department from roles left join department on roles.department_id = department.id order by roles.title;"
        return this.connection.query(listRolesSql);
    }
} // end Class

// Here we initiated an instace of class empCURD by passing in the connection obj in
module.exports = new empCRUD(connection)