/**
 * Seed Script: JavaScript Scope & Hoisting Comprehensive Curriculum
 * Enriches the JavaScript course with 6 detailed subtopics containing:
 * - In-depth learning notes
 * - Subtopic-level practice & interview questions (with options, code, answers, explanations)
 * - Subtopic-level hands-on coding tasks (with requirements, starter code, hints)
 * 
 * Idempotent & Non-destructive.
 */
require("dotenv").config({ path: __dirname + "/../.env" });
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const mongoose = require("mongoose");
const Course = require("../models/course.model");

const scopeHoistingSubtopics = [
    {
        title: "Global, Function & Block Scope",
        type: "text",
        duration: "25 min",
        order: 1,
        content: "Master the three primary scope boundaries in JavaScript: Global Scope, Function (Local) Scope, and ES6 Block Scope.",
        notes: `### 1. What is Scope in JavaScript?
Scope is the current context of execution in which values and expressions are "visible" or can be referenced. If a variable or expression is not in the current scope, it is unavailable for use.

---

### 2. The Three Primary Scopes

#### A. Global Scope
- Variables declared outside of any function or curly brace \`{ }\` block belong to the **Global Scope**.
- **Accessibility:** Global variables can be accessed and modified from anywhere in the entire program.
- **Window Object Binding:** When declared with \`var\` in browser environments, global variables are automatically attached as properties of the global \`window\` object (\`window.myVar\`). Variables declared with \`let\` or \`const\` are not attached to \`window\`.
\`\`\`javascript
var globalVar = "I am global";
let globalLet = "I am also global";

function checkScope() {
    console.log(globalVar); // "I am global"
    console.log(globalLet); // "I am also global"
}
checkScope();
console.log(window.globalVar); // "I am global"
console.log(window.globalLet); // undefined
\`\`\`

#### B. Function (Local) Scope
- Each function in JavaScript creates its own private scope upon invocation.
- Variables declared inside a function body (whether using \`var\`, \`let\`, or \`const\`) are scoped to that function and **cannot** be accessed from outside the function.
\`\`\`javascript
function calculateTotal() {
    var discount = 10;
    let tax = 5;
    const price = 100;
    return price - discount + tax;
}
calculateTotal();
// console.log(discount); // Uncaught ReferenceError: discount is not defined
\`\`\`

#### C. Block Scope
- Introduced in **ES6 (ECMAScript 2015)**.
- A block is delimited by curly braces \`{ }\` (such as in \`if\`, \`else\`, \`for\`, \`while\`, \`switch\`, or standalone code blocks).
- **\`let\` and \`const\` are strictly block-scoped:** They cannot be accessed outside the enclosing \`{ }\` block.
- **\`var\` is NOT block-scoped:** It ignores block boundaries and leaks out into the enclosing function or global scope.
\`\`\`javascript
{
    var leakedVar = "Leaked out";
    let trappedLet = "Trapped in block";
    const trappedConst = "Also trapped";
}
console.log(leakedVar); // "Leaked out" (leaked!)
// console.log(trappedLet);   // ReferenceError: trappedLet is not defined
// console.log(trappedConst); // ReferenceError: trappedConst is not defined
\`\`\`

---

### 3. Key Summary Matrix
| Scope Type | Defined By | Bound Variables | Accessible Outside? |
| :--- | :--- | :--- | :--- |
| **Global Scope** | Outside any block/function | \`var\`, \`let\`, \`const\` | Yes (everywhere) |
| **Function Scope** | Inside \`function() { ... }\` | \`var\`, \`let\`, \`const\` | No (\`ReferenceError\`) |
| **Block Scope** | Inside \`{ ... }\` | \`let\`, \`const\` | No (\`ReferenceError\`) |`,
        questions: [
            {
                id: "q-scope-1-1",
                question: "What happens when you log a variable declared with var inside an if-block outside of that block?",
                code: `if (true) {\n    var message = "Hello Scope";\n}\nconsole.log(message);`,
                type: "output",
                options: [],
                answer: `"Hello Scope"`,
                explanation: "var is function-scoped, not block-scoped. Because the if statement is not a function, the variable leaks into the surrounding scope.",
                category: "Scope Basics",
                order: 1
            },
            {
                id: "q-scope-1-2",
                question: "Which of the following variable declarations respect block scope delimited by curly braces { }?",
                code: ``,
                type: "mcq",
                options: [
                    "Only var",
                    "let and const",
                    "var and let",
                    "var, let, and const"
                ],
                answer: "let and const",
                explanation: "let and const were introduced in ES6 to provide true block scoping. var is only bounded by function bodies.",
                category: "Conceptual",
                order: 2
            },
            {
                id: "q-scope-1-3",
                question: "What will be logged to the console by the following code?",
                code: `function test() {\n    let score = 100;\n}\ntest();\nconsole.log(typeof score);`,
                type: "output",
                options: [],
                answer: `"undefined"`,
                explanation: "score is local to test(). Outside test(), score does not exist in scope. typeof on an undeclared/out-of-scope variable safely returns 'undefined'.",
                category: "Console Output",
                order: 3
            },
            {
                id: "q-scope-1-4",
                question: "Explain the difference between Global Scope and Function Scope in technical interviews.",
                code: ``,
                type: "interview",
                options: [],
                answer: "Global scope is accessible anywhere in the application lifetime, while function scope creates an isolated lexical boundary where variables exist only during function execution.",
                explanation: "Global variables can lead to namespace collisions and memory leaks, whereas function scope ensures encapsulation and clean garbage collection.",
                category: "Interview",
                order: 4
            }
        ],
        tasks: [
            {
                id: "t-scope-1-1",
                taskNumber: 1,
                title: "Demonstrate Block Scope with let vs var",
                level: "Level 1",
                category: "Scope Basics",
                description: "Write an if-block containing a var and a let variable. Log both inside the block, and then observe the behavior when accessed outside.",
                requirements: [
                    "Create an if (true) block.",
                    "Declare inside the block: var insideVar = 'Visible' and let insideLet = 'Hidden'.",
                    "Log insideVar outside the block.",
                    "Demonstrate that accessing insideLet outside the block is prevented by block scope."
                ],
                example: "insideVar prints 'Visible', insideLet is scoped to block.",
                hints: ["Remember that let is trapped inside { }."],
                starterCode: `if (true) {\n    var insideVar = "Visible";\n    let insideLet = "Hidden";\n}\n\n// 1. Log the leaked variable\nconsole.log(insideVar);\n\n// 2. Note: accessing insideLet here would throw ReferenceError\n`
            },
            {
                id: "t-scope-1-2",
                taskNumber: 2,
                title: "Function Scope Isolation",
                level: "Level 2",
                category: "Scope Encapsulation",
                description: "Create a function `createUserSession` that stores private user data and returns a safe summary object without exposing raw internal variables.",
                requirements: [
                    "Define a function createUserSession(username).",
                    "Declare a local variable let sessionId = Math.random().",
                    "Return an object with username and a method getSessionId() that accesses sessionId via local scope.",
                    "Verify sessionId cannot be modified directly from outside."
                ],
                example: "session.username is accessible, but sessionId is encapsulated.",
                hints: ["Local variables are inaccessible from global scope."],
                starterCode: `function createUserSession(username) {\n    let sessionId = "SESSION-" + Math.floor(Math.random() * 10000);\n    \n    return {\n        username,\n        getSessionId: () => sessionId\n    };\n}\n\nconst session = createUserSession("alex");\nconsole.log(session.username);\nconsole.log(session.getSessionId());\n`
            },
            {
                id: "t-scope-1-3",
                taskNumber: 3,
                title: "Loop Counter Scope Comparison (var vs let in for loops)",
                level: "Level 2",
                category: "Scope & Loops",
                description: "Compare the scoping behavior of for loop counters declared with var versus let.",
                requirements: [
                    "Write a loop with for (var i = 0; i < 3; i++).",
                    "Write a second loop with for (let j = 0; j < 3; j++).",
                    "Log i after the first loop to observe leak.",
                    "Confirm j is inaccessible after the second loop."
                ],
                example: "i leaks as 3, j is cleanly disposed.",
                hints: ["var creates 1 binding across all iterations, let creates a fresh binding per iteration."],
                starterCode: `// 1. Loop with var\nfor (var i = 0; i < 3; i++) {\n    // Iterating\n}\nconsole.log("i leaked value:", i);\n\n// 2. Loop with let\nfor (let j = 0; j < 3; j++) {\n    // Iterating\n}\n// j is not accessible here\n`
            },
            {
                id: "t-scope-1-4",
                taskNumber: 4,
                title: "Build a Scope Guard Validator",
                level: "Level 3",
                category: "Scope Architecture",
                description: "Construct a modular function that manages role-based permissions in isolated block scopes to prevent privilege escalation.",
                requirements: [
                    "Create a function executeAdminTask(role, taskName).",
                    "Use an if-block scoped with const/let to validate admin role.",
                    "Ensure temporary security tokens declared inside the block cannot leak outside.",
                    "Return success or error status."
                ],
                example: "executeAdminTask('admin', 'deleteUser') -> { success: true }",
                hints: ["Use const for security tokens inside the authorized block."],
                starterCode: `function executeAdminTask(role, taskName) {\n    if (role === "admin") {\n        const securityToken = "SECRET_TOKEN_9981";\n        return { success: true, task: taskName, authorizedWith: securityToken };\n    }\n    return { success: false, message: "Unauthorized" };\n}\n\nconsole.log(executeAdminTask("admin", "PurgeCache"));\nconsole.log(executeAdminTask("guest", "PurgeCache"));\n`
            }
        ]
    },
    {
        title: "Scope Chain & Lexical Environment",
        type: "text",
        duration: "25 min",
        order: 2,
        content: "Understand how JavaScript resolves variable references by traversing the Scope Chain through nested Lexical Environments.",
        notes: `### 1. What is a Lexical Environment?
- **"Lexical"** means "relating to the physical position where words/code are written" in the source code.
- Whenever an Execution Context is created, a **Lexical Environment** is created alongside it.
- A Lexical Environment consists of:
  1. **Environment Record:** The actual storage of local variables, constants, and function declarations.
  2. **Outer Environment Reference:** A pointer to the parent Lexical Environment where the function was physically defined.

---

### 2. The Scope Chain Mechanism
When JavaScript encounters a variable reference in code, it performs an identifier lookup following these strict steps:
1. **Local Search:** Checks the current active Lexical Environment's record.
2. **Parent Traversal:** If not found locally, it follows the \`outer\` reference to the parent scope.
3. **Chain Resolution:** Continues moving upwards scope by scope until reaching the Global Lexical Environment.
4. **Error Trigger:** If the variable is not found in the Global Scope, the engine throws:
   \`Uncaught ReferenceError: <variable> is not defined\`.

\`\`\`javascript
const globalVal = "Earth";

function country() {
    const countryVal = "India";

    function city() {
        const cityVal = "Bengaluru";
        // Local: cityVal ("Bengaluru")
        // Parent Scope: countryVal ("India")
        // Global Scope: globalVal ("Earth")
        console.log(\`\${cityVal}, \${countryVal}, \${globalVal}\`);
    }

    city();
}

country(); // Logs: "Bengaluru, India, Earth"
\`\`\`

---

### 3. The "One-Way Street" Rule
- **Inner functions can access outer variables.**
- **Outer scopes CANNOT reach inside inner functions.**

\`\`\`javascript
function outer() {
    const outerSecret = "xyz";
    function inner() {
        const innerSecret = "abc";
        console.log(outerSecret); // Allowed!
    }
    inner();
    // console.log(innerSecret); // Error! Outer cannot see inner
}
\`\`\``,
        questions: [
            {
                id: "q-scope-2-1",
                question: "What is logged when an inner function accesses a variable defined in an outer function with the same name as a global variable?",
                code: `const x = 10;\nfunction outer() {\n    const x = 20;\n    function inner() {\n        console.log(x);\n    }\n    inner();\n}\nouter();`,
                type: "output",
                options: [],
                answer: `20`,
                explanation: "The scope chain lookup stops at the closest enclosing scope where 'x' is defined. In this case, outer()'s x (20) is found first before reaching global x (10).",
                category: "Scope Chain",
                order: 1
            },
            {
                id: "q-scope-2-2",
                question: "What does 'Lexical Environment' mean in JavaScript execution context?",
                code: ``,
                type: "conceptual",
                options: [],
                answer: "The environment of variables and functions available based on where the code is physically authored in the source file.",
                explanation: "Lexical scoping means scope is determined at write/parse time, not runtime call location.",
                category: "Conceptual",
                order: 2
            },
            {
                id: "q-scope-2-3",
                question: "What error occurs if an identifier cannot be found after traversing all the way to the Global Environment?",
                code: `function test() {\n    console.log(nonExistentVar);\n}\ntest();`,
                type: "output",
                options: [],
                answer: `ReferenceError: nonExistentVar is not defined`,
                explanation: "When a variable lookup reaches the top of the scope chain (global) without finding a match, JavaScript throws a ReferenceError.",
                category: "Errors",
                order: 3
            },
            {
                id: "q-scope-2-4",
                question: "How does the outer lexical reference enable JavaScript closures?",
                code: ``,
                type: "interview",
                options: [],
                answer: "When a function retains a reference to its outer lexical environment even after the outer function has finished executing, it forms a closure.",
                explanation: "The inner function keeps its outer environment reference alive in memory, preventing garbage collection.",
                category: "Interview",
                order: 4
            }
        ],
        tasks: [
            {
                id: "t-scope-2-1",
                taskNumber: 1,
                title: "Trace 3-Tier Scope Chain",
                level: "Level 1",
                category: "Scope Chain",
                description: "Build 3 nested functions (grandparent, parent, child) and demonstrate accessing variables from all 3 levels inside the innermost child function.",
                requirements: [
                    "Declare a global variable level0 = 'Global'.",
                    "Create grandparent() defining level1 = 'Grandparent'.",
                    "Inside grandparent, create parent() defining level2 = 'Parent'.",
                    "Inside parent, create child() logging all three levels.",
                    "Invoke grandparent() to test output."
                ],
                example: "Child logs 'Child, Parent, Grandparent, Global'.",
                hints: ["Inner functions can look up through multiple layers."],
                starterCode: `const level0 = "Global";\n\nfunction grandparent() {\n    const level1 = "Grandparent";\n    \n    function parent() {\n        const level2 = "Parent";\n        \n        function child() {\n            const level3 = "Child";\n            console.log(\`\${level3} -> \${level2} -> \${level1} -> \${level0}\`);\n        }\n        child();\n    }\n    parent();\n}\n\ngrandparent();\n`
            },
            {
                id: "t-scope-2-2",
                taskNumber: 2,
                title: "Fix Scope Boundary Leak",
                level: "Level 2",
                category: "Debugging",
                description: "Fix a buggy analytics collector where an outer function attempts to access an inner variable directly.",
                requirements: [
                    "Identify why parent function cannot access inner tracker variable.",
                    "Refactor the code so the inner function returns the value to the parent.",
                    "Ensure clean encapsulation without global variables."
                ],
                example: "Parent receives analytics report cleanly.",
                hints: ["Data flows up via return values, not by reading inner scope variables directly."],
                starterCode: `function trackAppPerformance() {\n    function collectMetrics() {\n        const loadTimeMs = 240;\n        const memoryMb = 42;\n        return { loadTimeMs, memoryMb };\n    }\n    \n    // Fix: call collectMetrics and capture the returned data\n    const metrics = collectMetrics();\n    console.log("Report:", metrics);\n}\n\ntrackAppPerformance();\n`
            },
            {
                id: "t-scope-2-3",
                taskNumber: 3,
                title: "Build a Config Resolver with Fallback Chain",
                level: "Level 2",
                category: "Architecture",
                description: "Create a hierarchical configuration resolver that checks local component overrides, module config, and global app defaults.",
                requirements: [
                    "Define a global default theme 'light'.",
                    "Create a module scope with custom theme 'dark'.",
                    "Create a component that can either provide its own theme or fall back through the scope chain.",
                    "Log theme resolution."
                ],
                example: "Component without override uses module theme 'dark'.",
                hints: ["Use scope chain fallback resolution."],
                starterCode: `const defaultTheme = "light";\n\nfunction dashboardModule() {\n    const defaultTheme = "dark"; // Module override\n    \n    function renderCard(hasLocalTheme) {\n        if (hasLocalTheme) {\n            const defaultTheme = "cyberpunk";\n            return \`Applied: \${defaultTheme}\`;\n        }\n        return \`Applied: \${defaultTheme}\`; // Resolves to module theme\n    }\n    \n    console.log(renderCard(true));\n    console.log(renderCard(false));\n}\n\ndashboardModule();\n`
            },
            {
                id: "t-scope-2-4",
                taskNumber: 4,
                title: "Implement a Lexical Environment Logger",
                level: "Level 3",
                category: "Advanced",
                description: "Write a function wrapper that simulates how JavaScript traverses scope layers by recording variable lookups step-by-step.",
                requirements: [
                    "Create a function createScopeResolver(globalEnv).",
                    "Support creating child scopes with parent references.",
                    "Implement a resolve(varName) method that walks up the scope chain.",
                    "Throw descriptive ReferenceError if not found in any layer."
                ],
                example: "resolver.resolve('userId') returns { foundIn: 'local', value: 101 }",
                hints: ["Represent each scope as an object with a parent property."],
                starterCode: `function createScope(name, data, parent = null) {\n    return {\n        name,\n        data,\n        parent,\n        lookup(key) {\n            if (key in this.data) {\n                return { foundIn: this.name, value: this.data[key] };\n            }\n            if (this.parent) {\n                return this.parent.lookup(key);\n            }\n            throw new Error(\`ReferenceError: \${key} is not defined\`);\n        }\n    };\n}\n\nconst globalScope = createScope("global", { app: "NGSkillForge" });\nconst localScope = createScope("topicHub", { topicId: 3 }, globalScope);\n\nconsole.log(localScope.lookup("topicId"));\nconsole.log(localScope.lookup("app"));\n`
            }
        ]
    },
    {
        title: "var vs let/const & Variable Shadowing",
        type: "text",
        duration: "25 min",
        order: 3,
        content: "Deep dive into variable shadowing mechanics, legal vs illegal shadowing rules, and scoping behaviors between var, let, and const.",
        notes: `### 1. What is Variable Shadowing?
When a variable declared in an **inner scope** shares the **exact same name** as a variable in an **outer scope**, the inner variable **shadows (hides)** the outer variable within that inner block.

\`\`\`javascript
const theme = "light"; // Outer variable

if (true) {
    const theme = "dark"; // Inner variable shadows outer 'theme'
    console.log(theme); // "dark" (inner)
}

console.log(theme); // "light" (outer remains unaffected)
\`\`\`

---

### 2. Legal vs Illegal Shadowing Rules

#### A. Legal Shadowing (Allowed)
- Shadowing a \`var\` with a \`let\` inside a block: **LEGAL**
- Shadowing a \`let\` with another \`let\` inside a block: **LEGAL**
- Shadowing a \`const\` with another \`const\` inside a block: **LEGAL**

\`\`\`javascript
var a = 10;
if (true) {
    let a = 20; // LEGAL: let shadows var inside block
    console.log(a); // 20
}
console.log(a); // 10
\`\`\`

#### B. Illegal Shadowing (Syntax Error)
- **You CANNOT shadow a \`let\` or \`const\` variable using \`var\` inside the same or nested block!**
- **Why?** \`var\` is not block-scoped. When you declare \`var a\` inside a block, \`var\` tries to hoist itself into the enclosing function or global scope, crossing the block boundary and colliding with the existing \`let a\`.

\`\`\`javascript
let b = 50;

if (true) {
    // var b = 100; 
    // Uncaught SyntaxError: Identifier 'b' has already been declared
}
\`\`\`

---

### 3. Function Boundary Exception
If \`var\` is declared inside a **nested function**, it is contained within that function's scope and does **not** cross into the parent function/global scope. Therefore, shadowing \`let\` with \`var\` inside a function is **LEGAL**:

\`\`\`javascript
let c = 500;

function safeWrapper() {
    var c = 1000; // LEGAL: var is contained inside function scope
    console.log(c); // 1000
}
safeWrapper();
console.log(c); // 500
\`\`\``,
        questions: [
            {
                id: "q-scope-3-1",
                question: "What is the result of attempting to shadow an outer let variable with var inside a block?",
                code: `let x = 10;\n{\n    var x = 20;\n}`,
                type: "output",
                options: [],
                answer: `SyntaxError: Identifier 'x' has already been declared`,
                explanation: "This is illegal shadowing. var tries to hoist to the enclosing function/global scope, conflicting with the let declaration.",
                category: "Shadowing",
                order: 1
            },
            {
                id: "q-scope-3-2",
                question: "Which of the following shadowing scenarios is valid and legal in JavaScript?",
                code: ``,
                type: "mcq",
                options: [
                    "Shadowing outer let with inner var inside a block",
                    "Shadowing outer var with inner let inside a block",
                    "Shadowing outer const with inner var inside a block",
                    "Re-declaring let in the same scope"
                ],
                answer: "Shadowing outer var with inner let inside a block",
                explanation: "A let variable inside a block is strictly contained in that block and can legally shadow an outer var.",
                category: "Conceptual",
                order: 2
            },
            {
                id: "q-scope-3-3",
                question: "What will be logged to the console by the following code?",
                code: `var count = 5;\nfunction counter() {\n    var count = 10;\n    if (true) {\n        let count = 20;\n        console.log(count);\n    }\n    console.log(count);\n}\ncounter();\nconsole.log(count);`,
                type: "output",
                options: [],
                answer: `20\n10\n5`,
                explanation: "Inside the if-block, let count is 20. Inside counter(), var count is 10. In the global scope, var count is 5.",
                category: "Console Output",
                order: 3
            },
            {
                id: "q-scope-3-4",
                question: "Why does shadowing let with var inside a function work, but inside a block fail?",
                code: ``,
                type: "interview",
                options: [],
                answer: "Functions create an absolute scope boundary for var, preventing it from leaking into the parent scope. Blocks do not contain var, causing it to collide with the outer let.",
                explanation: "var respects function boundaries but completely ignores plain block boundaries.",
                category: "Interview",
                order: 4
            }
        ],
        tasks: [
            {
                id: "t-scope-3-1",
                taskNumber: 1,
                title: "Implement Multi-Tier Variable Shadowing",
                level: "Level 1",
                category: "Variable Shadowing",
                description: "Declare a variable named `status` at the global level, shadow it inside a function, and shadow it again inside an if-block.",
                requirements: [
                    "Declare const status = 'Global Ready'.",
                    "Inside processTask(), declare let status = 'Processing'.",
                    "Inside an if (true) block, declare const status = 'Completed'.",
                    "Log status at each level and verify each scope retains its own value."
                ],
                example: "Outputs: 'Completed', 'Processing', 'Global Ready'.",
                hints: ["Use let or const at each block level."],
                starterCode: `const status = "Global Ready";\n\nfunction processTask() {\n    let status = "Processing";\n    \n    if (true) {\n        const status = "Completed";\n        console.log("Block:", status);\n    }\n    console.log("Function:", status);\n}\n\nprocessTask();\nconsole.log("Global:", status);\n`
            },
            {
                id: "t-scope-3-2",
                taskNumber: 2,
                title: "Identify & Fix Illegal Variable Shadowing",
                level: "Level 2",
                category: "Bug Fix",
                description: "Fix a code snippet that triggers a SyntaxError due to illegal shadowing of a let variable.",
                requirements: [
                    "Locate the illegal var declaration inside a block.",
                    "Refactor the declaration to use let/const so it respects block scope.",
                    "Verify the script executes without throwing a SyntaxError."
                ],
                example: "SyntaxError resolved, both values print correctly.",
                hints: ["Change the inner var to let or const."],
                starterCode: `let userToken = "AUTH_HEADER_123";\n\nfunction validateToken() {\n    if (true) {\n        // Fix the line below that would cause SyntaxError\n        let userToken = "LOCAL_OVERRIDE_456";\n        console.log("Inner Token:", userToken);\n    }\n    console.log("Outer Token:", userToken);\n}\n\nvalidateToken();\n`
            },
            {
                id: "t-scope-3-3",
                taskNumber: 3,
                title: "Scope Shadowing in Recursive Calculations",
                level: "Level 2",
                category: "Recursion & Scope",
                description: "Write a recursive factorial function where local parameter shadowing protects outer accumulation state.",
                requirements: [
                    "Create a function calculateFactorial(n).",
                    "Use proper parameter scoping to ensure recursive calls do not overwrite parent step values.",
                    "Return the factorial of n."
                ],
                example: "calculateFactorial(5) -> 120",
                hints: ["Each function call creates its own independent execution context."],
                starterCode: `function calculateFactorial(n) {\n    if (n <= 1) return 1;\n    return n * calculateFactorial(n - 1);\n}\n\nconsole.log("5! =", calculateFactorial(5));\nconsole.log("6! =", calculateFactorial(6));\n`
            },
            {
                id: "t-scope-3-4",
                taskNumber: 4,
                title: "Build an Environment Variable Overrider",
                level: "Level 3",
                category: "System Design",
                description: "Build an environment config loader that safely shadows global configuration variables with tenant-specific and request-specific overrides.",
                requirements: [
                    "Define base globalConfig with apiBase, timeout, and debug flags.",
                    "Implement withTenantScope(tenantConfig, callback).",
                    "Implement withRequestScope(requestConfig, callback).",
                    "Ensure inner scopes shadow parent values without mutating outer configurations."
                ],
                example: "Global timeout 5000 is shadowed by request timeout 1000.",
                hints: ["Use object spread or prototype delegation to shadow properties cleanly."],
                starterCode: `const globalConfig = { apiBase: "https://api.ngskillforge.com", timeout: 5000, debug: false };\n\nfunction withTenantScope(tenantOverrides, fn) {\n    const tenantConfig = { ...globalConfig, ...tenantOverrides };\n    return fn(tenantConfig);\n}\n\nwithTenantScope({ timeout: 10000, debug: true }, (config) => {\n    console.log("Tenant Config:", config);\n});\nconsole.log("Global Unchanged:", globalConfig);\n`
            }
        ]
    },
    {
        title: "Hoisting, Declaration vs Initialization & var",
        type: "text",
        duration: "25 min",
        order: 4,
        content: "Understand the JavaScript Creation Phase, Hoisting mechanics, and why var is initialized with undefined while functions are fully hoisted.",
        notes: `### 1. What is Hoisting?
Hoisting is JavaScript's default behavior of moving variable and function **declarations** to the top of their containing scope during the **Creation Phase** of the Execution Context before code execution.

---

### 2. Declaration vs Initialization
Every variable lifecycle has 3 distinct steps:
1. **Declaration:** Registering the variable name in scope (\`var x;\` or \`let x;\`).
2. **Initialization:** Allocating memory and binding an initial value (\`x = undefined\` or actual value).
3. **Assignment:** Assigning a user-defined value (\`x = 100;\`).

---

### 3. How \`var\` is Hoisted
During the Creation Phase:
- JavaScript scans for all \`var\` declarations.
- It allocates memory for the variable and **immediately initializes it with \`undefined\`**.
- During the Execution Phase, when the code reaches the assignment line, the actual value is assigned.

\`\`\`javascript
console.log(myVar); // Output: undefined (no error!)
var myVar = "Hello World";
console.log(myVar); // Output: "Hello World"
\`\`\`

**How the JavaScript Engine internally interprets this:**
\`\`\`javascript
// Phase 1: Creation Phase (Memory Allocation)
var myVar = undefined;

// Phase 2: Execution Phase
console.log(myVar); // undefined
myVar = "Hello World";
console.log(myVar); // "Hello World"
\`\`\`

---

### 4. Function Declarations vs Function Expressions

#### Function Declarations (Fully Hoisted)
Function declarations are **fully hoisted** along with their complete function body. You can invoke them before their definition line:
\`\`\`javascript
greet(); // Output: "Welcome to NGSkillForge!"

function greet() {
    console.log("Welcome to NGSkillForge!");
}
\`\`\`

#### Function Expressions (Treated as Variable Hoisting)
When assigned to a \`var\`, only the variable declaration is hoisted (as \`undefined\`). Invoking it early throws a \`TypeError\`:
\`\`\`javascript
// sayHello(); // TypeError: sayHello is not a function

var sayHello = function() {
    console.log("Hello!");
};
\`\`\``,
        questions: [
            {
                id: "q-scope-4-1",
                question: "What is logged to the console when accessing a var variable before its declaration line?",
                code: `console.log(product);\nvar product = "Laptop";\nconsole.log(product);`,
                type: "output",
                options: [],
                answer: `undefined\nLaptop`,
                explanation: "var declarations are hoisted and initialized with undefined in the creation phase. The actual string 'Laptop' is assigned during execution.",
                category: "Hoisting",
                order: 1
            },
            {
                id: "q-scope-4-2",
                question: "What error occurs if you call a function expression assigned to a var variable before its assignment?",
                code: `calculate();\nvar calculate = function() {\n    console.log(10 + 20);\n};`,
                type: "output",
                options: [],
                answer: `TypeError: calculate is not a function`,
                explanation: "calculate is hoisted as undefined (a primitive), so attempting to call undefined() throws a TypeError, not a ReferenceError.",
                category: "Errors",
                order: 2
            },
            {
                id: "q-scope-4-3",
                question: "Which of the following is hoisted along with its full implementation/body?",
                code: ``,
                type: "mcq",
                options: [
                    "var assigned to an arrow function",
                    "Function declaration: function foo() { ... }",
                    "let assigned to a function",
                    "const assigned to a function"
                ],
                answer: "Function declaration: function foo() { ... }",
                explanation: "Function declarations are stored in memory with their full body during the Creation Phase.",
                category: "Conceptual",
                order: 3
            },
            {
                id: "q-scope-4-4",
                question: "Explain the two phases of JavaScript execution context in an interview setting.",
                code: ``,
                type: "interview",
                options: [],
                answer: "Phase 1 is the Creation Phase (memory allocation for variables and functions). Phase 2 is the Execution Phase (line-by-line code execution and value assignments).",
                explanation: "Understanding these two phases explains why hoisting, undefined values, and TDZ occur.",
                category: "Interview",
                order: 4
            }
        ],
        tasks: [
            {
                id: "t-scope-4-1",
                taskNumber: 1,
                title: "Trace Memory vs Execution Phase",
                level: "Level 1",
                category: "Hoisting Tracing",
                description: "Write code demonstrating the hoisting behavior of multiple var variables and a function declaration.",
                requirements: [
                    "Log variable x before declaration.",
                    "Invoke sayHi() before its declaration.",
                    "Declare var x = 42 and function sayHi().",
                    "Observe the console output."
                ],
                example: "x prints undefined, sayHi() executes cleanly.",
                hints: ["Function declarations hoist with their body, var hoists as undefined."],
                starterCode: `// 1. Access before declaration\nconsole.log("x before declaration:", x);\nsayHi();\n\n// 2. Declarations\nvar x = 42;\nfunction sayHi() {\n    console.log("Hi from hoisted function!");\n}\n\n// 3. Access after declaration\nconsole.log("x after declaration:", x);\n`
            },
            {
                id: "t-scope-4-2",
                taskNumber: 2,
                title: "Compare Function Declaration vs Expression Hoisting",
                level: "Level 2",
                category: "Functions & Hoisting",
                description: "Construct a test script proving the runtime difference between hoisting a function declaration vs a function expression.",
                requirements: [
                    "Call hoistedDeclaration() before its definition.",
                    "Demonstrate with a try/catch why calling unhoistedExpression() before its definition throws TypeError.",
                    "Assign the function expression to var unhoistedExpression.",
                    "Call both after assignment."
                ],
                example: "Catches TypeError: unhoistedExpression is not a function.",
                hints: ["Use try/catch to gracefully demonstrate the TypeError."],
                starterCode: `// 1. Call function declaration\nhoistedFunc();\n\n// 2. Try calling function expression safely\ntry {\n    unhoistedFunc();\n} catch (err) {\n    console.log("Caught expected error:", err.name, "-", err.message);\n}\n\nfunction hoistedFunc() {\n    console.log("Function declaration executed!");\n}\n\nvar unhoistedFunc = function() {\n    console.log("Function expression executed!");\n};\n`
            },
            {
                id: "t-scope-4-3",
                taskNumber: 3,
                title: "Predict & Refactor Hoisting Collisions",
                level: "Level 2",
                category: "Refactoring",
                description: "Refactor a messy legacy code block where variable declarations and function declarations share the same name.",
                requirements: [
                    "Analyze how function declarations take precedence over var declarations during memory allocation.",
                    "Refactor the code using modern let/const and distinct function names to eliminate ambiguity.",
                    "Verify predictable output."
                ],
                example: "Ambiguous duplicate identifiers eliminated.",
                hints: ["Functions and variables sharing names lead to severe bugs."],
                starterCode: `// Legacy pattern with name collision:\n// var item = 10;\n// function item() { return 20; }\n\n// Refactor cleanly:\nconst itemPrice = 10;\nfunction getItemDetails() {\n    return 20;\n}\n\nconsole.log("Price:", itemPrice);\nconsole.log("Details:", getItemDetails());\n`
            },
            {
                id: "t-scope-4-4",
                taskNumber: 4,
                title: "Build a Hoisting Simulation Engine",
                level: "Level 3",
                category: "Engine Simulation",
                description: "Write a JavaScript utility that parses an array of code instruction tokens and simulates the Creation Phase vs Execution Phase.",
                requirements: [
                    "Implement simulateHoisting(tokens).",
                    "Phase 1: allocate memory for 'var' (as undefined) and 'function' (as [Function]).",
                    "Phase 2: execute assignments and return the final memory state.",
                    "Verify with test statements."
                ],
                example: "simulateHoisting([{ type: 'var', name: 'a', val: 5 }]) -> { a: 5 }",
                hints: ["Separate storage into creation phase and execution phase passes."],
                starterCode: `function simulateEngine(instructions) {\n    const memory = {};\n    \n    // Pass 1: Creation Phase\n    for (const inst of instructions) {\n        if (inst.type === "var") memory[inst.name] = undefined;\n        if (inst.type === "function") memory[inst.name] = inst.body;\n    }\n    \n    console.log("State after Creation Phase:", memory);\n    \n    // Pass 2: Execution Phase\n    for (const inst of instructions) {\n        if (inst.type === "var" && inst.value !== undefined) {\n            memory[inst.name] = inst.value;\n        }\n    }\n    \n    console.log("State after Execution Phase:", memory);\n    return memory;\n}\n\nsimulateEngine([\n    { type: "var", name: "score", value: 95 },\n    { type: "function", name: "getScore", body: "() => 95" }\n]);\n`
            }
        ]
    },
    {
        title: "let, const, TDZ & ReferenceError",
        type: "text",
        duration: "25 min",
        order: 5,
        content: "Master the Temporal Dead Zone (TDZ), why let/const are hoisted into TDZ, and how ReferenceError differs from undefined.",
        notes: `### 1. Are \`let\` and \`const\` Hoisted?
**YES, \`let\` and \`const\` ARE hoisted.**
However, unlike \`var\`, they are **NOT** initialized with \`undefined\`. They remain in an uninitialized state stored in a special phase called the **Temporal Dead Zone (TDZ)**.

---

### 2. What is the Temporal Dead Zone (TDZ)?
The **Temporal Dead Zone (TDZ)** is the time window between the start of a block's execution (when the variable is hoisted into memory) and the moment the variable is officially declared and initialized with a value in the code.

\`\`\`javascript
{
    // <--- TDZ for 'name' starts here!
    // console.log(name); // Uncaught ReferenceError: Cannot access 'name' before initialization
    
    let age = 20;       // age is declared and initialized, its TDZ ends!
    let name = "Lucky"; // <--- TDZ for 'name' ends HERE!
    
    console.log(name);  // "Lucky" (safe to access)
}
\`\`\`

---

### 3. Understanding the Errors: \`ReferenceError\` Breakdown

| Code | Output / Error | Why? |
| :--- | :--- | :--- |
| \`console.log(a); var a = 10;\` | \`undefined\` | \`var\` is hoisted and initialized to \`undefined\`. |
| \`console.log(b); let b = 20;\` | \`ReferenceError: Cannot access 'b' before initialization\` | \`b\` is in the **TDZ**. |
| \`console.log(c);\` | \`ReferenceError: c is not defined\` | \`c\` was **never declared** anywhere in any scope. |

---

### 4. The \`typeof\` TDZ Trap
In old JavaScript (\`var\` era), \`typeof\` was considered 100% safe because undeclared variables returned \`"undefined"\`.
With \`let\` and \`const\`, accessing a variable in the TDZ using \`typeof\` throws a **\`ReferenceError\`**:

\`\`\`javascript
// Undeclared variable (Safe)
console.log(typeof undeclaredVar); // "undefined"

// Variable in TDZ (Throws Error!)
// console.log(typeof tdzVar); // ReferenceError: Cannot access 'tdzVar' before initialization
let tdzVar = 50;
\`\`\`

---

### 5. Why was TDZ Designed?
1. **Catches Bugs Early:** Prevents using uninitialized variables before they are ready.
2. **\`const\` Integrity:** Guarantees that \`const\` variables can never hold \`undefined\` before their initial assignment.`,
        questions: [
            {
                id: "q-scope-5-1",
                question: "What specific error is thrown when trying to access a let or const variable in its TDZ?",
                code: `console.log(userId);\nlet userId = 101;`,
                type: "output",
                options: [],
                answer: `ReferenceError: Cannot access 'userId' before initialization`,
                explanation: "let is hoisted into the Temporal Dead Zone without initialization. Accessing it before its declaration line throws a ReferenceError.",
                category: "TDZ",
                order: 1
            },
            {
                id: "q-scope-5-2",
                question: "What is the result of running typeof on a variable currently in its Temporal Dead Zone?",
                code: `console.log(typeof myKey);\nlet myKey = "abc";`,
                type: "output",
                options: [],
                answer: `ReferenceError: Cannot access 'myKey' before initialization`,
                explanation: "TDZ makes typeof unsafe for let and const before their declaration line.",
                category: "TDZ",
                order: 2
            },
            {
                id: "q-scope-5-3",
                question: "What is the fundamental difference between 'is not defined' and 'Cannot access before initialization'?",
                code: ``,
                type: "conceptual",
                options: [],
                answer: "'is not defined' means the variable was never declared in any scope; 'Cannot access before initialization' means the variable exists in scope but is trapped in the TDZ.",
                explanation: "TDZ proves that let and const are indeed hoisted into memory, just uninitialized.",
                category: "Conceptual",
                order: 3
            },
            {
                id: "q-scope-5-4",
                question: "How does the Temporal Dead Zone protect the behavior of const variables?",
                code: ``,
                type: "interview",
                options: [],
                answer: "Without TDZ, const would have to be initialized to undefined during hoisting, which violates const's immutable assignment guarantee.",
                explanation: "TDZ ensures const is only initialized when its designated assignment expression is evaluated.",
                category: "Interview",
                order: 4
            }
        ],
        tasks: [
            {
                id: "t-scope-5-1",
                taskNumber: 1,
                title: "Catch & Handle TDZ ReferenceErrors",
                level: "Level 1",
                category: "TDZ Basics",
                description: "Write a function that safely demonstrates the TDZ boundary using try...catch blocks.",
                requirements: [
                    "Wrap an early access to a let variable inside try...catch.",
                    "Log the caught error message.",
                    "Declare the let variable after the catch block and log its valid value."
                ],
                example: "Catches 'Cannot access before initialization', then logs initialized value.",
                hints: ["Use try/catch to handle the ReferenceError."],
                starterCode: `try {\n    console.log(score);\n} catch (err) {\n    console.log("Caught TDZ error:", err.message);\n}\n\nlet score = 100;\nconsole.log("Score after TDZ:", score);\n`
            },
            {
                id: "t-scope-5-2",
                taskNumber: 2,
                title: "Compare Error Types: TDZ vs Undeclared",
                level: "Level 2",
                category: "Error Analysis",
                description: "Write a diagnostic function that differentiates between an uninitialized TDZ variable and a completely undeclared variable.",
                requirements: [
                    "Catch TDZ error on let target.",
                    "Catch undeclared error on completely unknown variable.",
                    "Inspect and compare both error messages."
                ],
                example: "Differentiates between 'before initialization' and 'is not defined'.",
                hints: ["Inspect err.message in both catch blocks."],
                starterCode: `function testTDZ() {\n    try {\n        console.log(tdzVar);\n    } catch (e) {\n        console.log("TDZ Error:", e.message);\n    }\n    let tdzVar = 10;\n}\n\nfunction testUndeclared() {\n    try {\n        console.log(nonExistentVar);\n    } catch (e) {\n        console.log("Undeclared Error:", e.message);\n    }\n}\n\ntestTDZ();\ntestUndeclared();\n`
            },
            {
                id: "t-scope-5-3",
                taskNumber: 3,
                title: "Default Parameter TDZ Trap",
                level: "Level 2",
                category: "Parameters & TDZ",
                description: "Demonstrate and fix the TDZ error that occurs when function default parameters reference variables evaluated later in the parameter list.",
                requirements: [
                    "Analyze function test(a = b, b = 2) which triggers TDZ on b.",
                    "Refactor parameter order to function test(b = 2, a = b) so parameters evaluate in valid order.",
                    "Test with and without arguments."
                ],
                example: "test() returns { b: 2, a: 2 } cleanly.",
                hints: ["Function parameters evaluate from left to right in their own parameter scope."],
                starterCode: `// Problematic: function calc(a = b, b = 10) { ... }\n\n// Corrected:\nfunction calculateDiscount(baseDiscount = 5, totalDiscount = baseDiscount + 10) {\n    return { baseDiscount, totalDiscount };\n}\n\nconsole.log(calculateDiscount());\nconsole.log(calculateDiscount(10));\n`
            },
            {
                id: "t-scope-5-4",
                taskNumber: 4,
                title: "Build a TDZ Safe State Container",
                level: "Level 3",
                category: "State Management",
                description: "Implement a SafeState store that prevents consumers from reading uninitialized state properties before an explicit initialization hook runs.",
                requirements: [
                    "Create class SafeStore.",
                    "Implement defineState(key, initialValue) and init().",
                    "Throw explicit ReferenceError if get(key) is called before init() has been called.",
                    "Allow safe reads after init()."
                ],
                example: "store.get('user') throws TDZ error before store.init(), succeeds after.",
                hints: ["Track an isInitialized boolean flag per key."],
                starterCode: `class SafeStore {\n    constructor() {\n        this._state = {};\n        this._initialized = false;\n    }\n    \n    register(key, value) {\n        this._state[key] = value;\n    }\n    \n    init() {\n        this._initialized = true;\n    }\n    \n    get(key) {\n        if (!this._initialized) {\n            throw new Error(\`ReferenceError: Cannot access '\${key}' before store initialization\`);\n        }\n        return this._state[key];\n    }\n}\n\nconst store = new SafeStore();\nstore.register("authToken", "JWT_998877");\n\ntry {\n    console.log(store.get("authToken"));\n} catch (e) {\n    console.log("Caught:", e.message);\n}\n\nstore.init();\nconsole.log("After init:", store.get("authToken"));\n`
            }
        ]
    },
    {
        title: "Comparison Matrix: var vs let vs const",
        type: "text",
        duration: "20 min",
        order: 6,
        content: "Consolidated reference guide, complete comparison matrices, interview flashcards, and best practice rules for variable declarations in modern JavaScript.",
        notes: `### 1. Definitive Feature Comparison Matrix

| Feature | \`var\` | \`let\` | \`const\` |
| :--- | :--- | :--- | :--- |
| **Scope** | Function Scope | Block Scope \`{ }\` | Block Scope \`{ }\` |
| **Hoisting** | Yes (initialized to \`undefined\`) | Yes (stored in **TDZ**) | Yes (stored in **TDZ**) |
| **Temporal Dead Zone (TDZ)** | **No** | **Yes** | **Yes** |
| **Re-declaration** | **Allowed** in same scope | **Forbidden** (SyntaxError) | **Forbidden** (SyntaxError) |
| **Re-assignment** | **Allowed** | **Allowed** | **Forbidden** (TypeError) |
| **Initial Value Required?** | No (\`var x;\`) | No (\`let x;\`) | **YES** (\`const x = 1;\`) |
| **Window Object Property** | **Yes** (\`window.x\`) | **No** | **No** |
| **Introduced In** | ES1 (1997) | ES6 (2015) | ES6 (2015) |

---

### 2. Mutability in \`const\` Objects and Arrays
**Important:** \`const\` prevents **re-assignment** of the variable identifier itself, but does **not** make objects or arrays immutable!
\`\`\`javascript
const user = { name: "Alex" };
user.name = "Lucky"; // ALLOWED: Mutating property
user.age = 24;       // ALLOWED: Adding property

// user = { name: "Bob" }; // TypeError: Assignment to constant variable.
\`\`\`
To make an object deeply immutable, use \`Object.freeze(user)\`.

---

### 3. Industry Best Practice Rules (The 2026 Standard)
1. **Use \`const\` by default:** For all variables, functions, and imports.
2. **Use \`let\` only when you expect reassignment:** E.g., loop counters, accumulators, toggles.
3. **Never use \`var\` in modern codebases:** To avoid hoisting bugs, accidental leaks, and unintended window property pollution.`,
        questions: [
            {
                id: "q-scope-6-1",
                question: "Can properties of an object declared with const be modified?",
                code: `const config = { theme: "light" };\nconfig.theme = "dark";\nconsole.log(config.theme);`,
                type: "output",
                options: [],
                answer: `"dark"`,
                explanation: "const prevents reassignment of the variable binding, but object properties remain mutable.",
                category: "const Mutability",
                order: 1
            },
            {
                id: "q-scope-6-2",
                question: "What error occurs if you declare a const variable without an initial value?",
                code: `const apiKey;`,
                type: "output",
                options: [],
                answer: `SyntaxError: Missing initializer in const declaration`,
                explanation: "const declarations must be initialized with a value at the time of declaration.",
                category: "const Rules",
                order: 2
            },
            {
                id: "q-scope-6-3",
                question: "Which of the following creates a property on the global window object in browsers?",
                code: ``,
                type: "mcq",
                options: [
                    "const app = 'Forge';",
                    "let app = 'Forge';",
                    "var app = 'Forge';",
                    "function parameters"
                ],
                answer: "var app = 'Forge';",
                explanation: "Top-level var declarations in browsers attach to the global window object. let and const do not.",
                category: "Global Object",
                order: 3
            },
            {
                id: "q-scope-6-4",
                question: "Summarize the modern recommendation for choosing between const, let, and var.",
                code: ``,
                type: "interview",
                options: [],
                answer: "Default to const for 90%+ of declarations. Use let only when a variable must be reassigned (e.g., loops). Avoid var completely.",
                explanation: "Following this rule eliminates re-declaration bugs, unexpected hoisting, and scope leakages.",
                category: "Interview",
                order: 4
            }
        ],
        tasks: [
            {
                id: "t-scope-6-1",
                taskNumber: 1,
                title: "Enforce const Object Immutability with Object.freeze",
                level: "Level 1",
                category: "Immutability",
                description: "Demonstrate the difference between standard const object mutability and deep/frozen immutability using Object.freeze().",
                requirements: [
                    "Create const normalObj = { status: 'active' } and mutate normalObj.status.",
                    "Create const frozenObj = Object.freeze({ status: 'active' }) and attempt to mutate it.",
                    "Verify frozenObj remains unchanged."
                ],
                example: "normalObj changes, frozenObj ignores/prevents mutation.",
                hints: ["Object.freeze prevents property additions and modifications."],
                starterCode: `const normalObj = { status: "active" };\nnormalObj.status = "paused";\nconsole.log("Normal:", normalObj.status);\n\nconst frozenObj = Object.freeze({ status: "active" });\nfrozenObj.status = "paused"; // Silently fails in non-strict mode\nconsole.log("Frozen:", frozenObj.status);\n`
            },
            {
                id: "t-scope-6-2",
                taskNumber: 2,
                title: "Refactor Legacy var Codebase to Modern ES6+",
                level: "Level 2",
                category: "Modernization",
                description: "Refactor a legacy JavaScript snippet that heavily uses var, function leaks, and loose loop bindings into clean const/let code.",
                requirements: [
                    "Replace all var declarations with const or let based on re-assignment needs.",
                    "Ensure loops use let for isolated iteration bindings.",
                    "Confirm all tests pass cleanly."
                ],
                example: "Clean modern ES6+ code without any var keywords.",
                hints: ["If a variable is never reassigned, use const; otherwise use let."],
                starterCode: `// Legacy:\n// var total = 0;\n// for (var i = 0; i < 5; i++) {\n//     var multiplier = 2;\n//     total += i * multiplier;\n// }\n\n// Modern ES6+ Refactor:\nlet total = 0;\nfor (let i = 0; i < 5; i++) {\n    const multiplier = 2;\n    total += i * multiplier;\n}\n\nconsole.log("Total:", total);\n`
            },
            {
                id: "t-scope-6-3",
                taskNumber: 3,
                title: "Build a Scope & Declaration Linter Rule",
                level: "Level 2",
                category: "Linting Rules",
                description: "Write a lightweight rule checker that scans code strings and flags any usage of the deprecated `var` keyword.",
                requirements: [
                    "Implement checkCodeStandard(codeString).",
                    "Return an array of violations if 'var ' is detected.",
                    "Suggest replacing with 'const' or 'let'.",
                    "Return pass status if clean."
                ],
                example: "checkCodeStandard('var a = 1;') -> { valid: false, violations: ['Forbidden var keyword on line 1'] }",
                hints: ["Use regex or string searching to find var declarations."],
                starterCode: `function checkCodeStandard(code) {\n    const lines = code.split("\\n");\n    const violations = [];\n    \n    lines.forEach((line, index) => {\n        if (/\\bvar\\s+/.test(line)) {\n            violations.push(\`Line \${index + 1}: Avoid 'var'. Use 'const' or 'let' instead.\`);\n        }\n    });\n    \n    return {\n        valid: violations.length === 0,\n        violations\n    };\n}\n\nconsole.log(checkCodeStandard("const x = 10;\\nvar y = 20;"));\nconsole.log(checkCodeStandard("const x = 10;\\nlet y = 20;"));\n`
            },
            {
                id: "t-scope-6-4",
                taskNumber: 4,
                title: "Comprehensive Scope & Hoisting Interview Simulator",
                level: "Level 3",
                category: "Mastery Challenge",
                description: "Implement an interactive quiz validator that tests user knowledge across all 6 Scope & Hoisting topics.",
                requirements: [
                    "Create an array of quiz questions covering Scope, Hoisting, TDZ, and Shadowing.",
                    "Implement a evaluateQuiz(answers) scoring engine.",
                    "Provide detailed feedback on incorrect answers explaining the underlying JS engine mechanics.",
                    "Return final score and mastery rating."
                ],
                example: "Scores 6/6 -> Mastery Rating: 'Senior JavaScript Engineer'",
                hints: ["Calculate percentage and return a breakdown."],
                starterCode: `const quizBank = [\n    { id: 1, topic: "Block Scope", question: "Is let block-scoped?", answer: "yes" },\n    { id: 2, topic: "TDZ", question: "Does accessing let in TDZ throw ReferenceError?", answer: "yes" },\n    { id: 3, topic: "var Hoisting", question: "What is var initialized to during hoisting?", answer: "undefined" }\n];\n\nfunction evaluateQuiz(userAnswers) {\n    let correct = 0;\n    quizBank.forEach(q => {\n        if (userAnswers[q.id]?.toLowerCase() === q.answer.toLowerCase()) {\n            correct++;\n        }\n    });\n    return {\n        score: \`\${correct}/\${quizBank.length}\`,\n        passed: correct === quizBank.length\n    };\n}\n\nconsole.log(evaluateQuiz({ 1: "yes", 2: "yes", 3: "undefined" }));\n`
            }
        ]
    }
];

async function seedScopeHoisting() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB ✅\n");

        const jsCourse = await Course.findOne({
            title: { $regex: /javascript/i }
        });

        if (!jsCourse) {
            console.error("JavaScript course not found in database!");
            process.exit(1);
        }

        console.log(`Found Course: "${jsCourse.title}" (ID: ${jsCourse._id})`);

        // Find existing Topic 3 ("Scope, Hoisting & TDZ" or "Scope & Hoisting")
        const topicIndex = jsCourse.modules.findIndex(
            (m) => m.order === 3 || m.title.toLowerCase().includes("scope")
        );

        const googleDocUrl = "https://docs.google.com/document/d/1HmMilfLo2XzunXU1hiSSfWNczFZQR4tBhsQHjE-E_Sk/edit?usp=sharing";

        if (topicIndex === -1) {
            console.log("Topic 3 (Scope & Hoisting) not found. Adding as new module...");
            jsCourse.modules.push({
                title: "Scope & Hoisting",
                order: 3,
                description: "Master Global, Function, and Block Scopes, Lexical Environments, Scope Chains, Variable Shadowing, Hoisting, and Temporal Dead Zone (TDZ).",
                notesDocUrl: googleDocUrl,
                lessons: scopeHoistingSubtopics,
                questions: [],
                tasks: []
            });
        } else {
            console.log(`Updating existing Topic ${jsCourse.modules[topicIndex].order}: "${jsCourse.modules[topicIndex].title}" with 6 comprehensive subtopics and Google Docs link...`);
            
            jsCourse.modules[topicIndex].title = "Scope & Hoisting";
            jsCourse.modules[topicIndex].description = "Master Global, Function, and Block Scopes, Lexical Environments, Scope Chains, Variable Shadowing, Hoisting, and Temporal Dead Zone (TDZ).";
            jsCourse.modules[topicIndex].notesDocUrl = googleDocUrl;
            jsCourse.modules[topicIndex].lessons = scopeHoistingSubtopics;
            jsCourse.modules[topicIndex].questions = [];
            jsCourse.modules[topicIndex].tasks = [];
        }

        // Sort modules by order
        jsCourse.modules.sort((a, b) => a.order - b.order);

        await jsCourse.save();
        console.log("JavaScript course successfully updated with Scope & Hoisting curriculum & Google Docs notes! ✅");

        const updatedTopic = jsCourse.modules.find(m => m.order === 3);
        console.log("\nSummary of Updated Topic:");
        console.log(`- Title: ${updatedTopic.title}`);
        console.log(`- Subtopics count: ${updatedTopic.lessons.length}`);
        updatedTopic.lessons.forEach((l, i) => {
            console.log(`  ${i + 1}. "${l.title}" -> ${l.questions.length} questions, ${l.tasks.length} tasks, ${l.notes.length} chars of notes`);
        });

    } catch (err) {
        console.error("Seed failed:", err);
    } finally {
        await mongoose.disconnect();
        console.log("\nMongoDB disconnected.");
    }
}

// Execute if run directly
if (require.main === module) {
    seedScopeHoisting();
}

module.exports = { scopeHoistingSubtopics, seedScopeHoisting };
