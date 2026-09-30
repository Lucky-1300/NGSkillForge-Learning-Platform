/**
 * Seed Data: MySQL Database & SQL Mastery
 */
module.exports = {
  title: 'MySQL Database & SQL Mastery',
  modules: [
    {
      title: 'Relational Database Concepts & SQL Basics',
      order: 1,
      description: 'Master relational modeling, primary and foreign keys, datatypes, and Data Definition Language (DDL).',
      lessons: [
        {
          title: 'Relational Schema Design & DDL Statements',
          type: 'text',
          duration: '22 mins',
          order: 1,
          content: `### 1. Relational Database Concepts
Relational databases structure data into strict 2D tables consisting of columns (attributes) and rows (tuples).
- **Primary Key (PK)**: Uniquely identifies each record in a table; cannot contain NULL.
- **Foreign Key (FK)**: Enforces referential integrity by pointing to the Primary Key of another table.

\`\`\`sql
-- Creating a Department Table
CREATE TABLE departments (
  department_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  location VARCHAR(150) DEFAULT 'Remote',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Creating an Employees Table with Foreign Key
CREATE TABLE employees (
  employee_id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  salary DECIMAL(10, 2) NOT NULL CHECK (salary >= 0),
  department_id INT,
  hired_at DATE NOT NULL,
  CONSTRAINT fk_emp_dept FOREIGN KEY (department_id) 
    REFERENCES departments(department_id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB;
\`\`\`

---

### 2. DDL Commands (CREATE, ALTER, DROP, TRUNCATE)
| Command | Effect | Rollback Support |
| :--- | :--- | :--- |
| \`ALTER TABLE\` | Modifies column definitions or adds constraints | Auto-committed in MySQL DDL |
| \`TRUNCATE TABLE\` | Fast-clears all rows and resets auto-increment ID counter | DDL operation (resets high-water mark) |
| \`DROP TABLE\` | Permanently deletes table structure and all data | Immediate deletion |`,
          notes: `• Always declare Primary Keys (AUTO_INCREMENT or UUID) for every relational table.
• Choose explicit data types (DECIMAL(10, 2) for currency, VARCHAR with realistic max lengths).
• Specify ON DELETE CASCADE or ON DELETE SET NULL on Foreign Keys to handle deletions gracefully.`,
          questions: [
            {
              id: 'q-mysql-1-1-1',
              question: 'Why should you use DECIMAL(10, 2) instead of FLOAT or DOUBLE for financial transactions?',
              code: 'salary DECIMAL(10, 2) NOT NULL',
              type: 'conceptual',
              options: [],
              answer: 'DECIMAL stores exact fixed-point numerical values, avoiding floating-point binary rounding errors that occur with FLOAT/DOUBLE.',
              explanation: 'Floating point numbers cannot accurately represent base-10 fractions (like 0.10 or 0.05) in binary, leading to critical financial discrepancies.',
              category: 'Datatypes',
              order: 1,
            },
          ],
          tasks: [
            {
              id: 't-mysql-1-1-1',
              taskNumber: 1,
              title: 'Create Normalized Students and Courses Tables in SQL',
              level: 'Level 1',
              category: 'DDL Schema',
              description: 'Write SQL statements to create a students table, a courses table, and an enrollments join table with composite primary keys and foreign key constraints.',
              requirements: [
                'Create students with student_id, full_name, and email UNIQUE',
                'Create courses with course_id, title, and price DECIMAL(8,2)',
                'Create enrollments with student_id, course_id, enrolled_at, and composite PRIMARY KEY (student_id, course_id)'
              ],
              example: 'CREATE TABLE enrollments (student_id INT, course_id INT, PRIMARY KEY (student_id, course_id));',
              hints: ['Use FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE.'],
              starterCode: `-- Write SQL DDL statements below\n`,
            },
          ],
        },
      ],
    },
    {
      title: 'Data Manipulation Language (DML) & Filtering',
      order: 2,
      description: 'Master SELECT queries, column aliasing, ORDER BY, LIMIT, OFFSET pagination, and WHERE filtering.',
      lessons: [
        {
          title: 'SELECT Queries, Filtering & Pagination Patterns',
          type: 'text',
          duration: '22 mins',
          order: 1,
          content: `### 1. SQL Query Execution Order
Although written starting with \`SELECT\`, SQL queries execute in this logical order:
\`\`\`
1. FROM / JOIN
2. WHERE
3. GROUP BY
4. HAVING
5. SELECT / Expressions / Aliases
6. DISTINCT
7. ORDER BY
8. LIMIT / OFFSET
\`\`\`

---

### 2. DML Operations & Advanced Filtering
\`\`\`sql
-- Inserting Records
INSERT INTO employees (first_name, last_name, email, salary, department_id, hired_at)
VALUES ('Ada', 'Lovelace', 'ada@example.com', 95000.00, 1, '2025-01-15');

-- Safe Update with WHERE
UPDATE employees 
SET salary = salary * 1.05 
WHERE department_id = 1 AND salary < 100000;

-- Pattern Matching with LIKE and REGEXP
SELECT employee_id, first_name, email 
FROM employees 
WHERE email LIKE '%@gmail.com' AND salary BETWEEN 50000 AND 90000
ORDER BY salary DESC 
LIMIT 10 OFFSET 0;
\`\`\``,
          notes: `• Because WHERE executes before SELECT, you cannot reference column aliases in the WHERE clause!
• Always include a WHERE clause on UPDATE and DELETE statements to prevent modifying entire tables.
• OFFSET pagination can become slow on millions of rows; prefer keyset/cursor pagination for massive tables.`,
          questions: [
            {
              id: 'q-mysql-2-1-1',
              question: 'Why will the following query fail with an error in standard SQL: SELECT salary * 12 AS annual_salary FROM employees WHERE annual_salary > 100000;?',
              code: 'SELECT salary * 12 AS annual_salary FROM employees WHERE annual_salary > 100000;',
              type: 'mcq',
              options: [
                'The WHERE clause executes before the SELECT clause, so the alias annual_salary does not exist yet',
                'SQL does not allow multiplication in queries',
                'annual_salary is a reserved SQL keyword',
                'Numbers greater than 100,000 must use single quotes'
              ],
              answer: 'The WHERE clause executes before the SELECT clause, so the alias annual_salary does not exist yet',
              explanation: 'Logically, SQL processes FROM -> WHERE -> SELECT. The alias defined in SELECT is evaluated after the WHERE filter finishes.',
              category: 'Query Execution Order',
              order: 1,
            },
          ],
          tasks: [
            {
              id: 't-mysql-2-1-1',
              taskNumber: 1,
              title: 'Write a Filtered & Paginated Course Catalog Query',
              level: 'Level 1',
              category: 'DML Queries',
              description: 'Construct a SQL query that retrieves course title, instructor, and price for all courses in category "Frontend" priced under $100, sorted by price ascending, page 2 (limit 5, offset 5).',
              requirements: [
                'Filter with WHERE category = "Frontend" AND price < 100',
                'Sort with ORDER BY price ASC',
                'Apply LIMIT 5 OFFSET 5'
              ],
              example: 'SELECT title, instructor, price FROM courses WHERE ... ORDER BY ... LIMIT 5 OFFSET 5;',
              hints: ['Page 2 with 5 items per page starts at offset (page - 1) * limit = 5.'],
              starterCode: `-- Write SQL query below\nSELECT \nFROM courses\n`,
            },
          ],
        },
      ],
    },
    {
      title: 'SQL Table Joins & Subqueries',
      order: 3,
      description: 'Master INNER, LEFT, RIGHT, FULL OUTER joins, Self Joins, Subqueries, and Common Table Expressions (CTEs).',
      lessons: [
        {
          title: 'Inner, Outer & Self Joins with CTEs',
          type: 'text',
          duration: '26 mins',
          order: 1,
          content: `### 1. Types of SQL Joins
- **INNER JOIN**: Returns records that have matching values in both tables.
- **LEFT JOIN (LEFT OUTER JOIN)**: Returns all records from the left table, plus matched records from the right table (unmatched right rows become NULL).
- **RIGHT JOIN**: Returns all records from the right table, plus matched records from the left table.
- **CROSS JOIN**: Computes the Cartesian product of all rows.

\`\`\`sql
-- Find All Students and their Enrolled Courses (Including Students with NO courses)
SELECT 
  s.student_id,
  s.full_name,
  COALESCE(c.title, 'Not Enrolled') AS course_title,
  e.enrolled_at
FROM students s
LEFT JOIN enrollments e ON s.student_id = e.student_id
LEFT JOIN courses c ON e.course_id = c.course_id
ORDER BY s.student_id;
\`\`\`

---

### 2. Common Table Expressions (CTEs) with \`WITH\`
CTEs create temporary named result sets that make complex multi-step queries clean and readable:

\`\`\`sql
WITH HighEarningDepartments AS (
  SELECT department_id, AVG(salary) AS avg_sal
  FROM employees
  GROUP BY department_id
  HAVING AVG(salary) > 80000
)
SELECT e.first_name, e.last_name, e.salary, d.name AS dept_name
FROM employees e
JOIN departments d ON e.department_id = d.department_id
JOIN HighEarningDepartments h ON d.department_id = h.department_id;
\`\`\``,
          notes: `• Use LEFT JOIN when you must preserve all rows from the primary table even if no related records exist.
• COALESCE(col, 'Default') substitutes fallback values for NULL.
• Common Table Expressions (WITH ...) improve query readability compared to deeply nested subqueries.`,
          questions: [
            {
              id: 'q-mysql-3-1-1',
              question: 'Which join type returns ALL rows from table A regardless of whether a matching record exists in table B?',
              code: 'SELECT * FROM TableA ??? JOIN TableB ON TableA.id = TableB.a_id;',
              type: 'mcq',
              options: ['LEFT JOIN', 'INNER JOIN', 'CROSS JOIN', 'RIGHT JOIN'],
              answer: 'LEFT JOIN',
              explanation: 'A LEFT JOIN guarantees that every row from the left table (TableA) appears in the result set, filling in NULL for missing TableB columns.',
              category: 'Joins',
              order: 1,
            },
          ],
          tasks: [
            {
              id: 't-mysql-3-1-1',
              taskNumber: 1,
              title: 'Find Customers Who Have Never Placed an Order',
              level: 'Level 2',
              category: 'Joins',
              description: 'Write a SQL query using a LEFT JOIN and WHERE IS NULL filter to find all customers who have never placed an order.',
              requirements: [
                'LEFT JOIN customers c to orders o on c.customer_id = o.customer_id',
                'Filter with WHERE o.order_id IS NULL',
                'Select customer_id, name, and email'
              ],
              example: 'SELECT c.customer_id, c.name FROM customers c LEFT JOIN orders o ON c.customer_id = o.customer_id WHERE o.order_id IS NULL;',
              hints: ['When a row has no match in the right table of a LEFT JOIN, its right columns will evaluate to NULL.'],
              starterCode: `-- Write SQL query\n`,
            },
          ],
        },
      ],
    },
    {
      title: 'Transactions (ACID) & B-Tree Indexing',
      order: 4,
      description: 'Understand ACID guarantees, multi-statement transactions, B-Tree index structures, and query execution plans with EXPLAIN.',
      lessons: [
        {
          title: 'ACID Transactions & B-Tree Query Optimization',
          type: 'text',
          duration: '25 mins',
          order: 1,
          content: `### 1. ACID Transaction Guarantees
- **Atomicity**: All operations in a transaction succeed together, or all are rolled back ("all or nothing").
- **Consistency**: The database moves from one valid state to another, enforcing all schema constraints.
- **Isolation**: Concurrent transactions cannot observe each other's partial, uncommitted intermediate states.
- **Durability**: Once a transaction is committed, changes survive power loss or system crashes via write-ahead logging (WAL / redo log).

\`\`\`sql
-- Bank Transfer Transaction
START TRANSACTION;

UPDATE accounts SET balance = balance - 500 WHERE account_id = 101;
UPDATE accounts SET balance = balance + 500 WHERE account_id = 202;

-- If any check fails, execute ROLLBACK; otherwise:
COMMIT;
\`\`\`

---

### 2. B-Tree Indexes & \`EXPLAIN\`
MySQL InnoDB uses **B-Tree indexes** where tree leaf nodes contain pointers (or clustered row data):
\`\`\`sql
CREATE INDEX idx_emp_dept_salary ON employees (department_id, salary);

EXPLAIN SELECT * FROM employees WHERE department_id = 5 AND salary > 60000;
\`\`\``,
          notes: `• Use transactions for multi-step financial or inventory updates that must never be partially applied.
• InnoDB uses Clustered Indexes where the primary key physically orders table storage on disk.
• Inspect EXPLAIN output to verify that type is 'ref' or 'range' rather than 'ALL' (full table scan).`,
          questions: [
            {
              id: 'q-mysql-4-1-1',
              question: 'Which ACID property guarantees that if a server loses power immediately after a COMMIT, the committed data is not lost?',
              code: '',
              type: 'mcq',
              options: ['Durability', 'Atomicity', 'Isolation', 'Consistency'],
              answer: 'Durability',
              explanation: 'Durability guarantees that committed transactions are written to non-volatile storage (via redo logs) and persist across power failures.',
              category: 'Transactions',
              order: 1,
            },
          ],
          tasks: [
            {
              id: 't-mysql-4-1-1',
              taskNumber: 1,
              title: 'Implement a Safe Transactional Balance Transfer Script',
              level: 'Level 2',
              category: 'ACID Transactions',
              description: 'Write a SQL transaction block that deducts $250 from sender account 1, adds $250 to receiver account 2, inserts an audit record, and commits.',
              requirements: [
                'Start with START TRANSACTION;',
                'Execute both UPDATE statements',
                'INSERT record into transaction_logs',
                'End with COMMIT;'
              ],
              example: 'START TRANSACTION; UPDATE ...; INSERT ...; COMMIT;',
              hints: ['Ensure both accounts are updated in the same transaction block.'],
              starterCode: `-- Safe ACID Bank Transfer Transaction\nSTART TRANSACTION;\n\n-- Implement updates and commit\n`,
            },
          ],
        },
      ],
    },
  ],
};
