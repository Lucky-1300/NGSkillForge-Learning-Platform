require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');
const Course = require('./models/course.model');

const subtopics = [
  {
    title: 'Variables, Declaration & Initialization',
    type: 'text',
    content: 'What is a variable, why we use variables, declaration vs. initialization, var vs. let vs. const, reassignment, and redeclaration rules.',
    notes: `• What is a Variable? A named container used to store data in memory that allows you to store, retrieve, and modify values.
• Why use Variables? Store data, reuse values, update values, avoid repetition, and make programs dynamic.
• Declaration: Creating a variable without assigning a value (e.g. let age;).
• Initialization: Assigning the first value to a variable (e.g. age = 22;).
• Declaration + Initialization: Happening together (e.g. let age = 22;).
• Reassignment: Changing the value of an existing variable. Allowed for var and let. Not allowed for const.
• Redeclaration: Creating the same variable again in the same scope. Allowed ONLY with var. Not allowed with let or const.`,
    duration: '15 mins',
    order: 1,
  },
  {
    title: 'Variable Naming Rules & Conventions',
    type: 'text',
    content: 'Rules for valid identifiers, invalid naming pitfalls, case-sensitivity in JavaScript, and industry-standard camelCase naming conventions.',
    notes: `• Allowed starting characters: Letter (a-z, A-Z), underscore (_), and dollar sign ($). E.g. let name; let _age; let $price;
• Invalid starting characters: Cannot start with numbers (e.g. let 1age is INVALID).
• Formatting: Cannot contain spaces (e.g. let first name is INVALID) or hyphens.
• Keywords: Cannot use JavaScript reserved keywords (e.g. let if, let for are INVALID).
• Case-sensitivity: JavaScript identifiers are case-sensitive. let age and let Age are distinct variables.
• Recommended convention: Always use camelCase (e.g. firstName, studentAge, totalMarks).`,
    duration: '12 mins',
    order: 2,
  },
  {
    title: 'Core Primitive Data Types (String, Number, Boolean, Undefined, Null)',
    type: 'text',
    content: 'Overview of primitives, strings with quotes and template literals, numbers (integers, decimals, NaN, Infinity), booleans, and undefined vs. null.',
    notes: `• Primitive Characteristics: Store a single value directly, immutable, stored & compared by value, fixed in memory size.
• String: Represents textual data enclosed in double quotes (""), single quotes (''), or backticks (\`\`). Backticks support template literals (\`Hello \${name}\`) and multiline text.
• Number: Unified numeric type for integers, decimals, negative numbers, and special values like NaN (Not-a-Number) and Infinity.
• Boolean: Binary logic flag storing either true or false.
• Undefined: Represents a variable declared but not yet assigned a value (assigned automatically by JS).
• Null: Represents the intentional absence of any object or value (assigned manually by the programmer).`,
    duration: '22 mins',
    order: 3,
  },
  {
    title: 'Modern Primitives (BigInt & Symbol)',
    type: 'text',
    content: 'Arbitrary-precision BigInt integers beyond Number.MAX_SAFE_INTEGER and unique immutable Symbol identifiers.',
    notes: `• BigInt: Used to store arbitrarily large integers exceeding Number.MAX_SAFE_INTEGER (9,007,199,254,740,991). Created via 123n or BigInt(100). typeof returns "bigint".
• Symbol: Unique and immutable primitive value used to create collision-free object property keys.
• Uniqueness: Every Symbol() invocation produces a completely unique identifier: Symbol("id") === Symbol("id") evaluates to false. typeof returns "symbol".`,
    duration: '15 mins',
    order: 4,
  },
  {
    title: 'The typeof Operator & The Historical typeof null Bug',
    type: 'text',
    content: 'Inspecting data types with typeof, full type lookup table, and the famous historical legacy bug where typeof null returns "object".',
    notes: `• typeof Operator: Returns a string representing the evaluated data type (e.g. typeof "Hello" ➔ "string", typeof 100 ➔ "number").
• The typeof null Quirk: typeof null returns "object" because in early JS, values were tagged with binary type representations where null matched the object tag (0x00). Preserved for backward compatibility.
• Correct Null Check: Never use typeof to check for null. Always use strict equality: value === null.
• Functions: typeof function(){} returns "function" because functions are callable objects.`,
    duration: '18 mins',
    order: 5,
  },
  {
    title: 'Non-Primitive Reference Types (Objects, Arrays, Functions)',
    type: 'text',
    content: 'Understanding reference data types, memory addresses in the heap, mutability, and comparing by reference vs. primitive by value.',
    notes: `• Reference Types: Object, Array, Function, Date, Map, Set.
• Characteristics: Mutable (can be modified in place), stored in the memory heap, dynamic in size, copied and compared by reference (memory address).
• Pass-by-Reference Demonstration: When obj2 = obj1, both variables point to the same memory location. Changing obj2.name = "Ray" directly updates obj1.name.
• const Objects: const prevents reassigning the variable binding to a new object, but internal properties can still be modified (person.name = "Ray").`,
    duration: '20 mins',
    order: 6,
  },
];

const questions = [
  {
    id: 'q-2-1',
    order: 1,
    type: 'output',
    question: 'What is the console output when logging a declared but uninitialized let variable?',
    code: `let a;
console.log(a);`,
    answer: 'undefined',
    explanation: 'A variable declared with let or var without an initial value is automatically assigned undefined by JavaScript.',
    category: 'Console Output',
  },
  {
    id: 'q-2-2',
    order: 2,
    type: 'output',
    question: 'What will be printed to the console?',
    code: `var a = 10;
var a = 20;
console.log(a);`,
    answer: '20',
    explanation: 'Variables declared with var can be redeclared in the same scope. The second declaration updates a to 20.',
    category: 'Console Output',
  },
  {
    id: 'q-2-3',
    order: 3,
    type: 'output',
    question: 'What will be printed when reassigning a let variable?',
    code: `let a = 10;
a = 50;
console.log(a);`,
    answer: '50',
    explanation: 'Variables declared with let allow reassignment to a new value.',
    category: 'Console Output',
  },
  {
    id: 'q-2-4',
    order: 4,
    type: 'output',
    question: 'What is the output of logging this const variable?',
    code: `const a = 10;
console.log(a);`,
    answer: '10',
    explanation: 'The constant a holds the primitive number 10.',
    category: 'Console Output',
  },
  {
    id: 'q-2-5',
    order: 5,
    type: 'output',
    question: 'What does typeof "Hello" output?',
    code: `console.log(typeof "Hello");`,
    answer: 'string',
    explanation: 'Text wrapped in quotes is evaluated as the primitive String type.',
    category: 'typeof Questions',
  },
  {
    id: 'q-2-6',
    order: 6,
    type: 'output',
    question: 'What does typeof 100 output?',
    code: `console.log(typeof 100);`,
    answer: 'number',
    explanation: 'All integers and floating-point values in JavaScript are of type number.',
    category: 'typeof Questions',
  },
  {
    id: 'q-2-7',
    order: 7,
    type: 'output',
    question: 'What does typeof true output?',
    code: `console.log(typeof true);`,
    answer: 'boolean',
    explanation: 'true and false are boolean literals.',
    category: 'typeof Questions',
  },
  {
    id: 'q-2-8',
    order: 8,
    type: 'output',
    question: 'What does typeof undefined output?',
    code: `console.log(typeof undefined);`,
    answer: 'undefined',
    explanation: 'undefined is both a primitive value and its own distinct data type.',
    category: 'typeof Questions',
  },
  {
    id: 'q-2-9',
    order: 9,
    type: 'output',
    question: 'What does typeof null output?',
    code: `console.log(typeof null);`,
    answer: 'object',
    explanation: 'This is a famous historical bug from the early days of JavaScript where the null type tag matched object. It is preserved for backward compatibility.',
    category: 'typeof Questions',
  },
  {
    id: 'q-2-10',
    order: 10,
    type: 'output',
    question: 'What does typeof 123n output?',
    code: `console.log(typeof 123n);`,
    answer: 'bigint',
    explanation: 'Numbers with an "n" suffix represent BigInt primitives.',
    category: 'typeof Questions',
  },
  {
    id: 'q-2-11',
    order: 11,
    type: 'output',
    question: 'What does typeof Symbol() output?',
    code: `console.log(typeof Symbol());`,
    answer: 'symbol',
    explanation: 'Symbol() creates a unique primitive symbol identifier.',
    category: 'typeof Questions',
  },
  {
    id: 'q-2-12',
    order: 12,
    type: 'output',
    question: 'What does typeof {} output?',
    code: `console.log(typeof {});`,
    answer: 'object',
    explanation: '{} is an object literal.',
    category: 'typeof Questions',
  },
  {
    id: 'q-2-13',
    order: 13,
    type: 'output',
    question: 'What does typeof [] output?',
    code: `console.log(typeof []);`,
    answer: 'object',
    explanation: 'Arrays are non-primitive reference objects in JavaScript, so typeof returns "object". (Use Array.isArray() to specifically detect arrays).',
    category: 'typeof Questions',
  },
  {
    id: 'q-2-14',
    order: 14,
    type: 'output',
    question: 'What does typeof function(){} output?',
    code: `console.log(typeof function(){});`,
    answer: 'function',
    explanation: 'Functions are special callable objects, and JavaScript returns "function" for convenience.',
    category: 'typeof Questions',
  },
  {
    id: 'q-2-15',
    order: 15,
    type: 'output',
    question: 'What is the typeof result for a numeric string?',
    code: `let a = "10";
console.log(typeof a);`,
    answer: 'string',
    explanation: 'Even though the content is numeric characters, the surrounding quotes make it a string.',
    category: 'Console Output',
  },
  {
    id: 'q-2-16',
    order: 16,
    type: 'output',
    question: 'What is the typeof result for a number literal?',
    code: `let a = 10;
console.log(typeof a);`,
    answer: 'number',
    explanation: 'Unquoted 10 is evaluated directly as a primitive number.',
    category: 'Console Output',
  },
  {
    id: 'q-2-17',
    order: 17,
    type: 'output',
    question: 'What is logged when mutating a property on a const object?',
    code: `const person = {
  name: "Lucky"
};
person.name = "Ray";
console.log(person.name);`,
    answer: 'Ray',
    explanation: 'const prevents reassigning the variable reference to a new object, but the object itself is mutable and its internal properties can be modified.',
    category: 'Console Output',
  },
  {
    id: 'q-2-18',
    order: 18,
    type: 'output',
    question: 'What does strict null equality check output?',
    code: `let a = null;
console.log(a === null);`,
    answer: 'true',
    explanation: 'Strict equality (===) compares both value and type without coercion, confirming a is null.',
    category: 'Console Output',
  },
  {
    id: 'q-2-19',
    order: 19,
    type: 'output',
    question: 'Are two separate Symbol invocations equal?',
    code: `console.log(Symbol() === Symbol());`,
    answer: 'false',
    explanation: 'Every Symbol() call returns a globally unique primitive value that is never equal to any other Symbol.',
    category: 'Console Output',
  },
  {
    id: 'q-2-20',
    order: 20,
    type: 'output',
    question: 'What are the values of a and b after copying a primitive?',
    code: `let a = 10;
let b = a;
b = 20;
console.log(a);
console.log(b);`,
    answer: '10 followed by 20',
    explanation: 'Primitives are copied by value. Mutating b creates a separate copy and does NOT affect a.',
    category: 'Console Output',
  },
  {
    id: 'q-2-21',
    order: 21,
    type: 'output',
    question: 'What is logged when mutating an object assigned to another variable?',
    code: `let obj1 = { name: "Lucky" };
let obj2 = obj1;
obj2.name = "Ray";
console.log(obj1.name);
console.log(obj2.name);`,
    answer: 'Ray followed by Ray',
    explanation: 'Objects are copied by reference (memory address). obj1 and obj2 point to the exact same object in the memory heap.',
    category: 'Console Output',
  },
  {
    id: 'q-2-22',
    order: 22,
    type: 'output',
    question: 'What is the typeof an unassigned variable?',
    code: `let x;
console.log(typeof x);`,
    answer: 'undefined',
    explanation: 'Unassigned let variables default to undefined, whose typeof is "undefined".',
    category: 'typeof Questions',
  },
  {
    id: 'q-2-23',
    order: 23,
    type: 'output',
    question: 'What is typeof NaN?',
    code: `console.log(typeof NaN);`,
    answer: 'number',
    explanation: 'Although NaN stands for "Not-a-Number", it represents an invalid numerical operation and its type is still number.',
    category: 'typeof Questions',
  },
  {
    id: 'q-2-24',
    order: 24,
    type: 'output',
    question: 'What does typeof on a backtick template literal return?',
    code: `let a = \`Hello\`;
console.log(typeof a);`,
    answer: 'string',
    explanation: 'Strings enclosed in backticks are evaluated as standard string primitives.',
    category: 'typeof Questions',
  },
  {
    id: 'q-2-25',
    order: 25,
    type: 'output',
    question: 'What is typeof BigInt(100)?',
    code: `let x = BigInt(100);
console.log(typeof x);`,
    answer: 'bigint',
    explanation: 'BigInt(100) constructs a primitive of type bigint.',
    category: 'typeof Questions',
  },
];

const tasks = [
  // Level 1: Variable Basics
  {
    id: 't-2-1',
    taskNumber: 1,
    title: 'Declare Variables with var, let, and const',
    level: 'Level 1',
    category: 'Variables Basics',
    description: 'Create three variables storing your name, age, and country using var, let, and const respectively.',
    requirements: [
      'Declare a name variable using var.',
      'Declare an age variable using let.',
      'Declare a country variable using const.',
      'Log all three variables to the console.',
    ],
    example: 'Output: "Lucky", 22, "India"',
    hints: ['Remember that const requires an immediate initial value.'],
    starterCode: `// 1. Declare variables
var name = "Lucky";
let age = 22;
const country = "India";

// 2. Print variables
console.log(name, age, country);`,
  },
  {
    id: 't-2-2',
    taskNumber: 2,
    title: 'Declaration vs. Initialization',
    level: 'Level 1',
    category: 'Variables Basics',
    description: 'Demonstrate declaration without assignment, print its default value, and then assign and print the initialized value.',
    requirements: [
      'Declare let city; without assigning a value.',
      'Log city to verify it is undefined.',
      'Assign "Delhi" to city.',
      'Log city again to confirm initialization.',
    ],
    example: 'Output: undefined, then "Delhi"',
    hints: ['Declaration allocates the variable identifier, while initialization assigns the first value.'],
    starterCode: `let city;
console.log("Before initialization:", city);

city = "Delhi";
console.log("After initialization:", city);`,
  },
  {
    id: 't-2-3',
    taskNumber: 3,
    title: 'Variable Reassignment',
    level: 'Level 1',
    category: 'Variables Basics',
    description: 'Create a let variable storing your favorite color, change it to another color, and print both values.',
    requirements: [
      'Declare let favoriteColor = "Blue".',
      'Print the initial color.',
      'Reassign favoriteColor = "Green".',
      'Print the updated color.',
    ],
    example: 'Output: "Blue", then "Green"',
    hints: ['Do not use the let keyword again when reassigning.'],
    starterCode: `let favoriteColor = "Blue";
console.log("Initial color:", favoriteColor);

favoriteColor = "Green";
console.log("Updated color:", favoriteColor);`,
  },
  {
    id: 't-2-4',
    taskNumber: 4,
    title: 'Const Immutability & Reassignment Error',
    level: 'Level 1',
    category: 'Variables Basics',
    description: 'Create a constant named PI, attempt to change its value inside a try-catch block, and observe the TypeError.',
    requirements: [
      'Declare const PI = 3.14.',
      'Attempt reassignment PI = 3.14159.',
      'Observe the TypeError: Assignment to constant variable.',
    ],
    example: 'TypeError: Assignment to constant variable.',
    hints: ['const variables prohibit identifier reassignment.'],
    starterCode: `const PI = 3.14;
try {
  PI = 3.14159;
} catch (err) {
  console.log("Caught Error:", err.message);
}`,
  },
  {
    id: 't-2-5',
    taskNumber: 5,
    title: 'Redeclaration: var vs. let',
    level: 'Level 1',
    category: 'Variables Basics',
    description: 'Compare redeclaration behavior between var and let in the same scope.',
    requirements: [
      'Redeclare a variable using var a = 10; var a = 20; (valid).',
      'Explain why let b = 10; let b = 20; throws a SyntaxError.',
    ],
    example: 'var allows redeclaration, let throws Identifier has already been declared.',
    hints: ['let and const enforce single declaration per block scope.'],
    starterCode: `var a = 10;
var a = 20;
console.log("var redeclared successfully:", a);

// let b = 10;
// let b = 20; // SyntaxError!`,
  },

  // Level 2: Variable Rules
  {
    id: 't-2-6',
    taskNumber: 6,
    title: 'Valid Variable Identifiers',
    level: 'Level 2',
    category: 'Naming Rules',
    description: 'Create and log valid variables named firstName, last_name, $price, _id, and user123.',
    requirements: [
      'Declare variables using standard letters, underscores, and dollar signs.',
      'Print all values to the console.',
    ],
    example: 'Output: "Alex", "Smith", 99, "usr_1", "activeUser"',
    hints: ['Variables can start with letters, $, or _.'],
    starterCode: `let firstName = "Alex";
let last_name = "Smith";
let $price = 99;
let _id = "usr_1";
let user123 = "activeUser";

console.log(firstName, last_name, $price, _id, user123);`,
  },
  {
    id: 't-2-7',
    taskNumber: 7,
    title: 'Analyze Invalid Identifier Names',
    level: 'Level 2',
    category: 'Naming Rules',
    description: 'Write comments explaining why 123name, first-name, and let are invalid identifier names in JavaScript.',
    requirements: [
      'Explain: 123name starts with a number.',
      'Explain: first-name contains a hyphen (interpreted as subtraction).',
      'Explain: let is a reserved keyword.',
    ],
    example: 'Clear comment explanations for all 3 invalid cases.',
    hints: ['Reserved keywords and punctuation cannot be used as variable names.'],
    starterCode: `// 1. let 123name; -> Invalid: Cannot start with a number.
// 2. let first-name; -> Invalid: Hyphen is treated as minus operator.
// 3. let let; -> Invalid: 'let' is a reserved JavaScript keyword.`,
  },
  {
    id: 't-2-8',
    taskNumber: 8,
    title: 'Refactor to Proper camelCase',
    level: 'Level 2',
    category: 'Naming Rules',
    description: 'Convert "student name", "user age", "phone number", and "total marks" into proper camelCase JavaScript variables.',
    requirements: [
      'Define studentName, userAge, phoneNumber, totalMarks.',
      'Assign representative values and log them.',
    ],
    example: 'studentName, userAge, phoneNumber, totalMarks',
    hints: ['camelCase begins lowercase and capitalizes subsequent words.'],
    starterCode: `let studentName = "Lucky";
let userAge = 22;
let phoneNumber = "+919876543210";
let totalMarks = 95;

console.log({ studentName, userAge, phoneNumber, totalMarks });`,
  },
  {
    id: 't-2-9',
    taskNumber: 9,
    title: 'Personal Profile Sentence Builder',
    level: 'Level 2',
    category: 'Naming Rules',
    description: 'Store Name, Age, Gender, City, and Is Student in variables and print them in a formatted template literal sentence.',
    requirements: [
      'Store 5 personal profile fields with appropriate types.',
      'Print formatted sentence: "My name is [name]. I am [age] years old living in [city]."',
    ],
    example: 'My name is Lucky. I am 22 years old living in Delhi.',
    hints: ['Use backtick template literals (`...${var}...`).'],
    starterCode: `const name = "Lucky";
const age = 22;
const gender = "Male";
const city = "Delhi";
const isStudent = true;

console.log(\`My name is \${name}. I am \${age} years old living in \${city}.\`);`,
  },
  {
    id: 't-2-10',
    taskNumber: 10,
    title: 'Student Academic Record Builder',
    level: 'Level 2',
    category: 'Naming Rules',
    description: 'Create variables for Roll Number, Marks, Grade, and Passed boolean flag and print the complete record.',
    requirements: [
      'Declare rollNumber (Number), marks (Number), grade (String), isPassed (Boolean).',
      'Log the complete academic record.',
    ],
    example: 'Roll: 101, Marks: 88, Grade: A, Passed: true',
    hints: ['Use camelCase for all variable names.'],
    starterCode: `const rollNumber = 101;
const marks = 88.5;
const grade = "A";
const isPassed = true;

console.log(\`Roll: \${rollNumber}, Marks: \${marks}, Grade: \${grade}, Passed: \${isPassed}\`);`,
  },

  // Level 3: Primitive Data Types
  {
    id: 't-2-11',
    taskNumber: 11,
    title: 'Identify Primitive Data Types with typeof',
    level: 'Level 3',
    category: 'Primitive Types',
    description: 'Store "Hello", 25, true, undefined, and null in variables and print each variable with its evaluated typeof result.',
    requirements: [
      'Store all 5 primitive values in distinct variables.',
      'Print "Value: [val], Type: [type]" for each.',
    ],
    example: '"Hello" -> string, 25 -> number, true -> boolean, undefined -> undefined, null -> object',
    hints: ['Remember typeof null returns "object" due to the historical bug.'],
    starterCode: `const str = "Hello";
const num = 25;
const bool = true;
const unassigned = undefined;
const empty = null;

console.log(str, "->", typeof str);
console.log(num, "->", typeof num);
console.log(bool, "->", typeof bool);
console.log(unassigned, "->", typeof unassigned);
console.log(empty, "->", typeof empty);`,
  },
  {
    id: 't-2-12',
    taskNumber: 12,
    title: 'String Concatenation & Template Literals',
    level: 'Level 3',
    category: 'Primitive Types',
    description: 'Create variables for First Name and Last Name, and combine them into Full Name using both concatenation and template literals.',
    requirements: [
      'Combine using + operator: firstName + " " + lastName.',
      'Combine using template literal: `${firstName} ${lastName}`.',
    ],
    example: 'Full Name: "Lucky Ray"',
    hints: ['Template literals are cleaner and avoid manual whitespace concatenation.'],
    starterCode: `const firstName = "Lucky";
const lastName = "Ray";

const fullNameConcat = firstName + " " + lastName;
const fullNameTemplate = \`\${firstName} \${lastName}\`;

console.log("Concat:", fullNameConcat);
console.log("Template:", fullNameTemplate);`,
  },
  {
    id: 't-2-13',
    taskNumber: 13,
    title: 'Numeric Arithmetic Operations',
    level: 'Level 3',
    category: 'Primitive Types',
    description: 'Store numbers 50 and 20, then compute and log their Sum, Difference, Product, Division, and Remainder.',
    requirements: [
      'Declare a = 50 and b = 20.',
      'Print Sum (a + b), Difference (a - b), Product (a * b), Division (a / b), and Modulo (a % b).',
    ],
    example: 'Sum: 70, Diff: 30, Product: 1000, Div: 2.5, Mod: 10',
    hints: ['All JS arithmetic operations produce standard number primitives.'],
    starterCode: `const a = 50;
const b = 20;

console.log("Sum:", a + b);
console.log("Difference:", a - b);
console.log("Product:", a * b);
console.log("Division:", a / b);
console.log("Remainder:", a % b);`,
  },
  {
    id: 't-2-14',
    taskNumber: 14,
    title: 'Boolean Flags & Logical Decisions',
    level: 'Level 3',
    category: 'Primitive Types',
    description: 'Create boolean variables isLoggedIn and isAdmin, and print whether the user has administrative dashboard access.',
    requirements: [
      'Declare isLoggedIn = true and isAdmin = false.',
      'Evaluate if user has access (isLoggedIn && isAdmin).',
    ],
    example: 'Has Admin Access: false',
    hints: ['Logical AND (&&) requires both boolean values to be true.'],
    starterCode: `const isLoggedIn = true;
const isAdmin = false;

const hasAdminAccess = isLoggedIn && isAdmin;
console.log("Logged In:", isLoggedIn);
console.log("Admin Access:", hasAdminAccess);`,
  },
  {
    id: 't-2-15',
    taskNumber: 15,
    title: 'Understanding undefined Lifecycle',
    level: 'Level 3',
    category: 'Primitive Types',
    description: 'Declare let address;, print it before assignment, assign a value, and print it after assignment.',
    requirements: [
      'Declare let address; without value.',
      'Log address to observe automatic undefined.',
      'Assign "221B Baker Street" and log again.',
    ],
    example: 'Before: undefined, After: "221B Baker Street"',
    hints: ['JavaScript sets variables to undefined until assigned.'],
    starterCode: `let address;
console.log("Before assignment:", address);

address = "221B Baker Street";
console.log("After assignment:", address);`,
  },
  {
    id: 't-2-16',
    taskNumber: 16,
    title: 'Understanding null (Intentional Absence)',
    level: 'Level 3',
    category: 'Primitive Types',
    description: 'Create selectedUser initialized to null, print it, and later assign a selected username.',
    requirements: [
      'Declare let selectedUser = null;.',
      'Log selectedUser with strict check (selectedUser === null).',
      'Assign "Lucky" and log the updated state.',
    ],
    example: 'Initial: null (is null: true), Selected: "Lucky"',
    hints: ['null is used when a programmer intentionally wants to declare "no value currently selected".'],
    starterCode: `let selectedUser = null;
console.log("Initial state:", selectedUser, "is null:", selectedUser === null);

selectedUser = "Lucky";
console.log("Selected user:", selectedUser);`,
  },

  // Level 4: BigInt & Symbol
  {
    id: 't-2-17',
    taskNumber: 17,
    title: 'Large Numbers with BigInt',
    level: 'Level 4',
    category: 'BigInt & Symbol',
    description: 'Store 987654321987654321987654321n using BigInt and print its value and typeof.',
    requirements: [
      'Create a BigInt variable with n suffix: 987654321987654321987654321n.',
      'Print value and typeof result.',
    ],
    example: 'Value: 987654321987654321987654321n, Type: bigint',
    hints: ['Standard JS Numbers lose precision above 9007199254740991.'],
    starterCode: `const largeNumber = 987654321987654321987654321n;
console.log("Value:", largeNumber);
console.log("Type:", typeof largeNumber);`,
  },
  {
    id: 't-2-18',
    taskNumber: 18,
    title: 'BigInt Arithmetic Operations',
    level: 'Level 4',
    category: 'BigInt & Symbol',
    description: 'Create two BigInt values and add them together.',
    requirements: [
      'Declare const bigA = 1000000000000000000n; and const bigB = 2000000000000000000n;.',
      'Add bigA + bigB and log the result.',
    ],
    example: 'Sum: 3000000000000000000n',
    hints: ['You cannot mix BigInt and standard Number in arithmetic without explicit conversion.'],
    starterCode: `const bigA = 1000000000000000000n;
const bigB = 2000000000000000000n;

const sum = bigA + bigB;
console.log("BigInt Sum:", sum);`,
  },
  {
    id: 't-2-19',
    taskNumber: 19,
    title: 'Symbol Uniqueness Comparison',
    level: 'Level 4',
    category: 'BigInt & Symbol',
    description: 'Create two Symbols with the exact same description "id" and compare them using ===.',
    requirements: [
      'Declare sym1 = Symbol("id"); and sym2 = Symbol("id");.',
      'Log sym1 === sym2.',
      'Confirm output is false.',
    ],
    example: 'sym1 === sym2 -> false',
    hints: ['Every Symbol call generates a new, globally distinct primitive.'],
    starterCode: `const sym1 = Symbol("id");
const sym2 = Symbol("id");

console.log("Are symbols equal?", sym1 === sym2);`,
  },
  {
    id: 't-2-20',
    taskNumber: 20,
    title: 'Unique Entity Identifiers with Symbols',
    level: 'Level 4',
    category: 'BigInt & Symbol',
    description: 'Create unique Symbols for User, Product, and Order entities and log them.',
    requirements: [
      'Declare const USER_KEY = Symbol("User");, const PRODUCT_KEY = Symbol("Product");, const ORDER_KEY = Symbol("Order");.',
      'Print all three symbols and their typeof.',
    ],
    example: 'Symbol(User), Symbol(Product), Symbol(Order)',
    hints: ['Symbols prevent property collision in complex objects and libraries.'],
    starterCode: `const USER_KEY = Symbol("User");
const PRODUCT_KEY = Symbol("Product");
const ORDER_KEY = Symbol("Order");

console.log(USER_KEY, PRODUCT_KEY, ORDER_KEY);
console.log(typeof USER_KEY);`,
  },

  // Level 5: typeof Operator
  {
    id: 't-2-21',
    taskNumber: 21,
    title: 'typeof Practice Across All Types',
    level: 'Level 5',
    category: 'typeof Operator',
    description: 'Find and print the data type of 100, "JS", false, undefined, null, 10n, and Symbol("id").',
    requirements: [
      'Evaluate typeof on all 7 expressions.',
      'Log formatted list of results.',
    ],
    example: 'number, string, boolean, undefined, object, bigint, symbol',
    hints: ['Recall the 7 primitives and their typeof outputs.'],
    starterCode: `console.log("100 ->", typeof 100);
console.log('"JS" ->', typeof "JS");
console.log("false ->", typeof false);
console.log("undefined ->", typeof undefined);
console.log("null ->", typeof null);
console.log("10n ->", typeof 10n);
console.log('Symbol("id") ->', typeof Symbol("id"));`,
  },
  {
    id: 't-2-22',
    taskNumber: 22,
    title: 'Predict & Verify typeof Outputs',
    level: 'Level 5',
    category: 'typeof Operator',
    description: 'Predict the output of 7 typeof operations before executing, then verify results in code.',
    requirements: [
      'Test typeof "Hello", typeof 50, typeof true, typeof undefined, typeof null, typeof Symbol(), typeof 100n.',
      'Log verification results.',
    ],
    example: 'All predictions verified.',
    hints: ['Double check null.'],
    starterCode: `const tests = ["Hello", 50, true, undefined, null, Symbol(), 100n];

tests.forEach((val) => {
  console.log(String(val), "->", typeof val);
});`,
  },
  {
    id: 't-2-23',
    taskNumber: 23,
    title: 'Mixed Variables Type Inspector',
    level: 'Level 5',
    category: 'typeof Operator',
    description: 'Create variables for every primitive type and print both "Value: [val]" and "Type: [type]".',
    requirements: [
      'Create 7 variables covering all primitives.',
      'Log each pair cleanly.',
    ],
    example: 'Value: Lucky | Type: string',
    hints: ['Format each line with value and type.'],
    starterCode: `const items = [
  { val: "Lucky", name: "String" },
  { val: 22, name: "Number" },
  { val: true, name: "Boolean" },
  { val: undefined, name: "Undefined" },
  { val: null, name: "Null" },
  { val: 100n, name: "BigInt" },
  { val: Symbol("key"), name: "Symbol" }
];

items.forEach(item => {
  console.log(\`[\${item.name}] Value: \${String(item.val)} | Type: \${typeof item.val}\`);
});`,
  },

  // Level 6: typeof null Quirk
  {
    id: 't-2-24',
    taskNumber: 24,
    title: 'Investigate the typeof null Bug',
    level: 'Level 6',
    category: 'typeof null Quirk',
    description: 'Run typeof null and document why it returns "object" in comments.',
    requirements: [
      'Execute console.log(typeof null);.',
      'Add comments explaining the historical 0x00 type tag in early JavaScript and backward compatibility.',
    ],
    example: 'Output: "object"',
    hints: ['Always use val === null instead of typeof val === "object".'],
    starterCode: `console.log("typeof null is:", typeof null);

// Explanation:
// In the first implementation of JavaScript (1995), values were stored with a type tag in the lower bits.
// Objects had the type tag '000', and 'null' was represented as the NULL pointer (all zeros),
// causing typeof to misidentify null as an object.
// This bug is permanently preserved to avoid breaking legacy code on the web.`,
  },
  {
    id: 't-2-25',
    taskNumber: 25,
    title: 'Compare typeof undefined vs. typeof null',
    level: 'Level 6',
    category: 'typeof null Quirk',
    description: 'Compare typeof undefined and typeof null, and test loose vs. strict equality between them.',
    requirements: [
      'Log typeof undefined and typeof null.',
      'Log undefined == null (true) and undefined === null (false).',
    ],
    example: 'undefined == null -> true, undefined === null -> false',
    hints: ['Loose equality coerces both to empty, strict equality recognizes distinct types.'],
    starterCode: `console.log("typeof undefined:", typeof undefined);
console.log("typeof null:", typeof null);

console.log("Loose equality (undefined == null):", undefined == null);
console.log("Strict equality (undefined === null):", undefined === null);`,
  },

  // Level 7: Reference Types Introduction
  {
    id: 't-2-26',
    taskNumber: 26,
    title: 'Array Introduction & Type Inspection',
    level: 'Level 7',
    category: 'Reference Types',
    description: 'Create an array of fruits ["Apple", "Banana", "Orange"], print the array, and inspect its typeof and Array.isArray().',
    requirements: [
      'Declare const fruits = ["Apple", "Banana", "Orange"].',
      'Print fruits, typeof fruits ("object"), and Array.isArray(fruits) (true).',
    ],
    example: 'typeof -> "object", isArray -> true',
    hints: ['Arrays are non-primitive objects in JS.'],
    starterCode: `const fruits = ["Apple", "Banana", "Orange"];

console.log("Fruits:", fruits);
console.log("typeof fruits:", typeof fruits);
console.log("Array.isArray(fruits):", Array.isArray(fruits));`,
  },
  {
    id: 't-2-27',
    taskNumber: 27,
    title: 'Object Introduction & Mutability',
    level: 'Level 7',
    category: 'Reference Types',
    description: 'Create a person object with name and age, print it, check typeof, and mutate a property.',
    requirements: [
      'Declare const person = { name: "Lucky", age: 22 }.',
      'Check typeof person.',
      'Mutate person.age = 23 and print updated object.',
    ],
    example: '{ name: "Lucky", age: 23 }',
    hints: ['Objects are mutable reference data structures.'],
    starterCode: `const person = {
  name: "Lucky",
  age: 22
};

console.log("Initial object:", person);
console.log("typeof person:", typeof person);

person.age = 23;
console.log("Updated object:", person);`,
  },
  {
    id: 't-2-28',
    taskNumber: 28,
    title: 'Function Introduction & Callable Objects',
    level: 'Level 7',
    category: 'Reference Types',
    description: 'Create a greet function, invoke it, and inspect its evaluated typeof.',
    requirements: [
      'Declare function greet() { console.log("Hello from NGSkillForge!"); }.',
      'Invoke greet().',
      'Log typeof greet (returns "function").',
    ],
    example: 'typeof greet -> "function"',
    hints: ['Functions are first-class callable objects in JavaScript.'],
    starterCode: `function greet() {
  console.log("Hello from NGSkillForge!");
}

greet();
console.log("typeof greet:", typeof greet);`,
  },
];

async function seedVariablesContent() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const jsCourse = await Course.findOne({ title: 'JavaScript Foundations' });
    if (!jsCourse) {
      console.error('JavaScript Foundations course not found');
      process.exit(1);
    }

    // Find Module 2: Variables & Data Types
    const modIdx = jsCourse.modules.findIndex(m => m.order === 2 || m.title.toLowerCase().includes('variable'));
    if (modIdx === -1) {
      console.error('Variables topic not found in JavaScript Foundations');
      process.exit(1);
    }

    jsCourse.modules[modIdx].title = 'Variables & Data Types';
    jsCourse.modules[modIdx].description = 'Master variable declarations (var, let, const), 7 primitive data types, reference memory models, and the typeof operator through 6 interactive lessons, 25 console output questions, and 28 progressive coding tasks.';
    jsCourse.modules[modIdx].lessons = subtopics;
    jsCourse.modules[modIdx].questions = questions;
    jsCourse.modules[modIdx].tasks = tasks;

    await jsCourse.save();

    console.log(`✅ Successfully seeded Variables & Data Types topic!`);
    console.log(`- 6 Subtopics (Lessons)`);
    console.log(`- ${questions.length} Practice Questions`);
    console.log(`- ${tasks.length} Hands-On Tasks across Levels 1-7`);

    await mongoose.disconnect();
    console.log('Database disconnected.');
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seedVariablesContent();
