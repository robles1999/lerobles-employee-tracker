const inquirer = require("inquirer");
const mysql = require("mysql2/promise");

class EmployeeTrackerSystem {
  constructor() {
    this.connection = null;
  }
  // Connection to mySQL db
  async connectToDB() {
    try {
      this.connection = await mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "LuisMySQL1",
        database: "employee_tracker_db",
      });
      console.log(`Connected to the employee_tracker_db.`);
      this.startApp();
    } catch (error) {
      console.log("Error connecting to the database: " + error.message);
    }
  }

  // Menu prompt
  async startApp() {
    console.log("Application started!");
    try {
      // prompt user to select an action to perform
      const { action } = await inquirer.prompt({
        type: "list",
        name: "action",
        message: "What would you like to do?",
        choices: [
          "View all departments",
          "View all roles",
          "View all employees",
          "Add a department",
          "Add a role",
          "Add an employee",
          "Update an employee's role",
          "Exit",
        ],
      });

      // call the appropriate function based on user's choice
      switch (action) {
        case "View all departments":
          await this.viewAllDepartments();
          break;
        case "View all roles":
          await this.viewAllRoles();
          break;
        case "View all employees":
          await this.viewAllEmployees();
          break;
        case "Add a department":
          await this.addDepartment();
          break;
        case "Add a role":
          await this.addRole();
          break;
        case "Add an employee":
          await this.addEmployee();
          break;
        case "Update an employee's role":
          await this.updateEmployeeRole();
          break;
        case "Exit":
          console.log("Thank you for using our employee management system!");
          break;
      }
    } catch (error) {
      console.log("Error performing action: " + error.message);
    } finally {
      // prompt user to return to the main menu or exit the application
      const { returnToMainMenu } = await inquirer.prompt({
        type: "confirm",
        name: "returnToMainMenu",
        message: "Do you want to return to the main menu?",
        default: true,
      });
      if (returnToMainMenu) {
        await this.startApp();
      } else {
        console.log("Thank you for using our employee management system!");
      }
    }
  }

  //:::::::::::::::::: VIEW ALL DEPARTMENTS ::::::::::::::::::
  async viewAllDepartments() {
    // query the database for all departments
    const [rows] = await this.connection.query(
      "SELECT id, name FROM departments"
    );

    // print the departments in a formatted table
    console.table(rows);
  }

  //:::::::::::::::::::::: VIEW ALL ROLES ::::::::::::::::::::::
  async viewAllRoles() {
    // query the database for all roles, including the corresponding department for each role
    const [rows] = await this.connection.query(`
      SELECT roles.id, roles.title, roles.salary, departments.name AS department
      FROM roles
      LEFT JOIN departments ON roles.department_id = departments.id
    `);

    // print the roles in a formatted table
    console.table(rows);
  }

  //:::::::::::::::::::: VIEW ALL EMPLOYEES ::::::::::::::::::::
  async viewAllEmployees() {
    // query the database for all roles, including the corresponding department for each role
    const [rows] = await this.connection
      .query(`SELECT employees.id, employees.first_name, employees.last_name, roles.title, departments.name AS department, roles.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager
    FROM employees
    JOIN roles ON employees.role_id = roles.id
    JOIN departments ON roles.department_id = departments.id
    LEFT JOIN employees AS manager ON employees.manager_id = manager.id
  `);

    // print the roles in a formatted table
    console.table(rows);
  }

  //:::::::::::::::::: ADD A DEPARTMENT ::::::::::::::::::
  async addDepartment() {
    try {
      const answers = await inquirer.prompt([
        {
          type: "input",
          name: "name",
          message: "Enter the name of the new department:",
        },
      ]);

      this.connection.query(
        `INSERT INTO departments SET ?`,
        { name: answers.name },
        (err, res) => {
          if (err) throw err;
          console.log(`${res.affectedRows} department added.`);
          this.startApp();
        }
      );
    } catch (err) {
      console.log(err);
    }
  }

  //:::::::::::::::::: ADD A ROLE ::::::::::::::::::
  //   INSERT INTO roles (title)
  // VALUES ("Sales Lead"),
  //        ("Salesperson"),n
    
  //        ("Lead Engineer"),
  //        ("Legal Team Lead");
  //        ("Lawyer");
  //:::::::::::::::::: ADD A EMPLOYEE ::::::::::::::::::
  //   INSERT INTO roles (first_name, last_name, role_id, manager_id)
  // VALUES ("John", "Doe", 1, ),
  //        ("Mike", "Chan", 2, 1);
}

module.exports = EmployeeTrackerSystem;
