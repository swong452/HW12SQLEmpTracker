drop database if exists employeeDB;

create database employeeDB;

use employeeDB;

create table department (
    id int not null auto_increment primary key,
    name varchar(30) unique not null
);

create table roles (
    id int unsigned auto_increment primary key,
    title varchar(30) unique not null,
    salary decimal (10,2) unsigned not null,
    department_id int unsigned not null,
    constraint dept_role_fk foreign key (department_id) references department (id) on delete cascade
);

create table employee (
    id int unsigned auto_increment primary key,
    first_name varchar(30) not null,
    last_name varchar(30) not null,
    role_id int unsigned not null,
    manager_id int unsigned,
    constraint role_emp_fk foreign key (role_id) references roles (id) on delete cascade,
    constraint manager_emp_fk foreign key (manager_id) references employee (id) on delete set null
);