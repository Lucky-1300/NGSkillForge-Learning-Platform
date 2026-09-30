require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');
const Course = require('./models/course.model');

const exactSubtopics = [
  {
    title: 'Variables, Declaration & Initialization',
    type: 'text',
    content: `1. Variables

What is a Variable?
A variable is a named container used to store data in memory. It allows you to store, retrieve, and modify values throughout a program.

Example:
\`\`\`javascript
let name = "Lucky";
\`\`\`

Here:
• name → Variable name
• "Lucky" → Value stored in the variable

Why do we use Variables?
Variables help us:
• Store data
• Reuse values
• Update values
• Avoid repeating the same data
• Make programs dynamic

Example:
\`\`\`javascript
let price = 100;
console.log(price);
\`\`\`

2. Declaration vs Initialization

Declaration
Declaration means creating a variable.
Syntax:
\`\`\`javascript
let age;
\`\`\`
The variable exists but has no assigned value.

Initialization
Initialization means assigning the first value to a variable.
\`\`\`javascript
age = 22;
\`\`\`

Declaration + Initialization
Both happen together.
\`\`\`javascript
let age = 22;
\`\`\`

Difference
• Declaration: Creates a variable (happens once)
• Initialization: Assigns the first value (can happen during declaration or later)`,
    notes: `💡 Key Takeaway:
• Declaration creates the identifier in memory (initially undefined).
• Initialization binds the first value.
• You can declare and initialize in one statement: let age = 22;`,
    duration: '15 mins',
    order: 1,
  },
  {
    title: 'var, let, and const (Scope, Reassignment & Redeclaration)',
    type: 'text',
    content: `3. var
var was introduced in the first version of JavaScript.

Example:
\`\`\`javascript
var city = "Delhi";
\`\`\`

Characteristics:
• Function scoped
• Can be redeclared
• Can be reassigned
• Hoisted
• Initialized with undefined

Example:
\`\`\`javascript
var a = 10;
var a = 20;
a = 30;
// All are valid.
\`\`\`

4. let
let was introduced in ES6 (2015).

Example:
\`\`\`javascript
let age = 22;
\`\`\`

Characteristics:
• Block scoped
• Cannot be redeclared in the same scope
• Can be reassigned
• Hoisted
• Stays in the Temporal Dead Zone (TDZ) until initialized

Example:
\`\`\`javascript
let age = 20;
age = 25;
\`\`\`

5. const
const was also introduced in ES6.
Used when the variable reference should not change.

Example:
\`\`\`javascript
const PI = 3.14;
\`\`\`

Characteristics:
• Block scoped
• Cannot be redeclared
• Cannot be reassigned
• Must be initialized during declaration
• Hoisted with TDZ

Example:
\`\`\`javascript
const country = "India";
\`\`\`

6. Reassignment
Changing the value of an existing variable.

Example:
\`\`\`javascript
let age = 20;
age = 25;
\`\`\`
Old value → 20, New value → 25

Allowed for: var, let
Not allowed for: const

7. Redeclaration
Creating the same variable again in the same scope.

Example:
\`\`\`javascript
var a = 10;
var a = 20;
\`\`\`
Allowed only with var.

Not allowed with:
\`\`\`javascript
let a = 10;
let a = 20; // Error: Identifier 'a' has already been declared
\`\`\`

20. Summary Table
| Feature | var | let | const |
|---|---|---|---|
| Scope | Function | Block | Block |
| Redeclaration | ✅ Yes | ❌ No | ❌ No |
| Reassignment | ✅ Yes | ✅ Yes | ❌ No |
| Hoisted | ✅ Yes | ✅ Yes | ✅ Yes |
| TDZ | ❌ No | ✅ Yes | ✅ Yes |
| Initialization Required | ❌ No | ❌ No | ✅ Yes |`,
    notes: `💡 Key Takeaway:
• Use const by default for immutable bindings.
• Use let when you know the value will be reassigned.
• Avoid var in modern JavaScript due to function-scoping and accidental redeclaration bugs.`,
    duration: '20 mins',
    order: 2,
  },
  {
    title: 'Naming Rules & Conventions',
    type: 'text',
    content: `8. Naming Rules

Variable names:

✅ Can start with:
• Letter (a-z, A-Z)
• _ (underscore)
• $ (dollar sign)

Example:
\`\`\`javascript
let name;
let _age;
let $price;
\`\`\`

❌ Cannot start with a number:
\`\`\`javascript
let 1age; // Invalid
\`\`\`

❌ Cannot contain spaces:
\`\`\`javascript
let first name; // Invalid
\`\`\`

❌ Cannot use reserved keywords:
\`\`\`javascript
let if; // Invalid
\`\`\`

JavaScript is case-sensitive:
\`\`\`javascript
let age = 20;
let Age = 30;
// These are different variables.
\`\`\`

Use camelCase naming convention:
Example:
• firstName
• studentAge
• totalMarks`,
    notes: `⚠️ Important:
• JavaScript identifiers are case-sensitive: age, Age, and AGE are three separate variables.
• Always write clean, descriptive names in camelCase.`,
    duration: '12 mins',
    order: 3,
  },
  {
    title: 'Primitive Data Types (String, Number, Boolean, Undefined, Null)',
    type: 'text',
    content: `9. Primitive Data Types
Primitive data types store a single value directly.
There are 7 primitive data types in JavaScript:
1. String
2. Number
3. Boolean
4. Undefined
5. Null
6. BigInt
7. Symbol

Characteristics:
• Immutable (cannot be changed)
• Stored by value
• Compared by value
• Fixed-size values

10. String
A String represents textual data.

Example:
\`\`\`javascript
"Hello"
'Hello'
\`Hello\`
\`\`\`

Strings can use:
• Double quotes ("")
• Single quotes ('')
• Backticks (\`\`)

Backticks support:
• Template literals
• Multiline strings
• Expression interpolation

Example:
\`\`\`javascript
let name = "Lucky";
console.log(\`Hello \${name}\`);
// Output: Hello Lucky
\`\`\`

typeof result:
\`\`\`javascript
typeof "Hello"
// Output: string
\`\`\`

11. Number
JavaScript has only one numeric type called Number.
It stores:
• Integers
• Decimal numbers
• Positive values
• Negative values
• Special values like NaN and Infinity

Examples:
\`\`\`javascript
10
3.14
-25
NaN
Infinity
\`\`\`

typeof:
\`\`\`javascript
typeof 10
// Output: number
\`\`\`

NaN (Not-a-Number)
NaN stands for Not-a-Number. It represents an invalid numeric result.

Example:
\`\`\`javascript
0 / 0
// Output: NaN
\`\`\`

Even though it means "Not-a-Number", its type is:
\`\`\`javascript
typeof NaN
// Output: number
\`\`\`

12. Boolean
Boolean stores only two values:
• true
• false

Used in:
• Conditions
• Comparisons
• Loops
• Decision making

Example:
\`\`\`javascript
let isLoggedIn = true;
typeof isLoggedIn; // "boolean"
\`\`\`

13. Undefined
A variable that has been declared but not assigned a value automatically gets undefined.

Example:
\`\`\`javascript
let age;
console.log(age); // Output: undefined
\`\`\`

Characteristics:
• Assigned automatically by JavaScript
• Represents "value not assigned yet"
• typeof age ➔ "undefined"

14. Null
null represents the intentional absence of a value.

Example:
\`\`\`javascript
let user = null;
\`\`\`

Unlike undefined, null is assigned manually by the programmer.

Difference:
\`\`\`javascript
let a;        // a → JavaScript assigned undefined
let b = null; // b → Programmer assigned null
\`\`\`

typeof null result:
\`\`\`javascript
typeof null
// Output: "object"
\`\`\`
This is a historical bug in JavaScript. Although null is a primitive type, typeof null returns "object".`,
    notes: `💡 Key Takeaway:
• undefined = variable declared but not assigned (by JavaScript).
• null = variable intentionally set to empty (by developer).
• typeof null is "object" due to a legacy bug. Always check with value === null.`,
    duration: '22 mins',
    order: 4,
  },
  {
    title: 'BigInt, Symbol & The typeof Operator',
    type: 'text',
    content: `15. BigInt
BigInt is used to store integers larger than Number.MAX_SAFE_INTEGER (9007199254740991).

Example:
\`\`\`javascript
let big = 1234567890123456789012345678901234567890n;
// or
let big = BigInt(100);
\`\`\`

typeof:
\`\`\`javascript
typeof big; // Output: "bigint"
\`\`\`

16. Symbol
A Symbol is a unique and immutable primitive value.
Used to create unique object property keys and avoid property name collisions.

Example:
\`\`\`javascript
let id = Symbol();
\`\`\`

Each Symbol is unique:
\`\`\`javascript
Symbol() === Symbol();
// Output: false
\`\`\`

typeof:
\`\`\`javascript
typeof Symbol(); // Output: "symbol"
\`\`\`

18. typeof Operator
typeof is an operator used to determine the data type of a value.

Syntax:
\`\`\`javascript
typeof value
\`\`\`

Examples:
\`\`\`javascript
typeof "Hello";      // "string"
typeof 100;          // "number"
typeof true;         // "boolean"
typeof undefined;    // "undefined"
typeof null;         // "object"
typeof 123n;         // "bigint"
typeof Symbol();     // "symbol"
typeof {};           // "object"
typeof [];           // "object"
typeof function(){}; // "function"
\`\`\`

19. Why Does typeof null Return "object"?
This is a legacy bug from the early implementation of JavaScript.
At that time, values were represented internally with type tags. The representation for null accidentally matched the object type tag, causing:
\`\`\`javascript
typeof null; // returns "object"
\`\`\`
This behavior has been preserved for backward compatibility because changing it would break existing JavaScript code.
To check for null, always use strict equality:
\`\`\`javascript
value === null
\`\`\`

22. typeof Quick Reference
| Value | Result |
|---|---|
| "Hello" | "string" |
| 100 | "number" |
| true | "boolean" |
| undefined | "undefined" |
| null | "object" (historical bug) |
| 123n | "bigint" |
| Symbol() | "symbol" |
| {} | "object" |
| [] | "object" |
| function(){} | "function" |`,
    notes: `💡 Quick Memory Guide:
• 7 Primitives: String, Number, Boolean, Undefined, Null, BigInt, Symbol.
• typeof returns "object" for: Objects, Arrays, and Null (bug).
• typeof returns "function" for functions.`,
    duration: '18 mins',
    order: 5,
  },
  {
    title: 'Reference (Non-Primitive) Data Types',
    type: 'text',
    content: `17. Reference (Non-Primitive) Data Types
Non-primitive data types store references (memory addresses) instead of the actual value.

Common reference types:
• Object
• Array
• Function
• Date
• Map
• Set

Example:
\`\`\`javascript
let person = {
  name: "Lucky"
};

let numbers = [1, 2, 3];

function greet() {}
\`\`\`

Characteristics:
• Mutable (can be modified)
• Stored by reference
• Dynamic in size
• Compared by reference

Example:
\`\`\`javascript
let obj1 = { name: "Lucky" };
let obj2 = obj1;

obj2.name = "Ray";

console.log(obj1.name);
// Output: Ray
\`\`\`
Both variables refer to the same object in memory.

21. Primitive vs Non-Primitive
| Feature | Primitive | Non-Primitive |
|---|---|---|
| Types | 7 data types (String, Number, Boolean, Undefined, Null, BigInt, Symbol) | Objects, Arrays, Functions, etc. |
| Mutability | Immutable | Mutable |
| Storage | Stored by value | Stored by reference |
| Comparison | Compared by value | Compared by reference |
| Size | Fixed size | Dynamic size |`,
    notes: `💡 Key Takeaway:
• Primitives copy the actual value into a new memory location.
• Objects copy the memory address reference. Mutating one reference mutates all variables pointing to that object.`,
    duration: '20 mins',
    order: 6,
  },
];

async function updateExactNotes() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const jsCourse = await Course.findOne({ title: 'JavaScript Foundations' });
    if (!jsCourse) {
      console.error('Course not found');
      process.exit(1);
    }

    const modIdx = jsCourse.modules.findIndex(m => m.order === 2 || m.title.toLowerCase().includes('variable'));
    if (modIdx === -1) {
      console.error('Topic 2 not found');
      process.exit(1);
    }

    jsCourse.modules[modIdx].lessons = exactSubtopics;
    await jsCourse.save();

    console.log('✅ Successfully updated Topic 2 with EXACT notes from user!');
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

updateExactNotes();
