require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');
const Course = require('./models/course.model');

const jsSyllabus = [
  {
    title: 'Introduction & How JavaScript Works',
    order: 1,
    lessons: [
      {
        title: 'What is JavaScript & Modern Ecosystem',
        type: 'text',
        content: 'Overview of JavaScript, frontend and backend use cases, browser JS vs Node.js runtime, and ecosystem fundamentals.',
        duration: '15 mins',
        order: 1,
      },
      {
        title: 'JS Engine & V8 Architecture',
        type: 'text',
        content: 'Deep dive into V8 engine, parsing, Abstract Syntax Tree (AST), JIT compilation, and code execution.',
        duration: '20 mins',
        order: 2,
      },
      {
        title: 'Call Stack, Single-Threaded Nature & Strict Mode',
        type: 'text',
        content: 'How the Call Stack executes code sequentially, console methods, and enabling strict mode ("use strict").',
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
        duration: '18 mins',
        order: 1,
      },
      {
        title: 'Primitive Types (String, Number, Boolean, Undefined, Null, BigInt, Symbol)',
        type: 'text',
        content: 'Exploring 7 primitive data types, memory representations, and reference vs primitive concepts.',
        duration: '22 mins',
        order: 2,
      },
      {
        title: 'The typeof Operator & typeof null Quirk',
        type: 'text',
        content: 'Type inspection, historical language quirks like typeof null === "object", and safe type checks.',
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
        duration: '20 mins',
        order: 1,
      },
      {
        title: 'Variable Shadowing & Scoping Rules',
        type: 'text',
        content: 'Legal vs illegal variable shadowing in nested scopes and best practices.',
        duration: '15 mins',
        order: 2,
      },
      {
        title: 'Hoisting & Temporal Dead Zone (TDZ)',
        type: 'text',
        content: 'How declarations are hoisted, undefined behavior of var, TDZ with let/const, and ReferenceErrors.',
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
        duration: '20 mins',
        order: 1,
      },
      {
        title: 'Comparison & Equality (== vs ===)',
        type: 'text',
        content: 'Loose equality (==) coercion algorithms vs strict equality (===), != vs !== comparisons.',
        duration: '18 mins',
        order: 2,
      },
      {
        title: 'Operators & Short-Circuit Evaluation',
        type: 'text',
        content: 'Arithmetic, assignment, ternary operator, operator precedence, and logical (&&, ||) short-circuiting.',
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
        duration: '20 mins',
        order: 1,
      },
      {
        title: 'Loops (for, while, do...while)',
        type: 'text',
        content: 'Loop syntax, counters, nested loops, break and continue statements, and avoiding infinite loops.',
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
        duration: '20 mins',
        order: 1,
      },
      {
        title: 'Parameters, Arguments & Return Values',
        type: 'text',
        content: 'Default parameters, return vs console.log(), implicit vs explicit returns, and function reuse.',
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
        duration: '18 mins',
        order: 1,
      },
      {
        title: 'Basic Array Mutation (push, pop, shift, unshift)',
        type: 'text',
        content: 'Adding and removing elements at start/end of arrays and mutable operations.',
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
        duration: '18 mins',
        order: 1,
      },
      {
        title: 'Searching & Slicing (indexOf, includes, slice, splice)',
        type: 'text',
        content: 'Locating items, slicing without mutation, in-place splicing, concat, join, and reverse.',
        duration: '22 mins',
        order: 2,
      },
      {
        title: 'Sorting Arrays with Comparators',
        type: 'text',
        content: 'Default lexicographical sort vs numeric comparator functions and mutating vs non-mutating methods.',
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
        duration: '22 mins',
        order: 1,
      },
      {
        title: 'Aggregating Data with reduce()',
        type: 'text',
        content: 'Accumulators, initial values, computing totals, grouping items, and method chaining.',
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
        duration: '18 mins',
        order: 1,
      },
      {
        title: 'String Methods & Immutability',
        type: 'text',
        content: 'String indexing, charAt, toUpperCase, toLowerCase, trim, includes, startsWith, slice, replace/replaceAll, split, and template literals.',
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
        duration: '20 mins',
        order: 1,
      },
      {
        title: 'Object Inspection (keys, values, entries, for...in)',
        type: 'text',
        content: 'Iterating objects, Object.assign(), Object.keys(), Object.values(), Object.entries().',
        duration: '18 mins',
        order: 2,
      },
      {
        title: 'Optional Chaining (?.) & Nullish Coalescing (??)',
        type: 'text',
        content: 'Safe nested access without crashes, ?? vs logical OR (||) truthiness differences.',
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
        duration: '20 mins',
        order: 1,
      },
      {
        title: 'Spread (...) vs Rest (...) Operators & Copying',
        type: 'text',
        content: 'Shallow copy, reference vs copy, structuredClone() deep copy, and rest parameters in functions.',
        duration: '22 mins',
        order: 2,
      },
      {
        title: 'Sets & Maps Data Structures',
        type: 'text',
        content: 'Unique value storage with Set, key-value mappings with Map, methods (add, get, has, delete), and Map vs Object.',
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
        duration: '20 mins',
        order: 1,
      },
      {
        title: 'Pure Functions, Side Effects, IIFE & Composition',
        type: 'text',
        content: 'Functional programming principles, side-effect avoidance, Immediately Invoked Function Expressions, and composition.',
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
        duration: '22 mins',
        order: 1,
      },
      {
        title: 'Understanding & Implementing Closures',
        type: 'text',
        content: 'Closure definitions, retained state after function returns, private variables, and function factory patterns.',
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
        duration: '25 mins',
        order: 1,
      },
      {
        title: 'Explicit Binding with call(), apply() & bind()',
        type: 'text',
        content: 'Function borrowing, differences between call, apply, and bind, and common "this" pitfalls.',
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
        duration: '24 mins',
        order: 1,
      },
      {
        title: 'Constructor Functions & the new Keyword',
        type: 'text',
        content: 'Constructor function anatomy, what "new" does under the hood, and attaching methods to .prototype.',
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
        duration: '22 mins',
        order: 1,
      },
      {
        title: 'Inheritance, Encapsulation & Polymorphism',
        type: 'text',
        content: 'Class inheritance with extends & super(), method overriding, getters/setters, and private fields (#).',
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
        duration: '18 mins',
        order: 1,
      },
      {
        title: 'Memory Management, Stack/Heap & Garbage Collection',
        type: 'text',
        content: 'Stack vs Heap memory models, Mark-and-Sweep garbage collection, reachability, and preventing memory leaks.',
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
        duration: '20 mins',
        order: 1,
      },
      {
        title: 'Modifying Elements, Styles & Classes',
        type: 'text',
        content: 'textContent, innerHTML, getAttribute/setAttribute, style properties, classList (add, remove, toggle), and createElement.',
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
        duration: '22 mins',
        order: 1,
      },
      {
        title: 'Event Bubbling, Capturing & Delegation',
        type: 'text',
        content: 'Event flow phases, stopPropagation(), and implementing efficient event delegation patterns.',
        duration: '22 mins',
        order: 2,
      },
      {
        title: 'Performance Optimization: Debounce vs Throttle',
        type: 'text',
        content: 'Writing custom debounce and throttle utilities with setTimeout/clearTimeout for search inputs and scroll handlers.',
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
        duration: '22 mins',
        order: 1,
      },
      {
        title: 'Web Storage (localStorage vs sessionStorage) & JSON',
        type: 'text',
        content: 'Persisting data with setItem/getItem/removeItem, JSON.stringify() & JSON.parse() serialization.',
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
        duration: '24 mins',
        order: 1,
      },
      {
        title: 'The Event Loop, Task Queue & Microtask Queue',
        type: 'text',
        content: 'Detailed execution order: Call Stack -> Microtasks (Promises) -> Macrotasks (Timers), and interview puzzle breakdowns.',
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
        duration: '25 mins',
        order: 1,
      },
      {
        title: 'Modern async/await & Error Handling',
        type: 'text',
        content: 'Writing clean asynchronous code with async/await, try/catch/finally, throw statements, and rejected promise handling.',
        duration: '24 mins',
        order: 2,
      },
      {
        title: 'Promise Combinators (all, allSettled, race, any)',
        type: 'text',
        content: 'Sequential vs parallel async execution using Promise.all(), Promise.allSettled(), Promise.race(), and Promise.any().',
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
        duration: '26 mins',
        order: 1,
      },
      {
        title: 'ES Modules & JavaScript Integration',
        type: 'text',
        content: 'Modular JS with export/import, named vs default exports, module scope, and tying all JS fundamentals together.',
        duration: '22 mins',
        order: 2,
      },
    ],
  },
];

async function updateJsCourse() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const jsCourse = await Course.findOne({ title: 'JavaScript Foundations' });
    if (!jsCourse) {
      console.error('JavaScript Foundations course not found in database.');
      process.exit(1);
    }

    jsCourse.modules = jsSyllabus;
    jsCourse.description = 'Master JavaScript from engine fundamentals and closures to modern ES6+, asynchronous programming, DOM manipulation, and API integration through 24 structured topics.';
    await jsCourse.save();

    console.log(`Successfully updated ${jsCourse.title} with all ${jsSyllabus.length} topics & subtopics!`);
    console.log('\n--- MODULES LIST ---');
    jsSyllabus.forEach(m => {
      console.log(`Module ${m.order}: ${m.title} (${m.lessons.length} lessons/subtopics)`);
    });

    await mongoose.disconnect();
    console.log('\nDone.');
  } catch (err) {
    console.error('Error updating JS course:', err);
    process.exit(1);
  }
}

updateJsCourse();
