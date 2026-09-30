const LectureContent = require("../models/lectureContent.model");

/**
 * Clean up title to extract primary subject/concept
 */
function extractConcept(title) {
    if (!title) return "Core Concepts";
    return title
        .replace(/tutorial\s+in\s+hindi\s*\/?\s*urdu/gi, "")
        .replace(/tutorial\s+in\s+hindi/gi, "")
        .replace(/in\s+hindi\s*\/?\s*urdu/gi, "")
        .replace(/video\s+lecture/gi, "")
        .replace(/javascript\s+full\s+course\s*#?\d*/gi, "")
        .replace(/node\s+js\s+tutorial\s*#?\d*/gi, "")
        .replace(/video\s*-\s*\d+/gi, "")
        .replace(/#\d+/gi, "")
        .replace(/\|\s*/g, " ")
        .replace(/-\s*/g, " ")
        .trim();
}

/**
 * Determine coding language based on course and title
 */
function detectLanguage(courseTitle, lectureTitle) {
    const combined = `${courseTitle} ${lectureTitle}`.toLowerCase();
    if (combined.includes("css") || combined.includes("flexbox") || combined.includes("grid")) return "css";
    if (combined.includes("react") || combined.includes("jsx")) return "jsx";
    if (combined.includes("sql") || combined.includes("mysql") || combined.includes("database")) return "sql";
    if (combined.includes("mongo") || combined.includes("nosql")) return "javascript";
    if (combined.includes("node") || combined.includes("express")) return "javascript";
    if (combined.includes("html")) return "html";
    if (combined.includes("git")) return "bash";
    return "javascript";
}

/**
 * Generate rich, structured lecture notes, tasks, and MCQs dynamically
 */
function generateDefaultContent(course, lecture) {
    const courseTitle = course?.title || "Course";
    const lectureTitle = lecture?.title || `Lecture ${lecture?.lectureNumber}`;
    const concept = extractConcept(lectureTitle);
    const lang = detectLanguage(courseTitle, lectureTitle);
    const lowerTitle = (lectureTitle + " " + courseTitle).toLowerCase();

    // Specific match for CSS Colors & Backgrounds (Lecture 3 or similar)
    if (lowerTitle.includes("color") && lowerTitle.includes("css")) {
        return {
            notes: `## CSS Color & Backgrounds

CSS colors are used to set the color of text, background, borders, and more. You can use color names, hexadecimal values, RGB, RGBA, HSL, and HSLA values.

### 1. Color Names
You can use predefined color names to set colors.

\`\`\`css
h1 {
  color: blue;
}
\`\`\`

### 2. Hexadecimal Colors
Hex colors start with # followed by 6 digits (or 3 digits).

\`\`\`css
.box {
  background-color: #4d77e0;
  color: #ffffff;
}
\`\`\`

### 3. RGB and RGBA Colors
RGB uses red, green, and blue values (0-255). RGBA adds an alpha channel for transparency (0.0 - 1.0).

\`\`\`css
.overlay {
  background-color: rgba(37, 99, 235, 0.85);
  border: 1px solid rgb(59, 130, 246);
}
\`\`\`
`,
            keyTakeaways: [
                "Different ways to use colors in CSS (Names, Hex, RGB, HSL)",
                "Background color and images with linear and radial gradients",
                "Color opacity control with RGBA and HSLA alpha values",
                "High contrast color ratios ensure accessible UI design",
            ],
            importantNote: "Always check color contrast for better readability and accessibility (WCAG AA standard requires at least 4.5:1 ratio for normal text).",
            usefulResources: [
                {
                    title: "MDN CSS Colors",
                    url: "https://developer.mozilla.org/en-US/docs/Web/CSS/color",
                },
                {
                    title: "CSS Color Picker",
                    url: "https://htmlcolorcodes.com/",
                },
                {
                    title: "CSS Gradient Generator",
                    url: "https://cssgradient.io/",
                },
            ],
            tasks: [
                {
                    title: "Task 1: Style a Badge Card with Hex and RGBA Colors",
                    description: "Create a container with a dark slate background, white text, and a semi-transparent blue accent badge.",
                    difficulty: "Easy",
                    requirements: [
                        "Set background color using a hexadecimal code.",
                        "Apply RGBA semi-transparency for the badge overlay.",
                        "Ensure text is readable with high color contrast.",
                    ],
                    starterCode: `/* Task: Implement color styling */
.badge-card {
  /* Add background-color and color */
}

.badge-card .tag {
  /* Add rgba background */
}`,
                    solution: `/* Solution */
.badge-card {
  background-color: #0f172a;
  color: #f8fafc;
  padding: 20px;
  border-radius: 10px;
}

.badge-card .tag {
  background-color: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
  padding: 4px 8px;
  border-radius: 4px;
}`,
                },
                {
                    title: "Task 2: Linear Gradient Background Banner",
                    description: "Build a hero banner that uses a 2-stop linear gradient from indigo to violet with centered text.",
                    difficulty: "Medium",
                    requirements: [
                        "Use linear-gradient with at least two distinct hex colors.",
                        "Set text color to white.",
                        "Add padding and rounded corners.",
                    ],
                    starterCode: `/* Task: Linear Gradient Hero */
.hero-banner {
  /* Add background gradient */
}`,
                    solution: `/* Solution */
.hero-banner {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: #ffffff;
  padding: 48px 24px;
  border-radius: 12px;
  text-align: center;
}`,
                },
            ],
            mcqs: [
                {
                    question: "Which of the following is NOT a valid way to define a color in CSS?",
                    codeSnippet: "",
                    options: [
                        "color: #4d77e0;",
                        "color: rgba(37, 99, 235, 0.5);",
                        "color: color-val(255, 0, 0);",
                        "color: hsl(210, 100%, 50%);",
                    ],
                    correctAnswer: 2,
                    explanation: "color-val() is not a valid CSS function. Valid formats include named colors, Hex (#fff), rgb(), rgba(), hsl(), and hsla().",
                },
                {
                    question: "What does the 4th parameter in rgba(0, 128, 255, 0.6) represent?",
                    codeSnippet: "",
                    options: [
                        "Hue rotation angle",
                        "Alpha opacity channel (0.0 to 1.0)",
                        "Saturation percentage",
                        "Blue brightness offset",
                    ],
                    correctAnswer: 1,
                    explanation: "The 4th argument in rgba() is the alpha channel, controlling the transparency between 0 (fully transparent) and 1 (fully opaque).",
                },
                {
                    question: "What is the primary benefit of using HSL over Hexadecimal codes?",
                    codeSnippet: "",
                    options: [
                        "It makes adjusting lightness and saturation much more intuitive and predictable",
                        "It renders faster in all browser engines",
                        "It avoids having to load external stylesheets",
                        "It automatically translates text into multiple languages",
                    ],
                    correctAnswer: 0,
                    explanation: "HSL (Hue, Saturation, Lightness) allows developers to easily create tints, shades, and complementary colors by simply adjusting the lightness or saturation percentage.",
                },
            ],
        };
    }

    // Dynamic code snippet based on topic
    let codeExample = "";
    let starterCode = "";
    let solutionCode = "";

    if (lang === "css") {
        codeExample = `/* Example: ${concept} */
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
  padding: 24px;
  background: #f8fafc;
  border-radius: 12px;
}

.card-item {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
}`;
        starterCode = `/* Task: Implement ${concept} styling */
.box {
  /* Add your properties here */
}`;
        solutionCode = `/* Solution */
.box {
  padding: 20px;
  background-color: #3b82f6;
  color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}`;
    } else if (lang === "jsx") {
        codeExample = `// Example: ${concept}
import React, { useState, useEffect } from 'react';

export default function ${concept.replace(/[^a-zA-Z]/g, "") || "DemoComponent"}() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setData({ message: "Loaded successfully" });
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="component-card">
      <h3>{data.message}</h3>
    </div>
  );
}`;
        starterCode = `// Task: Build a component demonstrating ${concept}
import React from 'react';

export default function MyComponent() {
  // Write your logic here
  return <div>Hello World</div>;
}`;
        solutionCode = `// Solution
import React, { useState } from 'react';

export default function MyComponent() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(prev => prev + 1)}>
      Clicked {count} times
    </button>
  );
}`;
    } else if (lang === "sql") {
        codeExample = `-- Example: ${concept}
SELECT 
    users.id,
    users.name,
    COUNT(orders.id) AS total_orders
FROM users
LEFT JOIN orders ON users.id = orders.user_id
WHERE users.status = 'active'
GROUP BY users.id, users.name
ORDER BY total_orders DESC
LIMIT 10;`;
        starterCode = `-- Task: Write a query for ${concept}
-- Write your SQL query below:`;
        solutionCode = `-- Solution
SELECT * 
FROM table_name
WHERE status = 'active'
ORDER BY created_at DESC;`;
    } else if (lang === "bash") {
        codeExample = `# Example: ${concept}
# Inspect current state
git status

# Stage updated files
git add .

# Create a clean commit
git commit -m "feat: implement ${concept.toLowerCase()}"

# Push to upstream branch
git push origin main`;
        starterCode = `# Task: Run commands for ${concept}
# Enter commands below:`;
        solutionCode = `# Solution
git checkout -b feature/new-branch
git add .
git commit -m "feat: add feature"`;
    } else {
        codeExample = `// Example: ${concept}
async function handle${concept.replace(/[^a-zA-Z]/g, "") || "Operation"}() {
  try {
    console.log("Initializing ${concept}...");
    const result = await Promise.resolve({ success: true, timestamp: Date.now() });
    console.log("Operation completed:", result);
    return result;
  } catch (error) {
    console.error("Error occurred:", error.message);
  }
}

handle${concept.replace(/[^a-zA-Z]/g, "") || "Operation"}();`;
        starterCode = `// Task: Implement ${concept}
function solution() {
  // Your code here
}`;
        solutionCode = `// Solution
function solution() {
  return { status: "success", topic: "${concept}" };
}`;
    }

    const notes = `## ${concept}

In this lecture, we explore **${concept}** within **${courseTitle}**. This module covers the core concepts, syntax conventions, and real-world usage needed for modern development.

### 1. Fundamental Principles
Understanding how ${concept} integrates into the overall architecture and how to apply it effectively in your code.

\`\`\`${lang}
${codeExample}
\`\`\`

### 2. Best Practices & Guidelines
- **Maintain Clean Syntax**: Follow standard naming conventions and avoid unnecessary complexity.
- **Handle Edge Cases**: Ensure proper fallback behavior for missing inputs or unexpected states.
- **Optimize for Performance**: Refactor redundant logic and keep components modular.
`;

    const keyTakeaways = [
        `Mastered the core concepts and syntax of ${concept}.`,
        `Learned common pitfalls, debugging tips, and performance guidelines.`,
        `Understood practical integration patterns for full-stack projects.`,
        `Gained hands-on proficiency in writing clean, readable ${lang.toUpperCase()} code.`,
    ];

    const importantNote = `Always test your code against unexpected inputs and ensure compatibility with modern browser and runtime standards.`;

    const usefulResources = [
        {
            title: `MDN Web Docs - ${concept}`,
            url: `https://developer.mozilla.org/`,
        },
        {
            title: `Official Documentation`,
            url: `https://devdocs.io/`,
        },
    ];

    const tasks = [
        {
            title: `Task 1: Basic ${concept} Setup`,
            description: `Implement the foundational syntax for ${concept}. Ensure all required properties, parameters, or attributes are defined properly.`,
            difficulty: "Easy",
            requirements: [
                `Declare the primary structure for ${concept}.`,
                `Apply clean formatting and meaningful identifiers.`,
                `Verify expected output in your browser or console.`,
            ],
            starterCode,
            solution: solutionCode,
        },
        {
            title: `Task 2: Advanced ${concept} Implementation`,
            description: `Build a production-ready solution incorporating ${concept} with dynamic parameters and robust error handling.`,
            difficulty: "Medium",
            requirements: [
                `Refactor the basic implementation to handle edge cases.`,
                `Ensure modular and maintainable code architecture.`,
            ],
            starterCode,
            solution: solutionCode,
        },
    ];

    const mcqs = [
        {
            question: `What is the primary role of ${concept} in ${courseTitle}?`,
            codeSnippet: "",
            options: [
                `To structure, style, or process application data according to standard conventions`,
                `To compile binary machine code directly to kernel hardware`,
                `To bypass security and authentication protections`,
                `To permanently disable runtime exception handling`,
            ],
            correctAnswer: 0,
            explanation: `${concept} provides standardized, efficient mechanisms for building application logic, interfaces, or database workflows.`,
        },
        {
            question: `Which of the following is a recommended best practice when using ${concept}?`,
            codeSnippet: "",
            options: [
                `Hardcoding global state without modular functions`,
                `Writing clean, well-tested code and handling edge cases gracefully`,
                `Suppressing all error messages and ignoring warnings`,
                `Duplicating code across multiple files without reuse`,
            ],
            correctAnswer: 1,
            explanation: `Following clean code principles and writing maintainable, tested logic is the industry standard practice.`,
        },
        {
            question: `What is the expected outcome when applying standard syntax for ${concept}?`,
            codeSnippet: codeExample.slice(0, 140) + "\n...",
            options: [
                `It executes deterministically in the host runtime environment adhering to language grammar rules`,
                `It automatically corrupts local memory`,
                `It causes an immediate system reboot`,
                `It generates arbitrary syntax errors`,
            ],
            correctAnswer: 0,
            explanation: `Standard syntax executes predictably within the browser JavaScript engine, CSS rendering engine, or Node.js runtime.`,
        },
    ];

    return {
        notes,
        keyTakeaways,
        importantNote,
        usefulResources,
        tasks,
        mcqs,
    };
}

/**
 * Get published content for a lecture (strictly student-safe: no draft content exposed)
 */
async function getLectureContent(course, lecture) {
    if (!lecture || !course) return null;

    try {
        const existing = await LectureContent.findOne({
            courseId: course._id,
            lectureNumber: lecture.lectureNumber,
            $or: [
                { status: "published" },
                { "publishedData.publishedAt": { $ne: null } }
            ]
        });

        if (existing) {
            // Version safety: use approved publishedData snapshot if available, otherwise existing published fields
            const data = (existing.publishedData && (existing.publishedData.notes || existing.publishedData.tasks?.length || existing.publishedData.mcqs?.length))
                ? existing.publishedData
                : (existing.status === "published" ? existing : null);

            if (data) {
                return {
                    isPublished: true,
                    status: "published",
                    title: data.structuredNotes?.title || "",
                    overview: data.structuredNotes?.overview || "",
                    structuredNotes: data.structuredNotes || null,
                    notes: data.notes || "",
                    keyTakeaways: data.keyTakeaways || data.structuredNotes?.keyTakeaways || [],
                    importantPoints: data.importantPoints || data.structuredNotes?.importantPoints || [],
                    importantNote: data.importantNote || data.structuredNotes?.importantNote || "",
                    usefulResources: data.usefulResources || data.structuredNotes?.usefulResources || [],
                    tasks: data.tasks || [],
                    mcqs: data.mcqs || [],
                };
            }
        }
    } catch (err) {
        console.warn("Error checking published LectureContent collection:", err.message);
    }

    // No published content yet - return empty published contract for safe student display
    return {
        isPublished: false,
        status: "unpublished",
        title: "",
        overview: "",
        structuredNotes: null,
        notes: null,
        keyTakeaways: [],
        importantPoints: [],
        importantNote: "",
        usefulResources: [],
        tasks: [],
        mcqs: [],
    };
}

module.exports = {
    getLectureContent,
    generateDefaultContent,
};
