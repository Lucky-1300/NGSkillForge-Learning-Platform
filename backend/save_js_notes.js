require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');
const Course = require('./models/course.model');

const jsSyllabusWithNotes = [
  {
    title: 'Introduction & How JavaScript Works',
    order: 1,
    lessons: [
      {
        title: 'What is JavaScript & Modern Ecosystem',
        type: 'text',
        content: 'Overview of JavaScript, frontend and backend use cases, browser JS vs Node.js runtime, and ecosystem fundamentals.',
        notes: '• High-level, garbage-collected, multi-paradigm interpreted/JIT language.\n• Frontend: DOM interaction, browser APIs. Backend: Node.js, Deno, Bun runtimes.\n• Browser provides window, document, fetch; Node.js provides fs, http, process, global.',
        duration: '15 mins',
        order: 1,
      },
      {
        title: 'JS Engine & V8 Architecture',
        type: 'text',
        content: 'Deep dive into V8 engine, parsing, Abstract Syntax Tree (AST), JIT compilation, and code execution.',
        notes: '• V8 Engine Pipeline: Source Code ➔ Parser ➔ AST ➔ Ignition (Interpreter) ➔ TurboFan (JIT Compiler) ➔ Optimized Bytecode.\n• Compilation occurs just-in-time right before execution.',
        duration: '20 mins',
        order: 2,
      },
      {
        title: 'Call Stack, Single-Threaded Nature & Strict Mode',
        type: 'text',
        content: 'How the Call Stack executes code sequentially, console methods, and enabling strict mode ("use strict").',
        notes: '• JS is single-threaded (one Call Stack, executes one statement at a time in LIFO order).\n• "use strict" eliminates silent bugs (prevents accidental globals, duplicate params, throws on writable:false).',
        duration: '15 mins',
        order: 3,
      },
    ],
  },
  {
    title: 'Variables & Data Types',
    order: 2,
    lessons: [
      {
        title: 'Variable Declarations (var, let, const)',
        type: 'text',
        content: 'Declaration vs initialization, reassignment, redeclaration, and identifier naming conventions.',
        notes: '• var: function-scoped, re-declarable, hoisted with undefined.\n• let & const: block-scoped ({...}), not re-declarable in same scope, TDZ protected.\n• const requires immediate initialization and prohibits identifier reassignment.',
        duration: '18 mins',
        order: 1,
      },
      {
        title: 'Primitive Types (String, Number, Boolean, Undefined, Null, BigInt, Symbol)',
        type: 'text',
        content: 'Exploring 7 primitive data types, memory representations, and reference vs primitive concepts.',
        notes: '• 7 Primitive Types: string, number, boolean, undefined, null, bigint, symbol (immutable, passed by value).\n• Reference Types: Object, Array, Function (mutable, stored in heap, passed by reference).',
        duration: '22 mins',
        order: 2,
      },
      {
        title: 'The typeof Operator & typeof null Quirk',
        type: 'text',
        content: 'Type inspection, historical language quirks like typeof null === "object", and safe type checks.',
        notes: '• typeof 42 ➔ "number", typeof "abc" ➔ "string", typeof true ➔ "boolean", typeof undefined ➔ "undefined".\n• typeof null ➔ "object" (famous JS legacy quirk). Use value === null for accurate check.',
        duration: '12 mins',
        order: 3,
      },
    ],
  },
  {
    title: 'Scope, Hoisting & TDZ',
    order: 3,
    lessons: [
      {
        title: 'Global, Function & Block Scope',
        type: 'text',
        content: 'Understanding scope boundaries, scope chain resolution, and var vs let/const scoping rules.',
        notes: '• Global Scope: accessible anywhere.\n• Function Scope: created inside function body.\n• Block Scope: restricted within { } braces for let and const.\n• Scope Chain: inner scopes can access outer variables (lexical lookup).',
        duration: '20 mins',
        order: 1,
      },
      {
        title: 'Variable Shadowing & Scoping Rules',
        type: 'text',
        content: 'Legal vs illegal variable shadowing in nested scopes and best practices.',
        notes: '• Variable Shadowing: inner variable shadows outer variable with the same name.\n• Legal: var shadowed by let. Illegal in same block: let shadowed by var (crosses boundary).',
        duration: '15 mins',
        order: 2,
      },
      {
        title: 'Hoisting & Temporal Dead Zone (TDZ)',
        type: 'text',
        content: 'How declarations are hoisted, undefined behavior of var, TDZ with let/const, and ReferenceErrors.',
        notes: '• Hoisting: declarations moved to memory during creation phase.\n• var initialized with undefined.\n• let/const hoisted into Temporal Dead Zone (TDZ) until evaluation, accessing early throws ReferenceError.',
        duration: '25 mins',
        order: 3,
      },
    ],
  },
  {
    title: 'Type Conversion, Coercion & Operators',
    order: 4,
    lessons: [
      {
        title: 'Explicit Conversion vs Implicit Coercion',
        type: 'text',
        content: 'Number(), String(), Boolean() conversions vs automatic coercion in operations and truthy/falsy evaluation.',
        notes: '• Explicit: Number("123"), String(456), Boolean(0).\n• Implicit: "5" + 2 ➔ "52" (concatenation), "5" - 2 ➔ 3 (numeric coercion).\n• Falsy values: false, 0, -0, 0n, "", null, undefined, NaN. Everything else is truthy.',
        duration: '20 mins',
        order: 1,
      },
      {
        title: 'Comparison & Equality (== vs ===)',
        type: 'text',
        content: 'Loose equality (==) coercion algorithms vs strict equality (===), != vs !== comparisons.',
        notes: '• == (loose equality): coerces operands before comparison (e.g. "5" == 5 is true, null == undefined is true).\n• === (strict equality): checks both type and value without coercion (prefer === always).',
        duration: '18 mins',
        order: 2,
      },
      {
        title: 'Operators & Short-Circuit Evaluation',
        type: 'text',
        content: 'Arithmetic, assignment, ternary operator, operator precedence, and logical (&&, ||) short-circuiting.',
        notes: '• Short-circuit evaluation: && returns first falsy operand (or last value); || returns first truthy operand (or last value).\n• Operator precedence: () > ++/-- > * / > + - > comparison > logical.',
        duration: '18 mins',
        order: 3,
      },
    ],
  },
  {
    title: 'Conditional Statements & Loops',
    order: 5,
    lessons: [
      {
        title: 'Conditional Branching (if, else if, switch, ternary)',
        type: 'text',
        content: 'Control flow structures, nested conditions, and choosing between if-else and switch statements.',
        notes: '• if / else if / else: evaluates boolean conditions in order.\n• Ternary: condition ? exprIfTrue : exprIfFalse.\n• switch (val) with case & break (uses strict === comparison; default branch handles fallthrough).',
        duration: '20 mins',
        order: 1,
      },
      {
        title: 'Loops (for, while, do...while)',
        type: 'text',
        content: 'Loop syntax, counters, nested loops, break and continue statements, and avoiding infinite loops.',
        notes: '• for (let i = 0; i < n; i++): fixed iterations.\n• while (cond): loops while condition is true.\n• do { ... } while (cond): executes at least once.\n• break: exits loop entirely; continue: skips to next iteration.',
        duration: '22 mins',
        order: 2,
      },
    ],
  },
  {
    title: 'Functions – Part 1',
    order: 6,
    lessons: [
      {
        title: 'Function Declarations, Expressions & Arrow Functions',
        type: 'text',
        content: 'Why functions matter, declaration vs expression, anonymous functions, and arrow syntax.',
        notes: '• Function Declaration: function add(a, b) { return a + b; } (hoisted completely).\n• Function Expression: const add = function(a, b) { ... };\n• Arrow Function: const add = (a, b) => a + b; (no own this, arguments, or super).',
        duration: '20 mins',
        order: 1,
      },
      {
        title: 'Parameters, Arguments & Return Values',
        type: 'text',
        content: 'Default parameters, return vs console.log(), implicit vs explicit returns, and function reuse.',
        notes: '• Parameters: variables in definition; Arguments: actual values passed.\n• Default parameters: function greet(name = "Guest") { ... }.\n• return sends value back; without return, function returns undefined.',
        duration: '20 mins',
        order: 2,
      },
    ],
  },
  {
    title: 'Arrays – Fundamentals',
    order: 7,
    lessons: [
      {
        title: 'Array Creation, Indexing & Mutability',
        type: 'text',
        content: 'Array literals, accessing/updating elements, Array.isArray(), length property, and reference behavior.',
        notes: '• Arrays are zero-indexed, ordered lists: const arr = [1, "two", { id: 3 }].\n• Array.isArray(arr) returns true.\n• arr.length gives element count.\n• Arrays are reference types stored in memory heap.',
        duration: '18 mins',
        order: 1,
      },
      {
        title: 'Basic Array Mutation (push, pop, shift, unshift)',
        type: 'text',
        content: 'Adding and removing elements at start/end of arrays and mutable operations.',
        notes: '• push(item): adds to end (mutating).\n• pop(): removes from end (mutating).\n• unshift(item): adds to beginning (mutating).\n• shift(): removes from beginning (mutating).',
        duration: '15 mins',
        order: 2,
      },
    ],
  },
  {
    title: 'Array Iteration & Methods',
    order: 8,
    lessons: [
      {
        title: 'Looping Over Arrays (for, for...of, forEach)',
        type: 'text',
        content: 'Comparing traditional for loops, for...of iteration, and forEach() method.',
        notes: '• for (let i = 0; i < arr.length; i++): indexed loop.\n• for (const item of arr): iterates over values cleanly.\n• arr.forEach((item, idx) => ...): functional iteration (cannot break/return early).',
        duration: '18 mins',
        order: 1,
      },
      {
        title: 'Searching & Slicing (indexOf, includes, slice, splice)',
        type: 'text',
        content: 'Locating items, slicing without mutation, in-place splicing, concat, join, and reverse.',
        notes: '• indexOf(val) / lastIndexOf(val) / includes(val): search elements.\n• slice(start, end): extracts copy (non-mutating).\n• splice(start, deleteCount, ...items): inserts/removes in place (mutating).\n• concat(), join(delimiter), reverse().',
        duration: '22 mins',
        order: 2,
      },
      {
        title: 'Sorting Arrays with Comparators',
        type: 'text',
        content: 'Default lexicographical sort vs numeric comparator functions and mutating vs non-mutating methods.',
        notes: '• arr.sort(): sorts strings alphabetically by default (e.g. [10, 2].sort() is [10, 2]).\n• Numeric sort comparator: arr.sort((a, b) => a - b) ascending, (b - a) descending.',
        duration: '18 mins',
        order: 3,
      },
    ],
  },
  {
    title: 'map, filter, reduce & Higher-Order Methods',
    order: 9,
    lessons: [
      {
        title: 'Transforming Arrays with map() and filter()',
        type: 'text',
        content: 'Functional transformations, callback parameters, predicate filtering, and immutable returns.',
        notes: '• map(fn): creates a new array by transforming every element: [1,2,3].map(x => x * 2) ➔ [2,4,6].\n• filter(predicate): creates a new array with elements that return true: [1,2,3,4].filter(x => x % 2 === 0) ➔ [2,4].',
        duration: '22 mins',
        order: 1,
      },
      {
        title: 'Aggregating Data with reduce()',
        type: 'text',
        content: 'Accumulators, initial values, computing totals, grouping items, and method chaining.',
        notes: '• reduce((acc, curr) => acc + curr, initialVal): accumulates array into single value.\n• Method chaining: arr.filter(...).map(...).reduce(...).',
        duration: '25 mins',
        order: 2,
      },
    ],
  },
  {
    title: 'Advanced Array Methods & Strings',
    order: 10,
    lessons: [
      {
        title: 'find, findIndex, some & every',
        type: 'text',
        content: 'Predicate lookups, boolean checks across collections, and early termination.',
        notes: '• find(fn): returns first matching element (or undefined).\n• findIndex(fn): returns index of first match (or -1).\n• some(fn): true if at least one matches.\n• every(fn): true if all match.',
        duration: '18 mins',
        order: 1,
      },
      {
        title: 'String Methods & Immutability',
        type: 'text',
        content: 'String indexing, charAt, toUpperCase, toLowerCase, trim, includes, startsWith, slice, replace/replaceAll, split, and template literals.',
        notes: '• String immutability: string methods always return new strings.\n• charAt(i), toUpperCase(), toLowerCase(), trim(), includes(sub), startsWith(sub), slice(s, e), replace(a, b), replaceAll(a, b), split(delim).\n• Template literals: `Hello ${name}` support multi-line and interpolation.',
        duration: '22 mins',
        order: 2,
      },
    ],
  },
  {
    title: 'Objects & Modern Object Access',
    order: 11,
    lessons: [
      {
        title: 'Object Literals, Properties & Methods',
        type: 'text',
        content: 'Key-value pairs, dot vs bracket notation, dynamic property access, and nested objects.',
        notes: '• Object literals: const user = { name: "Alice", age: 25, greet() { return "Hi"; } }.\n• Dot notation: user.name; Bracket notation: user["name"] (allows dynamic keys).\n• delete user.age removes property.',
        duration: '20 mins',
        order: 1,
      },
      {
        title: 'Object Inspection (keys, values, entries, for...in)',
        type: 'text',
        content: 'Iterating objects, Object.assign(), Object.keys(), Object.values(), Object.entries().',
        notes: '• Object.keys(obj) ➔ array of keys.\n• Object.values(obj) ➔ array of values.\n• Object.entries(obj) ➔ array of [key, value] pairs.\n• for (const key in obj) iterates enumerable keys.',
        duration: '18 mins',
        order: 2,
      },
      {
        title: 'Optional Chaining (?.) & Nullish Coalescing (??)',
        type: 'text',
        content: 'Safe nested access without crashes, ?? vs logical OR (||) truthiness differences.',
        notes: '• Optional chaining (?.): user?.address?.city avoids "Cannot read properties of undefined" errors.\n• Nullish coalescing (??): value ?? fallback returns fallback ONLY for null or undefined (preserves 0, false, "").',
        duration: '15 mins',
        order: 3,
      },
    ],
  },
  {
    title: 'Destructuring, Spread/Rest, Copying, Set & Map',
    order: 12,
    lessons: [
      {
        title: 'Array & Object Destructuring',
        type: 'text',
        content: 'Extracting values, default values, renaming variables, and nested destructuring patterns.',
        notes: '• Destructuring: const [a, b = 10] = arr; const { name: userName, age } = user.\n• Nested destructuring: const { address: { city } } = user.',
        duration: '20 mins',
        order: 1,
      },
      {
        title: 'Spread (...) vs Rest (...) Operators & Copying',
        type: 'text',
        content: 'Shallow copy, reference vs copy, structuredClone() deep copy, and rest parameters in functions.',
        notes: '• Spread (...arr): expands elements: const copy = [...arr, 4, 5]; const merged = { ...obj1, ...obj2 }.\n• Rest (...args): gathers remaining elements into array.\n• Shallow copy copies references for nested objects; use structuredClone(obj) for deep copy.',
        duration: '22 mins',
        order: 2,
      },
      {
        title: 'Sets & Maps Data Structures',
        type: 'text',
        content: 'Unique value storage with Set, key-value mappings with Map, methods (add, get, has, delete), and Map vs Object.',
        notes: '• Set: collection of unique values (add, has, delete, size). const unique = [...new Set(arr)].\n• Map: key-value store supporting any data type as key (set, get, has, delete, size).',
        duration: '20 mins',
        order: 3,
      },
    ],
  },
  {
    title: 'Functions – Part 2 & Higher-Order Functions',
    order: 13,
    lessons: [
      {
        title: 'First-Class Functions & Callbacks',
        type: 'text',
        content: 'Functions as first-class citizens, passing functions as arguments, returning functions from functions.',
        notes: '• First-class functions: functions can be stored in variables, passed as arguments (callbacks), and returned from other functions.\n• Higher-Order Function (HOF): a function that takes or returns another function.',
        duration: '20 mins',
        order: 1,
      },
      {
        title: 'Pure Functions, Side Effects, IIFE & Composition',
        type: 'text',
        content: 'Functional programming principles, side-effect avoidance, Immediately Invoked Function Expressions, and composition.',
        notes: '• Pure Function: same input always produces same output with no side effects (no mutation, no I/O).\n• IIFE: (function() { ... })(); executes immediately and encapsulates private scope.\n• Function composition: pipe(f, g)(x) ➔ g(f(x)).',
        duration: '22 mins',
        order: 2,
      },
    ],
  },
  {
    title: 'Lexical Scope & Closures',
    order: 14,
    lessons: [
      {
        title: 'Lexical Environment & Scope Chains',
        type: 'text',
        content: 'How JavaScript resolves variables lexically based on code placement in nested execution contexts.',
        notes: '• Lexical Environment: where code is physically written determines variable accessibility.\n• Scope Chain: JS engine searches current environment, then parent environments, up to global.',
        duration: '22 mins',
        order: 1,
      },
      {
        title: 'Understanding & Implementing Closures',
        type: 'text',
        content: 'Closure definitions, retained state after function returns, private variables, and function factory patterns.',
        notes: '• Closure: a function bundled together with references to its lexical environment.\n• When an outer function returns, the inner function retains access to outer variables in memory.\n• Used for data privacy, memoization, currying, and event handlers.',
        duration: '26 mins',
        order: 2,
      },
    ],
  },
  {
    title: 'this, call, apply & bind',
    order: 15,
    lessons: [
      {
        title: 'The this Keyword & Execution Context',
        type: 'text',
        content: 'Determining "this" in global scope, regular functions, object methods, and lexical this in arrow functions.',
        notes: '• "this" refers to the object executing the current function.\n• Global context: window / global (undefined in strict mode).\n• Method invocation: obj.func() ➔ this is obj.\n• Arrow functions do NOT have own "this"; they inherit "this" lexically from enclosing scope.',
        duration: '25 mins',
        order: 1,
      },
      {
        title: 'Explicit Binding with call(), apply() & bind()',
        type: 'text',
        content: 'Function borrowing, differences between call, apply, and bind, and common "this" pitfalls.',
        notes: '• call(context, arg1, arg2): invokes function immediately with explicit this and comma arguments.\n• apply(context, [args]): invokes function with array of arguments.\n• bind(context, arg1): returns a new bound function to invoke later.',
        duration: '24 mins',
        order: 2,
      },
    ],
  },
  {
    title: 'Prototypes & Prototype Inheritance',
    order: 16,
    lessons: [
      {
        title: 'The Prototype Mental Model & [[Prototype]]',
        type: 'text',
        content: 'Understanding prototype chains, Object.getPrototypeOf(), and own vs inherited properties with hasOwnProperty().',
        notes: '• Every JS object has an internal [[Prototype]] link (accessible via Object.getPrototypeOf(obj) or __proto__).\n• If property not found on object, JS traverses prototype chain until null is reached.\n• obj.hasOwnProperty("prop") checks if property belongs to instance vs prototype.',
        duration: '24 mins',
        order: 1,
      },
      {
        title: 'Constructor Functions & the new Keyword',
        type: 'text',
        content: 'Constructor function anatomy, what "new" does under the hood, and attaching methods to .prototype.',
        notes: '• Constructor Function: function User(name) { this.name = name; } User.prototype.greet = function() { ... };\n• "new" operator: 1) creates empty object, 2) sets prototype link, 3) binds this, 4) returns object.',
        duration: '22 mins',
        order: 2,
      },
    ],
  },
  {
    title: 'Classes & Object-Oriented Programming',
    order: 17,
    lessons: [
      {
        title: 'ES6 Class Syntax & Instances',
        type: 'text',
        content: 'Class declarations, constructors, instance properties/methods, and relationship to prototypes.',
        notes: '• class User { constructor(name) { this.name = name; } greet() { return "Hi"; } }\n• Syntactic sugar over prototype-based inheritance.\n• Static methods: User.create() (called on class, not instance).',
        duration: '22 mins',
        order: 1,
      },
      {
        title: 'Inheritance, Encapsulation & Polymorphism',
        type: 'text',
        content: 'Class inheritance with extends & super(), method overriding, getters/setters, and private fields (#).',
        notes: '• Inheritance: class Admin extends User { constructor(name, role) { super(name); this.role = role; } }\n• Private fields (#field): #password cannot be accessed outside class body.\n• Getters & Setters: get fullName(), set fullName(val).',
        duration: '25 mins',
        order: 2,
      },
    ],
  },
  {
    title: 'Math, Date, Memory & Garbage Collection',
    order: 18,
    lessons: [
      {
        title: 'Math & Date Built-ins',
        type: 'text',
        content: 'Math methods (round, floor, ceil, trunc, random, pow), Date parsing, timestamps, and formatting.',
        notes: '• Math: Math.floor(4.9) ➔ 4, Math.ceil(4.1) ➔ 5, Math.round(4.5) ➔ 5, Math.random() ➔ [0, 1).\n• Date: new Date(), date.toISOString(), date.getTime() (epoch ms).',
        duration: '18 mins',
        order: 1,
      },
      {
        title: 'Memory Management, Stack/Heap & Garbage Collection',
        type: 'text',
        content: 'Stack vs Heap memory models, Mark-and-Sweep garbage collection, reachability, and preventing memory leaks.',
        notes: '• Memory Stack: stores primitive values and function call execution contexts.\n• Memory Heap: stores objects and dynamic reference types.\n• Garbage Collection: Mark-and-Sweep algorithm automatically frees unreachable memory.\n• Memory leaks: uncleaned timers, global variables, dangling event listeners.',
        duration: '22 mins',
        order: 2,
      },
    ],
  },
  {
    title: 'DOM Fundamentals & Manipulation',
    order: 19,
    lessons: [
      {
        title: 'The DOM Tree & Node Selection',
        type: 'text',
        content: 'Understanding DOM representation, querySelector, querySelectorAll, getElementById, and node types.',
        notes: '• Document Object Model (DOM): hierarchical tree representation of HTML markup.\n• Selection: document.querySelector(".card"), document.querySelectorAll("p"), document.getElementById("app").',
        duration: '20 mins',
        order: 1,
      },
      {
        title: 'Modifying Elements, Styles & Classes',
        type: 'text',
        content: 'textContent, innerHTML, getAttribute/setAttribute, style properties, classList (add, remove, toggle), and createElement.',
        notes: '• Manipulation: el.textContent (plain text), el.innerHTML (HTML markup).\n• Styles: el.style.backgroundColor = "blue".\n• Classes: el.classList.add("active"), el.classList.remove("hidden"), el.classList.toggle("dark").\n• Creation: const btn = document.createElement("button"); parent.appendChild(btn).',
        duration: '25 mins',
        order: 2,
      },
    ],
  },
  {
    title: 'Events, Event Flow, Delegation & Debounce/Throttle',
    order: 20,
    lessons: [
      {
        title: 'Event Listeners & Event Object',
        type: 'text',
        content: 'addEventListener, event types (click, input, change, submit, keydown), event.target, and preventDefault().',
        notes: '• el.addEventListener("click", (e) => { ... });\n• Event Object: e.target (element triggered), e.currentTarget (element listener attached), e.preventDefault() (cancels default behavior).',
        duration: '22 mins',
        order: 1,
      },
      {
        title: 'Event Bubbling, Capturing & Delegation',
        type: 'text',
        content: 'Event flow phases, stopPropagation(), and implementing efficient event delegation patterns.',
        notes: '• Event Bubbling: event propagates from target up through parent nodes.\n• Event Capturing: event propagates from window down to target.\n• Event Delegation: attaching one listener on parent to handle child events via e.target.matches().',
        duration: '22 mins',
        order: 2,
      },
      {
        title: 'Performance Optimization: Debounce vs Throttle',
        type: 'text',
        content: 'Writing custom debounce and throttle utilities with setTimeout/clearTimeout for search inputs and scroll handlers.',
        notes: '• Debounce: delays execution until user stops calling for X ms (search inputs, auto-save).\n• Throttle: guarantees execution at most once every X ms (scroll, window resize).',
        duration: '25 mins',
        order: 3,
      },
    ],
  },
  {
    title: 'Forms, Validation, Storage & JSON',
    order: 21,
    lessons: [
      {
        title: 'Form Handling & Custom Validation',
        type: 'text',
        content: 'Reading input values, form submission lifecycles, and validating email/password inputs with error UI.',
        notes: '• form.addEventListener("submit", (e) => { e.preventDefault(); const val = input.value.trim(); });\n• Validations: regex testing, required checks, displaying error messages dynamically.',
        duration: '22 mins',
        order: 1,
      },
      {
        title: 'Web Storage (localStorage vs sessionStorage) & JSON',
        type: 'text',
        content: 'Persisting data with setItem/getItem/removeItem, JSON.stringify() & JSON.parse() serialization.',
        notes: '• localStorage: persists across browser restarts (~5MB limit).\n• sessionStorage: cleared when tab/window closes (~5MB limit).\n• JSON.stringify(obj) converts object to string; JSON.parse(str) converts string back to object.',
        duration: '20 mins',
        order: 2,
      },
    ],
  },
  {
    title: 'Asynchronous JavaScript & Event Loop',
    order: 22,
    lessons: [
      {
        title: 'Synchronous vs Asynchronous & Web APIs',
        type: 'text',
        content: 'Non-blocking I/O, setTimeout, setInterval, callbacks, and avoiding callback hell.',
        notes: '• JavaScript is single-threaded but non-blocking thanks to browser Web APIs.\n• Asynchronous operations (setTimeout, fetch, event listeners) are offloaded to Web APIs.',
        duration: '24 mins',
        order: 1,
      },
      {
        title: 'The Event Loop, Task Queue & Microtask Queue',
        type: 'text',
        content: 'Detailed execution order: Call Stack -> Microtasks (Promises) -> Macrotasks (Timers), and interview puzzle breakdowns.',
        notes: '• Event Loop: continuously checks if Call Stack is empty.\n• Priority Order: 1) Synchronous Call Stack ➔ 2) Microtask Queue (Promise .then/catch, queueMicrotask) ➔ 3) Macrotask Queue (setTimeout, setInterval, I/O).',
        duration: '28 mins',
        order: 2,
      },
    ],
  },
  {
    title: 'Promises, Async/Await & Error Handling',
    order: 23,
    lessons: [
      {
        title: 'Promise Lifecycle & Chaining',
        type: 'text',
        content: 'Creating Promises, resolve, reject, pending/fulfilled/rejected states, .then(), .catch(), .finally(), and error propagation.',
        notes: '• Promise States: pending ➔ fulfilled (with value) OR rejected (with error).\n• new Promise((resolve, reject) => { ... });\n• Consuming: promise.then(data => ...).catch(err => ...).finally(() => ...).',
        duration: '25 mins',
        order: 1,
      },
      {
        title: 'Modern async/await & Error Handling',
        type: 'text',
        content: 'Writing clean asynchronous code with async/await, try/catch/finally, throw statements, and rejected promise handling.',
        notes: '• async function returns a promise implicitly.\n• await pauses execution until promise settles: const data = await fetchData();\n• try { ... } catch (err) { console.error(err); } finally { ... } handles errors cleanly.',
        duration: '24 mins',
        order: 2,
      },
      {
        title: 'Promise Combinators (all, allSettled, race, any)',
        type: 'text',
        content: 'Sequential vs parallel async execution using Promise.all(), Promise.allSettled(), Promise.race(), and Promise.any().',
        notes: '• Promise.all([p1, p2]): resolves when all resolve, rejects if ANY rejects.\n• Promise.allSettled([p1, p2]): waits for all to settle with status ({ status: "fulfilled" | "rejected" }).\n• Promise.race([p1, p2]): returns first settled promise.',
        duration: '22 mins',
        order: 3,
      },
    ],
  },
  {
    title: 'Fetch API, HTTP/API Basics & ES Modules',
    order: 24,
    lessons: [
      {
        title: 'HTTP Basics & Fetch API Mastery',
        type: 'text',
        content: 'Client-server requests, HTTP methods (GET, POST), status codes, response.json(), headers, request bodies, and loading/error states.',
        notes: '• fetch(url, options) returns a Promise resolving to Response object.\n• Check res.ok (true if status 200-299) before parsing JSON.\n• POST Request: fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).',
        duration: '26 mins',
        order: 1,
      },
      {
        title: 'ES Modules & JavaScript Integration',
        type: 'text',
        content: 'Modular JS with export/import, named vs default exports, module scope, and tying all JS fundamentals together.',
        notes: '• ES Modules: export const add = ...; export default class ...;\n• Importing: import { add } from "./math.js"; import User from "./user.js";\n• ES Modules have module scope, run in strict mode, and support top-level await.',
        duration: '22 mins',
        order: 2,
      },
    ],
  },
];

async function updateNotes() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const jsCourse = await Course.findOne({ title: 'JavaScript Foundations' });
    if (!jsCourse) {
      console.error('Course not found');
      process.exit(1);
    }

    jsCourse.modules = jsSyllabusWithNotes;
    await jsCourse.save();

    console.log('Successfully updated JavaScript course with in-depth notes for all 24 topics!');
    await mongoose.disconnect();
    console.log('Done.');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

updateNotes();
