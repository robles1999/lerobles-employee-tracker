const inquirer = require("inquirer");
const mysql = require("mysql2");

class EmployeeTrackerSystem
{
    constructor()
    {
        console.log('Application started!')
    }
    // Connection to mySQL db
    start()
    {
        const db = mysql.createConnection(
          {
            host: "localhost",
            // MySQL username,
            user: "root",
            // MySQL password
            password: "LuisMySQL1",
            database: "employee_tracker_db",
          },
          console.log(`Connected to the employee_tracker_db.`)
        );
    }
    

}

module.exports = EmployeeTrackerSystem;