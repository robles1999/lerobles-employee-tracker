const inquirer = require("inquirer");
const mysql = require("mysql2/promise");
const art = require("../assets/art/ascii");
require("dotenv").config();

class EmployeeTrackerSystem {
  constructor() {
    this.connection = null;
  }
  // Connection to mySQL db
  async connectToDB() {
    try {
      this.connection = await mysql.createConnection({
        host: "localhost",
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
      });
      this.startApp();
    } catch (error) {
      console.log("Error connecting to the database: " + error.message);
    }
  }

  async startApp() {
    try {
      console.log(art()); // Show ascii art on top of menu

      // Prompt user to select an action to perform
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
          "Quit",
        ],
      });

      // Call the appropriate function based on user's choice
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
        case "Quit":
          break;
      }
    } catch (error) {
      console.log("Error performing action: " + error.message);
    } finally {
      // Prompt user to return to the main menu or exit the application
      const { returnToMainMenu } = await inquirer.prompt({
        type: "confirm",
        name: "returnToMainMenu",
        message: "Do you want to return to the main menu?",
        default: true,
      });

      if (returnToMainMenu) {
        await this.startApp();
      } else {
        console.log("Thank you for using our employee tracker system!");
      }
    }
  }

  //!:::::::::::::::::: VIEW ALL DEPARTMENTS ::::::::::::::::::
  async viewAllDepartments() {
    // Query the database for all departments
    const [rows] = await this.connection.query(
      "SELECT id, name FROM departments"
    );

    // Console log the departments in a formatted table
    console.table(rows);
  }

  //!:::::::::::::::::::: VIEW ALL ROLES ::::::::::::::::::::::
  async viewAllRoles() {
    // Query the database for all roles, including the corresponding department for each role
    const [rows] = await this.connection.query(`
      SELECT roles.id, roles.title, roles.salary, departments.name AS department
      FROM roles
      LEFT JOIN departments ON roles.department_id = departments.id
    `);

    // Console log the roles in a formatted table
    console.table(rows);
  }

  //!::::::::::::::::: VIEW ALL EMPLOYEES ::::::::::::::::::
  async viewAllEmployees() {
    // Query the database for all roles, including the corresponding department for each role
    const [rows] = await this.connection
      .query(`SELECT employees.id, employees.first_name, employees.last_name, roles.title, departments.name AS department, roles.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager
    FROM employees
    JOIN roles ON employees.role_id = roles.id
    JOIN departments ON roles.department_id = departments.id
    LEFT JOIN employees AS manager ON employees.manager_id = manager.id
  `);

    // Print the roles in a formatted table
    console.table(rows);
  }

  //!:::::::::::::::::: ADD A DEPARTMENT ::::::::::::::::::
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

  //!:::::::::::::::::: ADD A ROLE ::::::::::::::::::
  async addRole() {
    try {
      // Retrieve all the departments from the departments table
      // to make the list available to the inquirer prompt
      const departments = await this.connection.query(
        `select * from departments`
      );

      const departmentChoices = departments[0].map((department) => ({
        name: department.name,
        value: department.id,
      }));

      console.log("Department Choices:", departmentChoices);

      const answers = await inquirer.prompt([
        {
          type: "input",
          name: "title",
          message: "Enter the title of the role:",
        },
        {
          type: "input",
          name: "salary",
          message: "Enter the salary of the new role:",
        },
        {
          type: "list",
          name: "department",
          message: "Choose the department for the new role:",
          choices: departmentChoices,
        },
      ]);

      this.connection.query(
        `INSERT INTO roles SET ?`,
        {
          title: answers.title,
          salary: answers.salary,
          department_id: answers.department,
        },
        (err, res) => {
          if (err) throw err;
          console.log(`${res.affectedRows} role added.`);
          this.startApp();
        }
      );
    } catch (err) {
      console.log(err);
    }
  }

  //!:::::::::::::::::: ADD AN EMPLOYEE ::::::::::::::::::
  async addEmployee() {
    try {
      // Retrieve all the departments from the departments table
      // to make the list available to the inquirer prompt
      const departments = await this.connection.query(
        `select * from departments`
      );

      const departmentChoices = departments[0].map((department) => ({
        name: department.name,
        value: department.id,
      }));

      // Retrieve all the roles from the roles table
      // to make the list available to the inquirer prompt
      const roles = await this.connection.query(`SELECT * FROM roles`);
      const roleChoices = roles[0].map((role) => ({
        name: role.title,
        value: role.id,
      }));
      // console.log("Role Choices:", roleChoices);

      // Ask whether the employee is a manager or not
      const { isManager } = await inquirer.prompt({
        type: "confirm",
        name: "isManager",
        message: "Is this new employee going to hold a managers position?",
      });

      let managerChoices = [];

      if (!isManager) {
        // Retrieve all the employees from the employees table
        // to make the list of managers available to the inquirer prompt
        // If the employee has a manager_id of NULL that means the
        // employee role is MANAGER.
        const employees = await this.connection.query(
          `SELECT * FROM employees`
        );
        managerChoices = employees[0]
          .filter((employee) => employee.manager_id === null) // Only include employees who are managers
          .map((manager) => ({
            name: `${manager.first_name} ${manager.last_name}`,
            value: manager.id,
          }));
        console.log("Manager Choices:", managerChoices);
      }

      const answers = await inquirer.prompt([
        {
          type: "input",
          name: "first_name",
          message: "Enter the first name of the employee:",
        },
        {
          type: "input",
          name: "last_name",
          message: "Enter the last name of the employee:",
        },
        {
          type: "list",
          name: "role",
          message: "Choose the employee's role:",
          choices: roleChoices,
        },
        {
          type: "list",
          name: "department",
          message: "Choose the department for the new role:",
          choices: departmentChoices,
        },
        {
          // Only ask this question if the employee is not a manager
          type: "list",
          name: "manager_id",
          message: "Choose the employee's manager:",
          choices: managerChoices,
          when: !isManager,
        },
      ]);

      // Insert the new employee into the employees table
      const [result] = await this.connection.query(
        `INSERT INTO employees (first_name, last_name, role_id, manager_id)
    VALUES (?, ?, ?, ?)`,
        [
          answers.first_name,
          answers.last_name,
          answers.role,
          answers.manager_id || null,
        ]
      );

      console.log(
        `Added employee ${answers.first_name} ${answers.last_name} with ID ${result.insertId}.`
      );
    } catch (error) {
      console.log("Error adding employee: " + error.message);
    }
  }

  //!::::::::::::::: UPDATE AN EMPLOYEE ROLE ::::::::::::::::::
  async updateEmployeeRole() {
    try {
      // Retrieve all the employees from the employees table
      // to make the list available to the inquirer prompt
      const employees = await this.connection.query(`SELECT * FROM employees`);

      const employeeChoices = employees[0].map((employee) => ({
        name: `${employee.first_name} ${employee.last_name}`,
        value: employee.id,
      }));

      // Retrieve all the roles from the roles table
      // to make the list available to the inquirer prompt
      const roles = await this.connection.query(`SELECT * FROM roles`);

      const roleChoices = roles[0].map((role) => ({
        name: role.title,
        value: role.id,
      }));

      const answers = await inquirer.prompt([
        {
          type: "list",
          name: "employeeId",
          message: "Choose the employee to update:",
          choices: employeeChoices,
        },
        {
          type: "list",
          name: "roleId",
          message: "Choose the new role for the employee:",
          choices: roleChoices,
        },
      ]);

      // Update the employee's role in the employees table
      const [result] = await this.connection.query(
        `UPDATE employees SET role_id = ? WHERE id = ?`,
        [answers.roleId, answers.employeeId]
      );

      console.log(`${result.affectedRows} employee updated.`);
    } catch (error) {
      console.log("Error updating employee role: " + error.message);
    }
  }
}

module.exports = EmployeeTrackerSystem;
