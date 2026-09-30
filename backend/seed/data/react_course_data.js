/**
 * Seed Data: React Interface Workshop
 */
module.exports = {
  title: 'React Interface Workshop',
  modules: [
    {
      title: 'React Fundamentals, JSX & Virtual DOM',
      order: 1,
      description: 'Understand the declarative component mental model, JSX compilation, and Virtual DOM reconciliation.',
      lessons: [
        {
          title: 'Declarative UI, Virtual DOM & JSX Rules',
          type: 'text',
          duration: '20 mins',
          order: 1,
          content: `### 1. The Declarative React Paradigm
In imperative vanilla JavaScript, you manually query and mutate DOM nodes:
\`\`\`javascript
// Imperative (Vanilla JS)
const btn = document.getElementById('btn');
btn.innerText = 'Submitted';
btn.classList.add('active');
\`\`\`

In React, you declare *what* the UI should look like for a given state, and React efficiently updates the real DOM via the **Virtual DOM** and the **Fiber Reconciliation Engine**:
\`\`\`jsx
// Declarative (React)
function SubmitButton({ isSubmitted }) {
  return (
    <button className={isSubmitted ? 'btn active' : 'btn'}>
      {isSubmitted ? 'Submitted' : 'Submit Application'}
    </button>
  );
}
\`\`\`

---

### 2. Core JSX Rules
1. **Return a Single Root Element:** Multiple JSX elements must be wrapped in a parent tag or Fragment (\`<> ... </>\`).
2. **Close All Tags:** Self-closing elements like \`<img>\`, \`<input>\`, and \`<br>\` must end with \`/>\`.
3. **CamelCase Property Names:** Use \`className\` instead of \`class\`, \`htmlFor\` instead of \`for\`, and \`tabIndex\` instead of \`tabindex\`.`,
          notes: `• JSX is syntactic sugar that compiles to React.createElement() calls.
• React Fragments (<> ... </>) allow returning multiple elements without adding unnecessary DOM nodes.
• The Virtual DOM minimizes costly direct browser DOM reflows and repaints.`,
          questions: [
            {
              id: 'q-react-1-1-1',
              question: 'Why do we use className instead of class when writing JSX in React components?',
              code: '<div className="container">Hello</div>',
              type: 'mcq',
              options: [
                'Because class is a reserved keyword in JavaScript',
                'Because className performs faster in the browser',
                'Because class is only for CSS Grid layouts',
                'Because React does not support standard CSS classes'
              ],
              answer: 'Because class is a reserved keyword in JavaScript',
              explanation: 'JSX compiles to standard JavaScript function calls. Because class is a reserved JS keyword, React uses className to represent HTML class attributes.',
              category: 'JSX Rules',
              order: 1,
            },
          ],
          tasks: [
            {
              id: 't-react-1-1-1',
              taskNumber: 1,
              title: 'Create a Declarative User Profile Badge Component',
              level: 'Level 1',
              category: 'JSX Components',
              description: 'Build a React component that renders a user avatar, username, role badge, and online status indicator using JSX fragments and conditional class names.',
              requirements: [
                'Wrap output in a React Fragment <> ... </>',
                'Use className with conditional class logic for online indicator',
                'Render image with alt text'
              ],
              example: '<div className={`badge ${isOnline ? "online" : "offline"}`}>...</div>',
              hints: ['Use template literals or ternary operators for dynamic className strings.'],
              starterCode: `export default function UserBadge({ user }) {\n  return (\n    // Write your JSX here\n  );\n}\n`,
            },
          ],
        },
      ],
    },
    {
      title: 'Props & Component Composition',
      order: 2,
      description: 'Master unidirectional data flow, props destructuring, children composition, and reusable UI architectures.',
      lessons: [
        {
          title: 'Props Passing, Destructuring & children Composition',
          type: 'text',
          duration: '22 mins',
          order: 1,
          content: `### 1. Props & Unidirectional Data Flow
Props (short for properties) are read-only inputs passed from parent components down to child components.

\`\`\`jsx
// Child Component with Destructured Props & Defaults
function CourseCard({ title, instructor = 'Staff', duration, level = 'Beginner', isPopular }) {
  return (
    <article className="course-card">
      {isPopular && <span className="badge-popular">Popular</span>}
      <h3>{title}</h3>
      <p>Instructor: {instructor}</p>
      <div className="meta">
        <span>{duration}</span> • <span>{level}</span>
      </div>
    </article>
  );
}

// Parent Usage
export default function Catalog() {
  return (
    <CourseCard 
      title="React Interface Workshop" 
      instructor="Daniel Mensah" 
      duration="8 weeks" 
      level="Intermediate" 
      isPopular={true} 
    />
  );
}
\`\`\`

---

### 2. Component Composition with \`props.children\`
\`props.children\` allows components to serve as flexible generic wrappers (Modals, Cards, Containers, Drawers):

\`\`\`jsx
function CardContainer({ title, children, footerAction }) {
  return (
    <div className="card-wrapper">
      <div className="card-header">
        <h2>{title}</h2>
      </div>
      <div className="card-body">
        {children}
      </div>
      {footerAction && <div className="card-footer">{footerAction}</div>}
    </div>
  );
}
\`\`\``,
          notes: `• Props are immutable. A component must never modify its own props.
• Use default parameters when destructuring props to provide robust fallback values.
• props.children enables powerful composition without deep prop drilling.`,
          questions: [
            {
              id: 'q-react-2-1-1',
              question: 'Can a child component directly modify the props passed to it by its parent?',
              code: 'function Widget(props) {\n  props.title = "New Title"; // Is this valid?\n}',
              type: 'mcq',
              options: [
                'No, props are read-only and immutable in React',
                'Yes, but only if the prop is a string',
                'Yes, if using strict mode',
                'Only when using class components'
              ],
              answer: 'No, props are read-only and immutable in React',
              explanation: 'React components must act like pure functions with respect to their props. Modifying props causes unexpected rendering bugs and breaks one-way data flow.',
              category: 'React Architecture',
              order: 1,
            },
          ],
          tasks: [
            {
              id: 't-react-2-1-1',
              taskNumber: 1,
              title: 'Build a Reusable Modal Container with Composition',
              level: 'Level 2',
              category: 'Composition',
              description: 'Create a Card / Modal wrapper component that accepts title, isOpen, onClose callback, actionButtons, and renders arbitrary children inside its body.',
              requirements: [
                'Render conditionally based on isOpen prop',
                'Render title in header and children inside main content container',
                'Render actionButtons in footer'
              ],
              example: '<Modal title="Confirm" isOpen={true} onClose={close}><p>Body</p></Modal>',
              hints: ['Destructure { title, isOpen, onClose, actionButtons, children } from props.'],
              starterCode: `export default function Modal({ isOpen, title, onClose, children, actionButtons }) {\n  if (!isOpen) return null;\n  return (\n    // Return modal JSX layout\n  );\n}\n`,
            },
          ],
        },
      ],
    },
    {
      title: 'State Management with useState',
      order: 3,
      description: 'Manage component memory, state immutability, functional updater patterns, and controlled form inputs.',
      lessons: [
        {
          title: 'useState Mechanics & Controlled Forms',
          type: 'text',
          duration: '25 mins',
          order: 1,
          content: `### 1. useState Hook Mechanics
State allows a component to remember data across re-renders.

\`\`\`jsx
import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);

  // Safe Functional Updater Pattern (Always use when new state depends on old state)
  const increment = () => {
    setCount((prevCount) => prevCount + 1);
  };

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>Increment</button>
    </div>
  );
}
\`\`\`

---

### 2. State Immutability with Objects and Arrays
Never mutate state directly (\`user.age = 25\` ❌). Always create a new object or array reference using spread syntax (\`...\`):

\`\`\`jsx
const [form, setForm] = useState({ name: '', email: '', role: 'student' });

const handleChange = (e) => {
  const { name, value } = e.target;
  setForm((prev) => ({
    ...prev,
    [name]: value, // Dynamic computed property key
  }));
};
\`\`\``,
          notes: `• Never mutate state directly; always pass a new copy via setState.
• When new state depends on previous state, pass an updater function: setCount(prev => prev + 1).
• Controlled inputs bind value={state} and onChange={handler}.`,
          questions: [
            {
              id: 'q-react-3-1-1',
              question: 'Why should you use setCount(prev => prev + 1) instead of setCount(count + 1) in asynchronous closures?',
              code: 'setCount(prev => prev + 1);',
              type: 'conceptual',
              options: [],
              answer: 'The updater function receives the guaranteed latest pending state value, preventing stale closures in batched or async updates.',
              explanation: 'Because React batches state updates, referencing the captured count variable might read stale state if multiple updates occur in the same event tick.',
              category: 'State Hooks',
              order: 1,
            },
          ],
          tasks: [
            {
              id: 't-react-3-1-1',
              taskNumber: 1,
              title: 'Build a Multi-Field Controlled Registration Form',
              level: 'Level 2',
              category: 'Forms & State',
              description: 'Build a React form with username, email, and agreedToTerms checkbox, handling all inputs with a single unified state object.',
              requirements: [
                'Maintain a single state object { username, email, agreedToTerms }',
                'Implement a reusable handleChange function that supports both text and checkbox inputs',
                'Prevent default form submission and alert formData'
              ],
              example: 'const [formData, setFormData] = useState({ username: "", email: "", agreedToTerms: false });',
              hints: ['Check e.target.type === "checkbox" to read e.target.checked.'],
              starterCode: `import { useState } from 'react';\n\nexport default function RegistrationForm() {\n  // Implement state and handlers\n}\n`,
            },
          ],
        },
      ],
    },
    {
      title: 'Lifecycle & Side Effects with useEffect',
      order: 4,
      description: 'Perform asynchronous data fetching, subscribe to browser events, manage timers, and clean up side effects.',
      lessons: [
        {
          title: 'useEffect Execution, Dependencies & Cleanups',
          type: 'text',
          duration: '25 mins',
          order: 1,
          content: `### 1. The \`useEffect\` Dependency Array Rules
\`\`\`jsx
import { useEffect, useState } from 'react';

// 1. Runs after EVERY render (rarely desired)
useEffect(() => {
  console.log('Component rendered');
});

// 2. Runs ONLY once on initial mount
useEffect(() => {
  console.log('Component mounted');
}, []);

// 3. Runs on mount AND whenever dependencies change
useEffect(() => {
  console.log('Course ID changed to:', courseId);
}, [courseId]);
\`\`\`

---

### 2. Effect Cleanups & Aborting Network Requests
Always return a cleanup function to prevent memory leaks and race conditions:

\`\`\`jsx
useEffect(() => {
  const controller = new AbortController();

  async function fetchCourseData() {
    try {
      const response = await fetch(\`/api/courses/\${id}\`, { signal: controller.signal });
      const data = await response.json();
      setCourse(data);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message);
      }
    }
  }

  fetchCourseData();

  // Cleanup runs before effect re-executes and on unmount
  return () => {
    controller.abort();
  };
}, [id]);
\`\`\``,
          notes: `• Always return a cleanup function from useEffect when subscribing to window events, intervals, or fetch requests.
• Include all reactive variables (props, state) used inside the effect in the dependency array.
• Use AbortController to discard in-flight API requests if the component unmounts or ID changes.`,
          questions: [
            {
              id: 'q-react-4-1-1',
              question: 'When does the cleanup function returned by useEffect execute?',
              code: 'useEffect(() => {\n  return () => { console.log("cleanup"); };\n}, [id]);',
              type: 'mcq',
              options: [
                'Right before the component unmounts and before the effect runs again when dependencies change',
                'Only when the browser window closes',
                'Synchronously before the initial render',
                'Only when an error is thrown in the component'
              ],
              answer: 'Right before the component unmounts and before the effect runs again when dependencies change',
              explanation: 'The cleanup function is invoked before re-running the effect with new dependencies, as well as on final unmount.',
              category: 'Effects',
              order: 1,
            },
          ],
          tasks: [
            {
              id: 't-react-4-1-1',
              taskNumber: 1,
              title: 'Build a Live Window Resize Listener Hook',
              level: 'Level 2',
              category: 'Hooks & Effects',
              description: 'Create a component that tracks window width and height, attaching an event listener on mount and cleaning it up on unmount.',
              requirements: [
                'Initialize state with current window.innerWidth and window.innerHeight',
                'Add resize event listener inside useEffect with empty dependency array',
                'Clean up event listener in the returned function'
              ],
              example: 'useEffect(() => { window.addEventListener("resize", handler); return () => window.removeEventListener("resize", handler); }, []);',
              hints: ['Ensure window.removeEventListener uses the exact same handler function reference.'],
              starterCode: `import { useState, useEffect } from 'react';\n\nexport default function WindowTracker() {\n  // Implement state and effect listener\n}\n`,
            },
          ],
        },
      ],
    },
    {
      title: 'Performance Hooks: useMemo, useCallback & useRef',
      order: 5,
      description: 'Optimize expensive computations, maintain referential equality across renders, and manipulate DOM nodes safely.',
      lessons: [
        {
          title: 'useMemo, useCallback & useRef Deep Dive',
          type: 'text',
          duration: '24 mins',
          order: 1,
          content: `### 1. \`useRef\`: Persisting Mutable Values & DOM Access
\`useRef\` returns a mutable ref object whose \`.current\` property persists for the full component lifetime without triggering re-renders.

\`\`\`jsx
import { useRef, useEffect } from 'react';

function AutoFocusInput() {
  const inputRef = useRef(null);

  useEffect(() => {
    // Focus input on mount
    inputRef.current?.focus();
  }, []);

  return <input ref={inputRef} placeholder="Type search query..." />;
}
\`\`\`

---

### 2. \`useMemo\` vs \`useCallback\`
- **\`useMemo\`**: Caches the **result** of an expensive calculation.
  \`\`\`jsx
  const filteredList = useMemo(() => {
    return heavyFilterAlgorithm(items, searchFilter);
  }, [items, searchFilter]);
  \`\`\`
- **\`useCallback\`**: Caches the **function definition itself** between renders to maintain referential equality when passed to memoized children (\`React.memo\`).
  \`\`\`jsx
  const handleDelete = useCallback((id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);
  \`\`\``,
          notes: `• Mutating ref.current does NOT cause a component to re-render.
• Use useMemo for computationally heavy data transformations.
• Use useCallback when passing callback functions to child components wrapped in React.memo.`,
          questions: [
            {
              id: 'q-react-5-1-1',
              question: 'What is the primary difference between useMemo and useCallback?',
              code: '',
              type: 'mcq',
              options: [
                'useMemo returns a memoized value, while useCallback returns a memoized callback function',
                'useMemo is for state, useCallback is for lifecycle effects',
                'useMemo causes re-renders, useCallback does not',
                'They are aliases for the exact same function'
              ],
              answer: 'useMemo returns a memoized value, while useCallback returns a memoized callback function',
              explanation: 'useMemo calls the factory function and caches the returned value. useCallback returns the passed function reference directly without invoking it.',
              category: 'Performance',
              order: 1,
            },
          ],
          tasks: [
            {
              id: 't-react-5-1-1',
              taskNumber: 1,
              title: 'Build a Memoized Search Filter with useMemo',
              level: 'Level 2',
              category: 'Performance',
              description: 'Implement a course filter component that uses useMemo to prevent re-filtering a large list of 1,000 courses unless the query or course list changes.',
              requirements: [
                'Manage searchTerm in state',
                'Use useMemo to compute filteredCourses based on [courses, searchTerm]',
                'Render count of matched results'
              ],
              example: 'const filtered = useMemo(() => courses.filter(c => c.title.toLowerCase().includes(q.toLowerCase())), [courses, q]);',
              hints: ['Ensure case-insensitive string matching.'],
              starterCode: `import { useState, useMemo } from 'react';\n\nexport default function CourseSearch({ courses }) {\n  // Implement memoized filter\n}\n`,
            },
          ],
        },
      ],
    },
    {
      title: 'Global State with Context API & Custom Hooks',
      order: 6,
      description: 'Build robust global state architectures using createContext, useContext, and reusable custom hook abstractions.',
      lessons: [
        {
          title: 'Context API Architecture & Custom Hooks',
          type: 'text',
          duration: '25 mins',
          order: 1,
          content: `### 1. Creating a Global Auth / Theme Context
\`\`\`jsx
import { createContext, useContext, useState } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom Consumer Hook with Guard
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
\`\`\`

---

### 2. Building a Custom \`useLocalStorage\` Hook
\`\`\`jsx
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}
\`\`\``,
          notes: `• Always create a custom hook (e.g. useAuth, useTheme) to encapsulate useContext and throw a descriptive error if used outside Provider.
• Custom hooks must always start with the word 'use' to enable React linter rules.
• Extract complex stateful logic into custom hooks for effortless testing and reuse.`,
          questions: [
            {
              id: 'q-react-6-1-1',
              question: 'Why must custom hooks in React start with the prefix "use"?',
              code: 'function useAuth() { ... }',
              type: 'mcq',
              options: [
                'To allow React linters and compiler to enforce the Rules of Hooks (e.g., cannot be called conditionally)',
                'It is mandatory for JavaScript ES6 exports',
                'To automatically bind this to the component',
                'Because it is an HTML standard attribute'
              ],
              answer: 'To allow React linters and compiler to enforce the Rules of Hooks (e.g., cannot be called conditionally)',
              explanation: 'React relies on the "use" naming convention to detect hook calls and verify that hooks are called in the same order on every render.',
              category: 'Hooks Architecture',
              order: 1,
            },
          ],
          tasks: [
            {
              id: 't-react-6-1-1',
              taskNumber: 1,
              title: 'Build a Global Notification (Toast) Context & Provider',
              level: 'Level 3',
              category: 'Context Architecture',
              description: 'Implement a NotificationContext with addToast, removeToast, active toasts state, and a custom useToast hook.',
              requirements: [
                'Create NotificationContext with createContext',
                'Implement NotificationProvider with auto-dismissing timeout for toasts',
                'Export custom useToast consumer hook'
              ],
              example: 'const { showToast } = useToast(); showToast("Course saved!");',
              hints: ['Use setTimeout to auto-remove toast after 3000ms.'],
              starterCode: `import { createContext, useContext, useState } from 'react';\n\n// Create Context & Provider\n`,
            },
          ],
        },
      ],
    },
  ],
};
