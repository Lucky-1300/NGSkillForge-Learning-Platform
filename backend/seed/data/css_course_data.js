/**
 * Seed Data: CSS3 & Modern Layouts
 * Strict alignment with demo syllabus:
 * 1. CSS Basics (What is CSS?, CSS Syntax, Inline Internal and External CSS, Selectors)
 * 2. CSS Properties (Colors, Backgrounds, Fonts, Text Properties)
 * 3. Box Model (Width and Height, Padding, Border, Margin)
 * 4. Layout (Display, Position, Flexbox, Grid)
 * 5. Responsive Design (Media Queries, Responsive Units, Mobile-first Design)
 */
module.exports = {
  title: 'CSS3 & Modern Layouts',
  description: 'Master modern styling with CSS3 Flexbox, Grid, custom properties, animations, transitions, and responsive mobile-first design.',
  instructor: 'Sarah Jenkins',
  price: 0,
  category: 'Frontend',
  level: 'Beginner',
  duration: '5 weeks',
  order: 2,
  thumbnail: 'https://res.cloudinary.com/dyjifbrab/image/upload/f_auto,q_auto/css.png',
  modules: [
    {
      title: 'CSS Basics',
      order: 1,
      description: 'Master the fundamental principles of CSS, ruleset syntax, loading strategies, and CSS selector mechanics.',
      lessons: [
        {
          title: 'What is CSS?',
          type: 'text',
          duration: '15 mins',
          order: 1,
          content: `### 1. What is CSS?
**CSS** stands for **Cascading Style Sheets**. It is a stylesheet language used to describe the visual presentation, layout, colors, typography, and responsive behavior of an HTML document.

- **HTML vs CSS:** If HTML is the skeleton and structural foundation of a building, CSS is the interior architecture, paint, lighting, and aesthetic design.
- **The "Cascade":** Multiple style rules can target the same element. CSS resolves conflicts based on **Origin**, **Specificity**, and **Source Order** (the cascade algorithm).

\`\`\`css
/* Clean, Modern CSS Ruleset */
h1 {
  color: #2563eb;
  font-size: 2.25rem;
  font-family: 'Inter', sans-serif;
  letter-spacing: -0.025em;
}
\`\`\`

---

### 2. How the Browser Renders CSS (CSSOM)
1. The browser parses HTML tokens and builds the **DOM Tree**.
2. Concurrently, it parses CSS rules and constructs the **CSSOM Tree** (CSS Object Model).
3. DOM and CSSOM combine into the **Render Tree**.
4. The browser executes **Layout** (calculating exact geometry) followed by **Paint** (rasterizing pixels to screen).`,
          notes: `• CSS is a declarative language defining visual rules for DOM nodes.
• The "Cascade" resolves conflicting styles based on importance, specificity, and order.
• CSS parsing blocks initial page rendering until the CSSOM tree is constructed.`,
          questions: [
            {
              id: 'q-css-1-1-1',
              question: 'What does CSS stand for?',
              code: '',
              type: 'mcq',
              options: [
                'Cascading Style Sheets',
                'Creative Style System',
                'Computer Styling Syntax',
                'Color and Style Standards'
              ],
              answer: 'Cascading Style Sheets',
              explanation: 'CSS stands for Cascading Style Sheets, the W3C standard language for visual presentation on the web.',
              category: 'Fundamentals',
              order: 1,
            },
            {
              id: 'q-css-1-1-2',
              question: 'What is the CSSOM in browser rendering architecture?',
              code: '',
              type: 'conceptual',
              options: [],
              answer: 'The CSS Object Model (CSSOM) is an in-memory tree of style rules parsed from stylesheets that the browser combines with the DOM to generate the Render Tree.',
              explanation: 'The browser cannot render elements until both the DOM and CSSOM are ready.',
              category: 'Browser Engine',
              order: 2,
            },
            {
              id: 'q-css-1-1-3',
              question: 'What are the three core factors determining which style wins in the CSS Cascade?',
              code: '',
              type: 'interview',
              options: [],
              answer: '1. Origin & Importance (!important), 2. Selector Specificity, and 3. Source Order (last declared rule wins if specificity is tied).',
              explanation: 'Understanding the cascade algorithm is fundamental to debugging CSS inheritance conflicts.',
              category: 'The Cascade',
              order: 3,
            },
          ],
          tasks: [
            {
              id: 't-css-1-1-1',
              taskNumber: 1,
              title: 'Write a Clean CSS Document Ruleset',
              level: 'Level 1',
              category: 'CSS Basics',
              description: 'Write a basic CSS stylesheet targeting the body, headings, and paragraphs with modern font, color, and line-height tokens.',
              requirements: [
                'Set body background-color and color',
                'Set font-family to sans-serif',
                'Set line-height to 1.6 on paragraphs'
              ],
              example: 'body { font-family: sans-serif; line-height: 1.6; }',
              hints: ['Use hex colors or hsl values for colors.'],
              starterCode: `/* Write basic CSS ruleset below */\n`,
            },
          ],
        },
        {
          title: 'CSS Syntax',
          type: 'text',
          duration: '15 mins',
          order: 2,
          content: `### 1. Anatomy of a CSS Ruleset
A CSS ruleset consists of a **Selector** pointing to the HTML elements to style, followed by a **Declaration Block** enclosed in curly braces \`{ }\`:

\`\`\`css
selector {
  property: value; /* Declaration */
  property: value; /* Declaration */
}
\`\`\`

\`\`\`css
/* Example */
.course-card {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 24px;
}
\`\`\`

---

### 2. Rules and Syntax Conventions
- **Selector:** Identifies the target DOM elements (\`.course-card\`).
- **Property:** The style attribute being modified (\`background-color\`).
- **Value:** The setting applied to the property (\`#ffffff\`).
- **Colon (\`:\`):** Separates property name from value.
- **Semicolon (\`;\`):** Terminates each declaration statement (mandatory!).
- **Comments (\`/* ... */\`):** Used to document CSS code; unlike HTML comments, CSS comments use \`/*\` and \`*/\`.`,
          notes: `• Always terminate every declaration with a semicolon (;) to prevent syntax parse failures.
• CSS property names are case-insensitive, but lowercase is universal industry standard.
• Use /* comment */ syntax for CSS comments.`,
          questions: [
            {
              id: 'q-css-1-2-1',
              question: 'Which character terminates a single CSS property declaration?',
              code: 'p { color: red??? }',
              type: 'mcq',
              options: ['; (Semicolon)', ': (Colon)', '. (Period)', ', (Comma)'],
              answer: '; (Semicolon)',
              explanation: 'Every CSS declaration must end with a semicolon (;) to separate it from the next declaration in the block.',
              category: 'Syntax',
              order: 1,
            },
            {
              id: 'q-css-1-2-2',
              question: 'How do you write a comment in CSS?',
              code: '',
              type: 'mcq',
              options: ['/* This is a comment */', '// This is a comment', '<!-- This is a comment -->', '# This is a comment'],
              answer: '/* This is a comment */',
              explanation: 'CSS only supports multi-line /* ... */ block comment syntax.',
              category: 'Syntax',
              order: 2,
            },
            {
              id: 'q-css-1-2-3',
              question: 'What is the declaration in the following ruleset: h1 { color: blue; }?',
              code: 'h1 { color: blue; }',
              type: 'mcq',
              options: ['color: blue;', 'h1', 'blue', '{ color: blue; }'],
              answer: 'color: blue;',
              explanation: 'A declaration is the combination of a property (color) and a value (blue) separated by a colon.',
              category: 'Syntax Terminology',
              order: 3,
            },
          ],
          tasks: [
            {
              id: 't-css-1-2-1',
              taskNumber: 1,
              title: 'Format a Well-Structured CSS Ruleset with Comments',
              level: 'Level 1',
              category: 'Syntax',
              description: 'Write a valid CSS ruleset for a button class with informative comments, proper property-value pairs, and semicolons.',
              requirements: [
                'Add a top-level section comment /* Button Styles */',
                'Create .btn-action selector',
                'Include background-color, color, border, and padding declarations'
              ],
              example: '.btn-action { background: blue; color: white; }',
              hints: ['Make sure every declaration ends with a semicolon.'],
              starterCode: `/* Write your CSS ruleset below */\n`,
            },
          ],
        },
        {
          title: 'Inline, Internal and External CSS',
          type: 'text',
          duration: '18 mins',
          order: 3,
          content: `### 1. The 3 Methods of Applying CSS
| Method | Where It Lives | Syntax Example | Recommended Use Case |
| :--- | :--- | :--- | :--- |
| **External CSS** | Separate \`.css\` file linked in \`<head>\` | \`<link rel="stylesheet" href="style.css">\` | **Primary standard** for entire website styling & caching |
| **Internal CSS** | Inside \`<style>\` tag in document \`<head>\` | \`<style> p { color: blue; } </style>\` | Single-page specific styles, email templates |
| **Inline CSS** | Inside \`style="..."\` attribute on element | \`<p style="color: blue;">Text</p>\` | Quick dynamic JS overrides, email HTML |

---

### 2. Why External Stylesheets Win in Production
1. **Browser Caching:** Browsers download \`style.css\` once and cache it across all site pages, reducing bandwidth.
2. **Separation of Concerns:** Keeps HTML markup clean and focused strictly on content semantics.
3. **Global Reusability:** Updating one \`.css\` file instantly restyles thousands of web pages simultaneously.`,
          notes: `• Always favor External CSS files linked via <link rel="stylesheet"> for production applications.
• Inline styles have the highest specificity (1, 0, 0, 0) and make code hard to maintain.
• External stylesheets benefit from browser HTTP caching.`,
          questions: [
            {
              id: 'q-css-1-3-1',
              question: 'Which tag is used in the HTML <head> to attach an external CSS stylesheet?',
              code: '<head>\n  <??? rel="stylesheet" href="styles.css">\n</head>',
              type: 'mcq',
              options: ['<link>', '<style>', '<css>', '<script>'],
              answer: '<link>',
              explanation: 'The <link rel="stylesheet" href="..."> tag connects external stylesheets to HTML documents.',
              category: 'Stylesheets',
              order: 1,
            },
            {
              id: 'q-css-1-3-2',
              question: 'Why are inline styles (style="...") generally discouraged in production web applications?',
              code: '<div style="color: red; padding: 20px;">...</div>',
              type: 'interview',
              options: [],
              answer: 'They violate separation of concerns, cannot be cached by the browser, duplicate code across elements, and have high specificity that makes them difficult to override.',
              explanation: 'Inline styles create maintenance nightmares on large codebases and prevent unified design token management.',
              category: 'Best Practices',
              order: 2,
            },
            {
              id: 'q-css-1-3-3',
              question: 'Where is an internal stylesheet placed in an HTML document?',
              code: '',
              type: 'mcq',
              options: [
                'Inside a <style> tag within the <head> element',
                'Inside a <css> tag in the <body>',
                'At the bottom of the <footer>',
                'Inside a JavaScript file'
              ],
              answer: 'Inside a <style> tag within the <head> element',
              explanation: 'Internal stylesheets are defined using the <style> element placed inside the <head> of the document.',
              category: 'Stylesheets',
              order: 3,
            },
          ],
          tasks: [
            {
              id: 't-css-1-3-1',
              taskNumber: 1,
              title: 'Connect External and Internal Stylesheets',
              level: 'Level 1',
              category: 'Integration',
              description: 'Write an HTML <head> snippet linking an external stylesheet "main.css" and including an internal <style> block for page-specific card overrides.',
              requirements: [
                'Add <link rel="stylesheet" href="/assets/main.css">',
                'Add an internal <style> tag with a .hero-banner rule'
              ],
              example: '<head><link rel="stylesheet" href="main.css"><style>.hero { color: red; }</style></head>',
              hints: ['Ensure <link> appears before <style>.'],
              starterCode: `<!-- Write head stylesheet links below -->\n`,
            },
          ],
        },
        {
          title: 'Selectors',
          type: 'text',
          duration: '22 mins',
          order: 4,
          content: `### 1. Types of CSS Selectors
Selectors tell the browser which DOM nodes to target with style declarations:

\`\`\`css
/* 1. Universal Selector (Targets all elements) */
* { box-sizing: border-box; }

/* 2. Type / Element Selector */
p { line-height: 1.6; }

/* 3. Class Selector (.) - Reusable */
.course-card { padding: 20px; }

/* 4. ID Selector (#) - Unique */
#main-header { position: sticky; top: 0; }

/* 5. Attribute Selector */
input[type="email"] { border-color: #2563eb; }

/* 6. Grouping Selector (,) */
h1, h2, h3 { font-family: 'Outfit', sans-serif; }
\`\`\`

---

### 2. Combinator Selectors
- **Descendant Selector (\`div p\`):** Matches all \`<p>\` elements anywhere inside a \`<div>\`.
- **Child Selector (\`ul > li\`):** Matches only direct immediate children \`<li>\` of \`<ul>\`.
- **Adjacent Sibling (\`h2 + p\`):** Matches the very next sibling \`<p>\` immediately following \`<h2>\`.
- **General Sibling (\`h2 ~ p\`):** Matches all sibling \`<p>\` elements following \`<h2>\`.`,
          notes: `• Class selectors (.class) are the primary tool for reusable UI component styling.
• Avoid overusing ID selectors (#id) because their high specificity creates override friction.
• Use the child combinator (>) to style direct children without affecting deeper nested elements.`,
          questions: [
            {
              id: 'q-css-1-4-1',
              question: 'What is the difference between the descendant selector div p and child selector div > p?',
              code: '/* A */ div p { color: red; }\n/* B */ div > p { color: blue; }',
              type: 'mcq',
              options: [
                'div p matches any <p> at any nested depth inside div, while div > p matches only immediate direct children',
                'div > p matches elements before div',
                'div p is only for tables',
                'There is no difference in modern browsers'
              ],
              answer: 'div p matches any <p> at any nested depth inside div, while div > p matches only immediate direct children',
              explanation: 'The child combinator (>) restricts matching to direct children only, ignoring grandchildren.',
              category: 'Combinators',
              order: 1,
            },
            {
              id: 'q-css-1-4-2',
              question: 'Which selector targets an input element whose type attribute is exactly "password"?',
              code: '',
              type: 'mcq',
              options: ['input[type="password"]', 'input.password', 'input:password', 'input#type(password)'],
              answer: 'input[type="password"]',
              explanation: 'Attribute selectors use square brackets [attr="value"] to match element attributes.',
              category: 'Attribute Selectors',
              order: 2,
            },
            {
              id: 'q-css-1-4-3',
              question: 'What does the adjacent sibling selector h2 + p target in the DOM?',
              code: 'h2 + p { margin-top: 0; }',
              type: 'conceptual',
              options: [],
              answer: 'It targets the first <p> element that immediately follows an <h2> element sharing the same parent.',
              explanation: 'The + combinator matches elements that are immediately adjacent siblings.',
              category: 'Selectors',
              order: 3,
            },
          ],
          tasks: [
            {
              id: 't-css-1-4-1',
              taskNumber: 1,
              title: 'Implement Combinators and Attribute Selectors',
              level: 'Level 2',
              category: 'Selectors',
              description: 'Write CSS selectors applying styles to direct list children (.nav-list > li), adjacent paragraphs after headings (h3 + p), and required inputs (input[required]).',
              requirements: [
                'Style .nav-list > li with display: inline-block',
                'Style h3 + p with margin-top: 4px and color: #4b5563',
                'Style input[required] with border-left: 3px solid #2563eb'
              ],
              example: '.nav-list > li { ... }',
              hints: ['Use > for child and + for adjacent sibling.'],
              starterCode: `/* Write combinator selectors below */\n`,
            },
          ],
        },
      ],
    },
    {
      title: 'CSS Properties',
      order: 2,
      description: 'Master color representations, multi-layer backgrounds, modern typography, and text formatting properties.',
      lessons: [
        {
          title: 'Colors',
          type: 'text',
          duration: '18 mins',
          order: 1,
          content: `### 1. Color Formats in Modern CSS
CSS provides multiple formats to declare colors:

\`\`\`css
/* 1. Hexadecimal (RGB) */
.hex-color { color: #2563eb; } /* With Alpha: #2563eb80 */

/* 2. RGB and RGBA (Red, Green, Blue, Alpha) */
.rgb-color { color: rgb(37, 99, 235); }
.rgba-color { color: rgba(37, 99, 235, 0.5); }

/* 3. HSL (Hue [0-360], Saturation [0-100%], Lightness [0-100%]) */
.hsl-color { color: hsl(221, 83%, 53%); }
.hsla-color { color: hsla(221, 83%, 53%, 0.8); }

/* 4. Modern Space-Separated CSS Color 4 Syntax */
.modern-color { color: rgb(37 99 235 / 75%); }
\`\`\`

---

### 2. Why HSL is Loved by UI Engineers
HSL makes creating harmonious color palettes, hover tints, and dark mode variants intuitive:
- Adjust **Lightness** to create subtle hover tints without changing the hue.
- Adjust **Saturation** to create muted accents.`,
          notes: `• HSL (Hue, Saturation, Lightness) makes color palette creation and theme adjustments intuitive.
• Alpha channels (opacity) range from 0.0 (fully transparent) to 1.0 (fully opaque).
• Use currentColor to automatically inherit the current text color on borders and SVGs.`,
          questions: [
            {
              id: 'q-css-2-1-1',
              question: 'In the HSL color model hsl(220, 80%, 50%), what does the first number (220) represent?',
              code: 'color: hsl(220, 80%, 50%);',
              type: 'mcq',
              options: [
                'Hue (the color angle on the 360-degree color wheel)',
                'Hexadecimal code value',
                'Hardness of the pixel stroke',
                'Highlight opacity percentage'
              ],
              answer: 'Hue (the color angle on the 360-degree color wheel)',
              explanation: 'Hue is represented as an angle on the color wheel from 0 to 360 (0 = red, 120 = green, 240 = blue).',
              category: 'Color Models',
              order: 1,
            },
            {
              id: 'q-css-2-1-2',
              question: 'What is the keyword currentColor used for in CSS?',
              code: 'border: 2px solid currentColor;',
              type: 'conceptual',
              options: [],
              answer: 'currentColor evaluates to the computed value of the element\'s color property, enabling borders, shadows, or SVG fills to automatically sync with text color.',
              explanation: 'currentColor behaves like an automatic CSS variable tied directly to text color.',
              category: 'CSS Keywords',
              order: 2,
            },
            {
              id: 'q-css-2-1-3',
              question: 'What does an alpha value of 0.5 mean in rgba(0, 0, 0, 0.5)?',
              code: 'background-color: rgba(0, 0, 0, 0.5);',
              type: 'mcq',
              options: ['50% semi-transparent opacity', '50% lightness', '50% saturation', '50px blur radius'],
              answer: '50% semi-transparent opacity',
              explanation: 'Alpha values range between 0 (completely transparent) and 1 (fully opaque). 0.5 represents 50% opacity.',
              category: 'Opacity & Alpha',
              order: 3,
            },
          ],
          tasks: [
            {
              id: 't-css-2-1-1',
              taskNumber: 1,
              title: 'Build a Palette with Hex, RGBA, and HSL Colors',
              level: 'Level 1',
              category: 'Colors',
              description: 'Create classes styling three notification banners using Hex, RGBA (with transparency), and HSL color values.',
              requirements: [
                'Create .banner-primary using Hex #2563eb',
                'Create .banner-overlay using rgba(15, 23, 42, 0.75)',
                'Create .banner-accent using HSL hsl(142, 71%, 45%)'
              ],
              example: '.banner-primary { background-color: #2563eb; }',
              hints: ['Ensure alpha values in rgba are between 0 and 1.'],
              starterCode: `/* Write color utility classes below */\n`,
            },
          ],
        },
        {
          title: 'Backgrounds',
          type: 'text',
          duration: '18 mins',
          order: 2,
          content: `### 1. Modern CSS Background Properties
CSS backgrounds can render solid colors, gradients, and images:

\`\`\`css
.hero-header {
  background-color: #0f172a;
  background-image: linear-gradient(135deg, rgba(37, 99, 235, 0.9), rgba(15, 23, 42, 0.95)), 
                    url('/images/hero-pattern.svg');
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
  background-attachment: fixed; /* Parallax effect */
}
\`\`\`

---

### 2. Core Background Properties
- **\`background-image\`**: Specifies one or multiple image/gradient layers (separated by commas).
- **\`background-size: cover\`**: Scales image so container is completely covered without distortion (may crop edges).
- **\`background-size: contain\`**: Scales image to fit completely inside container without cropping.
- **\`linear-gradient()\` & \`radial-gradient()\`**: CSS-generated vector gradients.`,
          notes: `• Use background-size: cover for full-width responsive hero banners.
• Multiple backgrounds are layered in order: the first background listed is rendered on top.
• Always provide a fallback background-color in case the image fails to load.`,
          questions: [
            {
              id: 'q-css-2-2-1',
              question: 'What is the visual difference between background-size: cover and background-size: contain?',
              code: '',
              type: 'mcq',
              options: [
                'cover fills the entire container (may crop edges), while contain ensures the entire image is visible without cropping (may leave empty space)',
                'contain rotates the image 90 degrees',
                'cover only works on SVGs',
                'There is no difference'
              ],
              answer: 'cover fills the entire container (may crop edges), while contain ensures the entire image is visible without cropping (may leave empty space)',
              explanation: 'cover guarantees complete container coverage, whereas contain guarantees full image visibility.',
              category: 'Backgrounds',
              order: 1,
            },
            {
              id: 'q-css-2-2-2',
              question: 'How do you create a smooth linear gradient transitioning from blue (#2563eb) to purple (#7c3aed) in CSS?',
              code: '',
              type: 'output',
              options: [],
              answer: 'background: linear-gradient(to right, #2563eb, #7c3aed);',
              explanation: 'linear-gradient(direction, color1, color2) creates smooth transitions across defined angles or directions.',
              category: 'Gradients',
              order: 2,
            },
            {
              id: 'q-css-2-2-3',
              question: 'Which property prevents a background image from tiling across the container?',
              code: 'background-repeat: ???;',
              type: 'mcq',
              options: ['no-repeat', 'none', 'disable-tile', 'fixed'],
              answer: 'no-repeat',
              explanation: 'By default, background images repeat in both X and Y directions. background-repeat: no-repeat stops this behavior.',
              category: 'Backgrounds',
              order: 3,
            },
          ],
          tasks: [
            {
              id: 't-css-2-2-1',
              taskNumber: 1,
              title: 'Create a High-Impact Hero Gradient Background',
              level: 'Level 2',
              category: 'Backgrounds',
              description: 'Style a hero container with a multi-stop diagonal linear gradient, centered non-repeating pattern image, and background-size: cover.',
              requirements: [
                'Set fallback background-color: #0b1120',
                'Set background-image with a 135deg linear gradient',
                'Set background-size: cover and background-position: center'
              ],
              example: '.hero { background: linear-gradient(135deg, #1e293b, #0f172a); }',
              hints: ['Combine gradient and color in the background property.'],
              starterCode: `/* Write hero background styles below */\n`,
            },
          ],
        },
        {
          title: 'Fonts',
          type: 'text',
          duration: '18 mins',
          order: 3,
          content: `### 1. Typography & Font Families
\`\`\`css
/* Importing Modern Google Font */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');

body {
  /* Font Family with System Fallback Stack */
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 1rem;       /* 16px default */
  font-weight: 400;      /* Regular */
  font-style: normal;
}

h1 {
  font-weight: 700;      /* Bold */
  font-size: 2.25rem;    /* 36px */
}
\`\`\`

---

### 2. Font Stacks & Fallbacks
Always end your \`font-family\` declaration with a generic fallback family:
- **\`sans-serif\`**: Clean fonts without serifs (e.g. Inter, Arial, Helvetica).
- **\`serif\`**: Traditional fonts with decorative tails (e.g. Georgia, Times New Roman).
- **\`monospace\`**: Fixed-width code fonts (e.g. Fira Code, Courier New).`,
          notes: `• Always supply a system fallback font stack ending in a generic family (sans-serif, serif, monospace).
• Use font-display: swap in web font @font-face rules to prevent Flash of Invisible Text (FOIT).
• Numeric font weights range from 100 (Thin) to 900 (Black); 400 is normal, 700 is bold.`,
          questions: [
            {
              id: 'q-css-2-3-1',
              question: 'Why should every font-family declaration end with a generic font family name like sans-serif or serif?',
              code: 'font-family: "Poppins", Arial, sans-serif;',
              type: 'conceptual',
              options: [],
              answer: 'If custom web fonts and secondary local fonts fail to download or are not installed on the user device, the browser falls back to its default system font in the generic family.',
              explanation: 'Fallback stacks prevent broken rendering and ensure text remains readable under all network conditions.',
              category: 'Typography',
              order: 1,
            },
            {
              id: 'q-css-2-3-2',
              question: 'What numeric value corresponds to font-weight: bold in standard CSS?',
              code: 'font-weight: ???;',
              type: 'mcq',
              options: ['700', '400', '900', '500'],
              answer: '700',
              explanation: 'Standard weight mapping: 400 = normal/regular, 700 = bold.',
              category: 'Fonts',
              order: 2,
            },
            {
              id: 'q-css-2-3-3',
              question: 'What does font-display: swap accomplish when loading web fonts?',
              code: '@font-face { font-display: swap; }',
              type: 'mcq',
              options: [
                'Displays fallback system text immediately while the custom web font downloads, then swaps it in',
                'Swaps the font color on hover',
                'Converts uppercase letters to lowercase',
                'Replaces emoji characters'
              ],
              answer: 'Displays fallback system text immediately while the custom web font downloads, then swaps it in',
              explanation: 'font-display: swap eliminates the Flash of Invisible Text (FOIT), improving Largest Contentful Paint (LCP) performance.',
              category: 'Performance',
              order: 3,
            },
          ],
          tasks: [
            {
              id: 't-css-2-3-1',
              taskNumber: 1,
              title: 'Implement a Multi-Level Font Hierarchy',
              level: 'Level 1',
              category: 'Typography',
              description: 'Define typography rules for body, headings, and code elements using font-family fallbacks, font-size in rem units, and numeric font weights.',
              requirements: [
                'Set body font-family to "Inter", sans-serif with font-weight: 400',
                'Set h1 with font-size: 2.5rem and font-weight: 800',
                'Set code with font-family: monospace'
              ],
              example: 'body { font-family: "Inter", sans-serif; }',
              hints: ['Use monospace generic family for code tags.'],
              starterCode: `/* Write typography rules below */\n`,
            },
          ],
        },
        {
          title: 'Text Properties',
          type: 'text',
          duration: '18 mins',
          order: 4,
          content: `### 1. Essential Text Properties
\`\`\`css
.article-lead {
  text-align: left;              /* left, center, right, justify */
  text-transform: uppercase;     /* uppercase, lowercase, capitalize */
  text-decoration: underline;    /* underline, line-through, none */
  text-decoration-color: #2563eb;
  line-height: 1.75;             /* Crucial for readability! */
  letter-spacing: 0.05em;        /* Spacing between letters */
  word-spacing: 0.1em;
  text-shadow: 0 2px 4px rgba(0,0,0,0.15);
}

/* Removing link underline */
a {
  text-decoration: none;
}
a:hover {
  text-decoration: underline;
}
\`\`\`

---

### 2. Line Height & Readability Guidelines
- For body paragraphs, optimal readability requires \`line-height\` between **\`1.5\`** and **\`1.75\`** (unitless number).
- For large display headings (\`<h1>\`), use tighter line heights between **\`1.1\`** and **\`1.25\`** to prevent awkward vertical gaps.`,
          notes: `• Use unitless numbers for line-height (e.g. line-height: 1.6) so child elements scale line-height proportionally to their font size.
• Use text-transform: uppercase for short tags and badges rather than typing all-caps in HTML.
• Always maintain text-decoration: none on links with a clear visual hover state.`,
          questions: [
            {
              id: 'q-css-2-4-1',
              question: 'Why should line-height be specified as a unitless number (e.g. line-height: 1.5) rather than pixels (line-height: 24px)?',
              code: 'body { line-height: 1.6; }',
              type: 'conceptual',
              options: [],
              answer: 'Unitless line-height acts as a multiplier of the element\'s own font size. Child elements (like h1 or small) will scale their line heights proportionally without inheriting a fixed pixel height.',
              explanation: 'Fixed pixel line heights cause large headings to overlap text when font size exceeds the line-height value.',
              category: 'Typography',
              order: 1,
            },
            {
              id: 'q-css-2-4-2',
              question: 'Which property and value removes the default blue underline from hyperlinks?',
              code: 'a { ??? : ???; }',
              type: 'mcq',
              options: ['text-decoration: none', 'underline: false', 'text-style: plain', 'font-decoration: none'],
              answer: 'text-decoration: none',
              explanation: 'text-decoration: none strips the default browser underline decoration from links.',
              category: 'Text Styling',
              order: 2,
            },
            {
              id: 'q-css-2-4-3',
              question: 'Which property transforms text like "hello world" into "HELLO WORLD"?',
              code: '',
              type: 'mcq',
              options: ['text-transform: uppercase', 'font-case: upper', 'text-decoration: capitalize', 'transform: uppercase'],
              answer: 'text-transform: uppercase',
              explanation: 'text-transform controls the capitalization of text (uppercase, lowercase, capitalize).',
              category: 'Text Properties',
              order: 3,
            },
          ],
          tasks: [
            {
              id: 't-css-2-4-1',
              taskNumber: 1,
              title: 'Format a Blog Article Header with Clean Typography',
              level: 'Level 1',
              category: 'Text Formatting',
              description: 'Style a blog post header with an uppercase category eyebrow tag, tight heading line-height, and relaxed paragraph line-height.',
              requirements: [
                'Style .eyebrow with text-transform: uppercase and letter-spacing: 0.05em',
                'Style .title with line-height: 1.2 and text-align: left',
                'Style .body-text with line-height: 1.7'
              ],
              example: '.eyebrow { text-transform: uppercase; }',
              hints: ['Use unitless values for line-height.'],
              starterCode: `/* Write text formatting rules below */\n`,
            },
          ],
        },
      ],
    },
    {
      title: 'Box Model',
      order: 3,
      description: 'Master the concentric box model layers: content dimensions, padding, borders, margins, and margin collapse.',
      lessons: [
        {
          title: 'Width and Height',
          type: 'text',
          duration: '18 mins',
          order: 1,
          content: `### 1. Width & Height Properties
- **\`width\` / \`height\`**: Sets fixed or percentage dimensions.
- **\`min-width\` / \`max-width\`**: Sets responsive bounds.
- **\`min-height: 100vh\`**: Ensures a container spans at least the full viewport height.

\`\`\`css
/* Responsive Container Pattern */
.container {
  width: 100%;
  max-width: 1200px; /* Never expands wider than 1200px */
  margin-inline: auto; /* Centers container horizontally */
}
\`\`\`

---

### 2. Box-Sizing: \`content-box\` vs \`border-box\`
- **\`content-box\` (Default):** \`width: 200px\` applies only to content. Adding 20px padding and 2px border makes total visual width \`244px\`!
- **\`border-box\`:** \`width: 200px\` includes content, padding, and borders. Padding shrinks inward.

\`\`\`css
/* Universal Border-Box Reset (Mandatory in every project) */
*, *::before, *::after {
  box-sizing: border-box;
}
\`\`\``,
          notes: `• Always apply box-sizing: border-box globally to simplify layout calculations.
• Use max-width: 100% on images and containers for responsive fluidity.
• Use min-height: 100vh on the root app wrapper to enable full-height page layouts.`,
          questions: [
            {
              id: 'q-css-3-1-1',
              question: 'If a div has box-sizing: border-box, width: 300px, and padding: 25px, what is the total rendered width of the div on screen?',
              code: 'div {\n  box-sizing: border-box;\n  width: 300px;\n  padding: 25px;\n}',
              type: 'output',
              options: [],
              answer: '300px',
              explanation: 'With border-box, the declared width (300px) is the total outer width. The internal content area shrinks to 300 - 50 = 250px.',
              category: 'Box Model',
              order: 1,
            },
            {
              id: 'q-css-3-1-2',
              question: 'Why is max-width: 1200px preferred over width: 1200px on responsive page containers?',
              code: '.container { max-width: 1200px; width: 100%; }',
              type: 'conceptual',
              options: [],
              answer: 'width: 1200px creates horizontal scrolling on mobile screens smaller than 1200px, while max-width allows the container to shrink gracefully on smaller viewports.',
              explanation: 'max-width enforces an upper bound while maintaining responsiveness on smaller screens.',
              category: 'Responsive Sizing',
              order: 2,
            },
            {
              id: 'q-css-3-1-3',
              question: 'Which property ensures a hero section occupies at least the entire height of the browser viewport?',
              code: '',
              type: 'mcq',
              options: ['min-height: 100vh', 'height: 100%', 'max-height: 100vh', 'size: fullscreen'],
              answer: 'min-height: 100vh',
              explanation: 'min-height: 100vh guarantees the section will be at least 100% of the viewport height, expanding further if content exceeds it.',
              category: 'Viewport Sizing',
              order: 3,
            },
          ],
          tasks: [
            {
              id: 't-css-3-1-1',
              taskNumber: 1,
              title: 'Create a Centered Responsive Content Container',
              level: 'Level 1',
              category: 'Box Model',
              description: 'Write CSS for a responsive .main-container with global border-box reset, 100% width, 1140px max-width, and horizontal auto margins.',
              requirements: [
                'Add universal box-sizing: border-box reset',
                'Set width: 100% and max-width: 1140px',
                'Center container with margin: 0 auto'
              ],
              example: '.container { width: 100%; max-width: 1140px; margin: 0 auto; }',
              hints: ['margin: 0 auto horizontally centers block elements with a declared max-width.'],
              starterCode: `/* Write container styles below */\n`,
            },
          ],
        },
        {
          title: 'Padding',
          type: 'text',
          duration: '18 mins',
          order: 2,
          content: `### 1. Understanding Padding
Padding creates transparent breathing space **inside** an element, between its content and its border.

\`\`\`css
/* 4-Value Shorthand (Top, Right, Bottom, Left - Clockwise) */
.card { padding: 10px 20px 15px 5px; }

/* 2-Value Shorthand (Vertical [Top/Bottom], Horizontal [Left/Right]) */
.button { padding: 12px 24px; }

/* 1-Value Shorthand (All 4 sides) */
.modal { padding: 32px; }

/* Individual Side Properties */
.alert {
  padding-top: 16px;
  padding-right: 20px;
  padding-bottom: 16px;
  padding-left: 20px;
}
\`\`\`

---

### 2. Modern Logical Properties
Instead of physical directions, modern CSS supports logical properties that adapt to writing modes (RTL languages):
- **\`padding-inline: 24px\`**: Sets left and right padding.
- **\`padding-block: 16px\`**: Sets top and bottom padding.`,
          notes: `• Padding is always transparent; it shows the background color or image of the element.
• Remember the clockwise shorthand order: Top ➔ Right ➔ Bottom ➔ Left (TRBL).
• Modern CSS logical properties: padding-inline (horizontal) and padding-block (vertical).`,
          questions: [
            {
              id: 'q-css-3-2-1',
              question: 'In the shorthand padding: 10px 20px;, what does 20px apply to?',
              code: 'padding: 10px 20px;',
              type: 'mcq',
              options: [
                'Left and Right sides (Horizontal padding)',
                'Top and Bottom sides (Vertical padding)',
                'Top side only',
                'All four sides'
              ],
              answer: 'Left and Right sides (Horizontal padding)',
              explanation: 'The 2-value shorthand represents padding: <top/bottom> <left/right>.',
              category: 'Padding Shorthand',
              order: 1,
            },
            {
              id: 'q-css-3-2-2',
              question: 'What modern CSS logical property sets both left and right padding simultaneously?',
              code: '',
              type: 'mcq',
              options: ['padding-inline', 'padding-block', 'padding-horizontal', 'padding-x'],
              answer: 'padding-inline',
              explanation: 'padding-inline sets start and end padding along the inline (horizontal) axis.',
              category: 'Logical Properties',
              order: 2,
            },
            {
              id: 'q-css-3-2-3',
              question: 'Does padding inherit the background color of its element?',
              code: '',
              type: 'conceptual',
              options: [],
              answer: 'Yes, padding is transparent and visually shows the background-color and background-image of the element it belongs to.',
              explanation: 'The background extends under both content and padding up to the inner edge of the border.',
              category: 'Box Model',
              order: 3,
            },
          ],
          tasks: [
            {
              id: 't-css-3-2-1',
              taskNumber: 1,
              title: 'Build Action Buttons with Symmetrical Padding',
              level: 'Level 1',
              category: 'Padding',
              description: 'Create style rules for .btn-sm, .btn-md, and .btn-lg buttons utilizing padding-inline and padding-block logical properties.',
              requirements: [
                'Style .btn-sm with padding-block: 6px and padding-inline: 12px',
                'Style .btn-md with padding-block: 10px and padding-inline: 20px',
                'Style .btn-lg with padding-block: 14px and padding-inline: 28px'
              ],
              example: '.btn-md { padding-block: 10px; padding-inline: 20px; }',
              hints: ['Logical properties padding-inline and padding-block replace physical left/right and top/bottom.'],
              starterCode: `/* Write button padding variants below */\n`,
            },
          ],
        },
        {
          title: 'Border',
          type: 'text',
          duration: '18 mins',
          order: 3,
          content: `### 1. Border Properties & Shorthand
Borders sit directly between padding and margin:

\`\`\`css
/* Shorthand: <width> <style> <color> */
.card {
  border: 1px solid #e2e8f0;
  border-radius: 12px; /* Rounded corners */
}

/* Individual Sides */
.callout {
  border-left: 4px solid #2563eb; /* Accent bar */
}

/* Border Styles: solid, dashed, dotted, double, none */
.dashed-dropzone {
  border: 2px dashed #94a3b8;
}
\`\`\`

---

### 2. Modern Rounded Corners with \`border-radius\`
- **\`border-radius: 8px\`**: Rounds all 4 corners.
- **\`border-radius: 9999px\`**: Creates a pill-shaped button.
- **\`border-radius: 50%\`**: Transforms a square element into a perfect circle (e.g. user avatars).`,
          notes: `• The border shorthand syntax is: border: <width> <style> <color>.
• Setting border-radius: 50% on a square element (equal width/height) creates a circle.
• Use transparent borders (border: 1px solid transparent) on default states to prevent layout jumps on hover.`,
          questions: [
            {
              id: 'q-css-3-3-1',
              question: 'How do you transform a square 40px x 40px image avatar into a perfect circle in CSS?',
              code: 'img.avatar {\n  width: 40px;\n  height: 40px;\n  ??? : ???;\n}',
              type: 'mcq',
              options: ['border-radius: 50%', 'border: circle', 'shape: circle', 'border-style: round'],
              answer: 'border-radius: 50%',
              explanation: 'Setting border-radius: 50% rounds all corners by half the width and height, creating a circle.',
              category: 'Border Radius',
              order: 1,
            },
            {
              id: 'q-css-3-3-2',
              question: 'Which of the following values is a valid CSS border-style?',
              code: '',
              type: 'mcq',
              options: ['dashed', 'striped', 'wave', 'zigzag'],
              answer: 'dashed',
              explanation: 'Valid border styles include solid, dashed, dotted, double, groove, ridge, inset, outset, and none.',
              category: 'Borders',
              order: 2,
            },
            {
              id: 'q-css-3-3-3',
              question: 'What is the shorthand syntax order for the border property?',
              code: 'border: 2px solid #3b82f6;',
              type: 'mcq',
              options: ['width style color', 'color width style', 'style color width', 'width color radius'],
              answer: 'width style color',
              explanation: 'The standard border shorthand format is <border-width> <border-style> <border-color>.',
              category: 'Syntax',
              order: 3,
            },
          ],
          tasks: [
            {
              id: 't-css-3-3-1',
              taskNumber: 1,
              title: 'Build a Circular Avatar and Pill Badge Component',
              level: 'Level 1',
              category: 'Borders',
              description: 'Create style rules for a circular profile avatar with a 2px border and a pill-shaped status badge with full rounded corners.',
              requirements: [
                'Style .avatar with width: 48px, height: 48px, border-radius: 50%, and border: 2px solid #2563eb',
                'Style .badge-pill with border-radius: 9999px and padding: 4px 12px'
              ],
              example: '.avatar { border-radius: 50%; } .badge-pill { border-radius: 9999px; }',
              hints: ['Use border-radius: 9999px for pill-shaped elements.'],
              starterCode: `/* Write avatar and pill badge styles below */\n`,
            },
          ],
        },
        {
          title: 'Margin',
          type: 'text',
          duration: '18 mins',
          order: 4,
          content: `### 1. Understanding Margin
Margin creates transparent empty space **outside** an element's border, separating it from neighboring elements.

\`\`\`css
/* Shorthand */
.card { margin: 24px; }
.card { margin: 16px 0; } /* 16px top/bottom, 0 left/right */

/* Auto Centering */
.modal {
  width: 500px;
  margin: 0 auto; /* Horizontally centers block elements */
}
\`\`\`

---

### 2. Vertical Margin Collapsing
When two vertical block margins touch, they do **not** add together. Instead, they **collapse** into a single margin equal to the largest of the two values:

\`\`\`css
/* Vertical Margin Collapse Example */
h1 { margin-bottom: 30px; }
p  { margin-top: 20px; }

/* The visual space between h1 and p is 30px (NOT 50px!) */
\`\`\``,
          notes: `• Vertical margins between adjacent block elements collapse to the single largest value.
• Horizontal margins never collapse; they add together normally.
• Use margin: 0 auto on block elements with a declared width to center them horizontally.`,
          questions: [
            {
              id: 'q-css-3-4-1',
              question: 'If element A has margin-bottom: 40px and adjacent sibling element B has margin-top: 30px, what is the vertical space between them?',
              code: '.element-a { margin-bottom: 40px; }\n.element-b { margin-top: 30px; }',
              type: 'output',
              options: [],
              answer: '40px',
              explanation: 'Vertical margins collapse into the maximum of the two values (Math.max(40, 30) = 40px).',
              category: 'Margin Collapse',
              order: 1,
            },
            {
              id: 'q-css-3-4-2',
              question: 'Do horizontal margins (left and right) collapse in standard CSS flow?',
              code: '',
              type: 'mcq',
              options: [
                'No, horizontal margins never collapse; they add together',
                'Yes, horizontal margins always collapse to the smaller value',
                'Only when using CSS Grid',
                'Only inside tables'
              ],
              answer: 'No, horizontal margins never collapse; they add together',
              explanation: 'Margin collapsing occurs strictly on vertical margins between adjacent in-flow block elements.',
              category: 'Box Model Mechanics',
              order: 2,
            },
            {
              id: 'q-css-3-4-3',
              question: 'How do you horizontally center a block element with a fixed max-width on the page?',
              code: '.box {\n  max-width: 600px;\n  ??? : ???;\n}',
              type: 'mcq',
              options: ['margin: 0 auto', 'align: center', 'text-align: center', 'padding: 0 auto'],
              answer: 'margin: 0 auto',
              explanation: 'margin: 0 auto tells the browser to distribute all remaining horizontal space equally between left and right margins.',
              category: 'Centering',
              order: 3,
            },
          ],
          tasks: [
            {
              id: 't-css-3-4-1',
              taskNumber: 1,
              title: 'Implement Horizontal Auto Centering and Vertical Spacing',
              level: 'Level 1',
              category: 'Margins',
              description: 'Write CSS to center a 600px card wrapper horizontally using auto margins and set consistent vertical spacing.',
              requirements: [
                'Set max-width: 600px',
                'Apply margin-inline: auto',
                'Apply margin-block: 40px'
              ],
              example: '.card-wrap { max-width: 600px; margin: 40px auto; }',
              hints: ['margin-inline: auto centers block elements with a declared width.'],
              starterCode: `/* Write centered card margin styles below */\n`,
            },
          ],
        },
      ],
    },
    {
      title: 'Layout',
      order: 4,
      description: 'Master display types, CSS position schemes, Flexbox alignment, and CSS Grid architectures.',
      lessons: [
        {
          title: 'Display',
          type: 'text',
          duration: '18 mins',
          order: 1,
          content: `### 1. The \`display\` Property
The \`display\` property specifies the internal and external rendering behavior of an element:

\`\`\`css
/* 1. Block: Takes full width, starts on new line */
.block-element { display: block; }

/* 2. Inline: Occupies content width, flows in sentence, width/height ignored */
.inline-element { display: inline; }

/* 3. Inline-Block: Flows inline like text, BUT respects width, height, padding, margin */
.inline-block-btn { display: inline-block; width: 150px; }

/* 4. None: Completely removes element from document flow and accessibility tree */
.hidden-element { display: none; }

/* 5. Modern Layout Engines */
.flex-container { display: flex; }
.grid-container { display: grid; }
\`\`\`

---

### 2. \`display: none\` vs \`visibility: hidden\`
- **\`display: none\`**: Removes the element entirely from the layout flow (0x0px footprint; adjacent elements collapse into its space).
- **\`visibility: hidden\`**: Hides element visually, but **preserves its blank space** in the document layout.`,
          notes: `• display: inline-block allows setting width and height on elements that sit side-by-side in a sentence.
• display: none removes the element from the layout flow and hides it from screen readers.
• display: flex and display: grid activate modern multi-axis layout engines on child elements.`,
          questions: [
            {
              id: 'q-css-4-1-1',
              question: 'What is the primary difference between display: none and visibility: hidden?',
              code: '/* A */ display: none;\n/* B */ visibility: hidden;',
              type: 'interview',
              options: [],
              answer: 'display: none removes the element entirely from document flow so it takes up zero space, while visibility: hidden makes the element invisible but retains its original layout footprint and dimensions.',
              explanation: 'display: none triggers a layout reflow; visibility: hidden triggers only a repaint.',
              category: 'Layout Flow',
              order: 1,
            },
            {
              id: 'q-css-4-1-2',
              question: 'Why would you use display: inline-block instead of display: inline on a button tag?',
              code: 'a.btn { display: inline-block; }',
              type: 'conceptual',
              options: [],
              answer: 'display: inline elements ignore width, height, and top/bottom margin properties. inline-block allows setting explicit dimensions and vertical margins while still flowing side-by-side.',
              explanation: 'inline-block combines the flow of inline elements with the box-model capabilities of block elements.',
              category: 'Display Types',
              order: 2,
            },
            {
              id: 'q-css-4-1-3',
              question: 'Which display property turns a container into a 1-dimensional flex formatting context?',
              code: '',
              type: 'mcq',
              options: ['display: flex', 'display: box', 'display: row', 'display: layout'],
              answer: 'display: flex',
              explanation: 'display: flex establishes a flex formatting context for all immediate children.',
              category: 'Flexbox',
              order: 3,
            },
          ],
          tasks: [
            {
              id: 't-css-4-1-1',
              taskNumber: 1,
              title: 'Build an Inline-Block Badge and Toggle Component',
              level: 'Level 1',
              category: 'Display',
              description: 'Create style classes using display: inline-block for side-by-side tags with padding, and a .hidden utility class using display: none.',
              requirements: [
                'Style .tag with display: inline-block, padding, and border-radius',
                'Create .hidden utility with display: none'
              ],
              example: '.tag { display: inline-block; padding: 4px 8px; } .hidden { display: none; }',
              hints: ['inline-block respects padding and margin while staying inline.'],
              starterCode: `/* Write display utility classes below */\n`,
            },
          ],
        },
        {
          title: 'Position',
          type: 'text',
          duration: '22 mins',
          order: 2,
          content: `### 1. The 5 CSS Position Schemes
\`\`\`css
/* 1. Static (Default): Standard normal document flow */
.static-box { position: static; }

/* 2. Relative: Offset relative to ITS OWN normal position without disrupting flow */
.relative-box {
  position: relative;
  top: 10px;  /* Nudges down 10px from original spot */
  left: 20px;
}

/* 3. Absolute: Removed from flow, positioned relative to nearest POSISTIONED ancestor */
.parent { position: relative; } /* Anchor */
.child-badge {
  position: absolute;
  top: 8px;
  right: 8px;
}

/* 4. Fixed: Positioned relative to the BROWSER VIEWPORT; stays fixed when scrolling */
.navbar-fixed {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
}

/* 5. Sticky: Behaves like relative until scroll threshold is met, then sticks like fixed */
.table-header {
  position: sticky;
  top: 0;
  background: white;
}
\`\`\``,
          notes: `• Absolute elements look up the DOM tree for the nearest ancestor with position NOT static (usually position: relative).
• Fixed elements stay anchored in place relative to the viewport during page scrolling.
• Use z-index (with a non-static position) to control layer stacking order.`,
          questions: [
            {
              id: 'q-css-4-2-1',
              question: 'An element with position: absolute positions itself relative to what?',
              code: '.badge { position: absolute; top: 0; right: 0; }',
              type: 'mcq',
              options: [
                'The nearest ancestor element that has a position other than static (e.g. relative, absolute, fixed)',
                'Always the browser window viewport',
                'Always the <body> element',
                'The immediate direct parent regardless of its position'
              ],
              answer: 'The nearest ancestor element that has a position other than static (e.g. relative, absolute, fixed)',
              explanation: 'If no positioned ancestor is found, the absolute element falls back to the initial containing block (the viewport).',
              category: 'Positioning',
              order: 1,
            },
            {
              id: 'q-css-4-2-2',
              question: 'What is the behavior of position: sticky on an element?',
              code: 'header { position: sticky; top: 0; }',
              type: 'conceptual',
              options: [],
              answer: 'It scrolls normally with document flow until its offset position (e.g. top: 0) reaches the viewport boundary, at which point it sticks in place until its parent container scrolls out of view.',
              explanation: 'position: sticky toggles between relative and fixed positioning based on scroll threshold.',
              category: 'Sticky Positioning',
              order: 2,
            },
            {
              id: 'q-css-4-2-3',
              question: 'Which property controls the 3D layer stacking order of positioned elements?',
              code: 'z-index: 100;',
              type: 'mcq',
              options: ['z-index', 'layer-index', 'depth', 'stack-order'],
              answer: 'z-index',
              explanation: 'z-index controls stacking order along the Z-axis for elements that have a non-static position.',
              category: 'Stacking Context',
              order: 3,
            },
          ],
          tasks: [
            {
              id: 't-css-4-2-1',
              taskNumber: 1,
              title: 'Build a Card with an Absolute Notification Badge',
              level: 'Level 2',
              category: 'Positioning',
              description: 'Create a relative card container holding an absolute notification pill positioned at top: -8px and right: -8px, and a sticky header.',
              requirements: [
                'Set .card-parent to position: relative',
                'Set .badge-corner to position: absolute, top: -8px, right: -8px',
                'Set .sticky-header to position: sticky, top: 0, z-index: 10'
              ],
              example: '.card-parent { position: relative; } .badge-corner { position: absolute; top: -8px; right: -8px; }',
              hints: ['Parent must have position: relative for absolute child positioning.'],
              starterCode: `/* Write positioning styles below */\n`,
            },
          ],
        },
        {
          title: 'Flexbox',
          type: 'text',
          duration: '25 mins',
          order: 3,
          content: `### 1. Flexbox 1D Layout System
Flexbox aligns items along a single axis (either row or column) with flexible sizing and spacing:

\`\`\`css
.navbar {
  display: flex;
  flex-direction: row;            /* row, row-reverse, column, column-reverse */
  justify-content: space-between; /* Main Axis: flex-start, center, flex-end, space-between */
  align-items: center;            /* Cross Axis: stretch, center, flex-start, flex-end */
  gap: 16px;                      /* Spacing between flex items */
  flex-wrap: wrap;                /* nowrap, wrap */
}
\`\`\`

---

### 2. Flex Item Child Properties
- **\`flex-grow: 1\`**: Item expands to fill available free space.
- **\`flex-shrink: 0\`**: Prevents image or avatar from collapsing when container shrinks.
- **\`flex-basis: 300px\`**: Initial size before free space is distributed.
- **\`flex: 1 1 auto\`**: Shorthand for \`flex-grow flex-shrink flex-basis\`.
- **\`margin-left: auto\`**: Pushes item all the way to the far right inside a flex row.`,
          notes: `• Flexbox is ideal for 1-dimensional components (navbars, toolbars, buttons groups, centered modals).
• Use gap instead of child margins for clean element spacing.
• Setting display: flex, justify-content: center, align-items: center perfectly centers content.`,
          questions: [
            {
              id: 'q-css-4-3-1',
              question: 'Which property aligns flex items along the MAIN axis?',
              code: 'display: flex;\n??? : space-between;',
              type: 'mcq',
              options: ['justify-content', 'align-items', 'align-content', 'flex-align'],
              answer: 'justify-content',
              explanation: 'justify-content controls alignment along the main axis (horizontal in row, vertical in column).',
              category: 'Flexbox Alignment',
              order: 1,
            },
            {
              id: 'q-css-4-3-2',
              question: 'How do you prevent an image or icon flex child from shrinking when space is constrained?',
              code: '.icon { ??? : 0; }',
              type: 'mcq',
              options: ['flex-shrink: 0', 'flex-grow: 0', 'flex-freeze: true', 'shrink: none'],
              answer: 'flex-shrink: 0',
              explanation: 'flex-shrink: 0 prohibits the flex item from shedding width when container space is tight.',
              category: 'Flex Dynamics',
              order: 2,
            },
            {
              id: 'q-css-4-3-3',
              question: 'How do you achieve perfect horizontal and vertical centering of a child element with Flexbox?',
              code: '.container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}',
              type: 'conceptual',
              options: [],
              answer: 'Setting display: flex, justify-content: center (main axis), and align-items: center (cross axis) provides complete centering in both dimensions.',
              explanation: 'This is the universal modern standard for centering modals, hero content, and icons.',
              category: 'Centering',
              order: 3,
            },
          ],
          tasks: [
            {
              id: 't-css-4-3-1',
              taskNumber: 1,
              title: 'Build a Responsive Flexbox Navbar Layout',
              level: 'Level 2',
              category: 'Flexbox',
              description: 'Create a navigation bar with a logo on the left, links in the middle, and an action button on the far right using display: flex, gap, and alignment properties.',
              requirements: [
                'Set .navbar to display: flex, justify-content: space-between, and align-items: center',
                'Set .nav-links to display: flex with gap: 20px',
                'Ensure items vertically center nicely'
              ],
              example: '.navbar { display: flex; justify-content: space-between; align-items: center; }',
              hints: ['Use gap on flex containers for clean spacing.'],
              starterCode: `/* Write flex navbar styles below */\n`,
            },
          ],
        },
        {
          title: 'Grid',
          type: 'text',
          duration: '25 mins',
          order: 4,
          content: `### 1. CSS Grid 2D Layout System
CSS Grid allows you to organize items into rows and columns simultaneously:

\`\`\`css
/* Responsive Grid with NO media queries! */
.course-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}
\`\`\`

---

### 2. Grid Terminology & Units
- **\`fr\` (Fraction Unit):** Represents a fraction of free available space.
- **\`repeat(3, 1fr)\`**: Creates 3 equal-width columns.
- **\`minmax(250px, 1fr)\`**: Sets column to be at least 250px wide, expanding to fill available space.
- **\`auto-fit\` vs \`auto-fill\`**: \`auto-fit\` stretches tracks to fill empty space; \`auto-fill\` preserves empty tracks.`,
          notes: `• Grid is a 2-dimensional system (rows AND columns simultaneously).
• repeat(auto-fit, minmax(280px, 1fr)) creates fully responsive card layouts without media queries.
• Use gap for simultaneous row-gap and column-gap spacing.`,
          questions: [
            {
              id: 'q-css-4-4-1',
              question: 'What does repeat(auto-fit, minmax(300px, 1fr)) create in CSS Grid?',
              code: 'grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));',
              type: 'interview',
              options: [],
              answer: 'A fully responsive multi-column layout where columns are at least 300px wide and automatically wrap to new rows on smaller screens without requiring media queries.',
              explanation: 'auto-fit calculates how many 300px tracks fit into the container and stretches them equally using 1fr.',
              category: 'CSS Grid',
              order: 1,
            },
            {
              id: 'q-css-4-4-2',
              question: 'What does the fr unit represent in CSS Grid?',
              code: 'grid-template-columns: 1fr 2fr 1fr;',
              type: 'mcq',
              options: [
                'A fraction of the available free space in the grid container',
                'Fixed frames per second',
                'Front-row pixel height',
                'Font resolution scale'
              ],
              answer: 'A fraction of the available free space in the grid container',
              explanation: 'The fr unit distributes remaining container space proportionally (e.g. 1fr 2fr 1fr divides space into 4 parts: 25%, 50%, 25%).',
              category: 'Grid Units',
              order: 2,
            },
            {
              id: 'q-css-4-4-3',
              question: 'How do you create a 3-column equal-width grid layout using CSS Grid?',
              code: '',
              type: 'mcq',
              options: [
                'grid-template-columns: repeat(3, 1fr);',
                'grid-columns: 3;',
                'display: grid-3;',
                'grid-template-rows: 3;'
              ],
              answer: 'grid-template-columns: repeat(3, 1fr);',
              explanation: 'repeat(3, 1fr) defines 3 columns each occupying 1 fractional share of container width.',
              category: 'CSS Grid',
              order: 3,
            },
          ],
          tasks: [
            {
              id: 't-css-4-4-1',
              taskNumber: 1,
              title: 'Build a Responsive Auto-Fitting Course Card Grid',
              level: 'Level 2',
              category: 'CSS Grid',
              description: 'Create a responsive grid container for course cards that auto-fits columns with a minimum width of 260px and 20px gap spacing.',
              requirements: [
                'Set display: grid on .cards-grid',
                'Use grid-template-columns: repeat(auto-fit, minmax(260px, 1fr))',
                'Add gap: 20px'
              ],
              example: '.cards-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; }',
              hints: ['auto-fit wraps cards to new lines automatically when viewport narrows.'],
              starterCode: `/* Write responsive CSS Grid styles below */\n`,
            },
          ],
        },
      ],
    },
    {
      title: 'Responsive Design',
      order: 5,
      description: 'Design mobile-first interfaces with media queries, responsive relative units (rem, em, vh, vw), and fluid clamp() scaling.',
      lessons: [
        {
          title: 'Media Queries',
          type: 'text',
          duration: '20 mins',
          order: 1,
          content: `### 1. What are Media Queries?
Media queries enable stylesheets to apply specific CSS rules based on device characteristics like viewport width, orientation, and color scheme:

\`\`\`css
/* Mobile-First Baseline (Default for all screens) */
.sidebar-layout {
  display: flex;
  flex-direction: column;
}

/* Tablet Breakpoint (768px and up) */
@media (min-width: 768px) {
  .sidebar-layout {
    flex-direction: row;
  }
}

/* Desktop Breakpoint (1024px and up) */
@media (min-width: 1024px) {
  .sidebar-layout {
    max-width: 1200px;
    margin: 0 auto;
  }
}

/* Dark Mode Media Query */
@media (prefers-color-scheme: dark) {
  body {
    background-color: #0b1120;
    color: #f8fafc;
  }
}
\`\`\`

---

### 2. Standard Industry Breakpoints
| Device Target | Media Query |
| :--- | :--- |
| **Mobile** | Default base styles (no media query) |
| **Tablet** | \`@media (min-width: 768px)\` |
| **Laptop / Desktop** | \`@media (min-width: 1024px)\` |
| **Large Desktop** | \`@media (min-width: 1280px)\` |`,
          notes: `• Always write media queries with min-width for clean mobile-first progression.
• Never style for specific device models (iPhone, iPad); style based on content breakpoints.
• Use prefers-color-scheme to automatically adapt to user system theme preferences.`,
          questions: [
            {
              id: 'q-css-5-1-1',
              question: 'In a Mobile-First development workflow, which media query feature is primarily used to enhance desktop layouts?',
              code: '@media (??? : 768px) { ... }',
              type: 'mcq',
              options: ['min-width', 'max-width', 'device-width', 'screen-size'],
              answer: 'min-width',
              explanation: 'min-width applies rules when the viewport is at or wider than the specified threshold, progressively enhancing mobile base styles.',
              category: 'Mobile-First',
              order: 1,
            },
            {
              id: 'q-css-5-1-2',
              question: 'Which media feature detects whether the user operating system is set to dark mode?',
              code: '@media (??? : dark)',
              type: 'mcq',
              options: ['prefers-color-scheme', 'color-mode', 'system-theme', 'appearance'],
              answer: 'prefers-color-scheme',
              explanation: 'prefers-color-scheme queries the OS-level dark or light mode preference.',
              category: 'Media Queries',
              order: 2,
            },
            {
              id: 'q-css-5-1-3',
              question: 'Why is designing for specific device pixel widths (e.g. 375px for iPhone) considered an antipattern?',
              code: '',
              type: 'conceptual',
              options: [],
              answer: 'Thousands of device screen sizes and aspect ratios exist across Android and iOS. Breakpoints should be placed where content naturally breaks, not tied to hardware models.',
              explanation: 'Content-driven breakpoints ensure robust adaptability across all present and future devices.',
              category: 'Responsive Architecture',
              order: 3,
            },
          ],
          tasks: [
            {
              id: 't-css-5-1-1',
              taskNumber: 1,
              title: 'Implement Mobile-First Media Queries for a Dashboard Layout',
              level: 'Level 2',
              category: 'Media Queries',
              description: 'Write CSS for a .dashboard-grid that stacks in 1 column on mobile, expands to 2 columns at 768px tablet, and expands to 4 columns at 1024px desktop.',
              requirements: [
                'Base .dashboard-grid: 1 column',
                '@media (min-width: 768px): 2 columns',
                '@media (min-width: 1024px): 4 columns'
              ],
              example: '.grid { display: grid; grid-template-columns: 1fr; } @media (min-width: 768px) { .grid { grid-template-columns: repeat(2, 1fr); } }',
              hints: ['Use min-width media queries.'],
              starterCode: `/* Write mobile-first media query breakpoints below */\n`,
            },
          ],
        },
        {
          title: 'Responsive Units',
          type: 'text',
          duration: '18 mins',
          order: 2,
          content: `### 1. Relative vs Absolute Units
- **Absolute Units (\`px\`, \`pt\`, \`cm\`):** Fixed size regardless of user preferences or screen scale.
- **Relative Units (\`rem\`, \`em\`, \`%\`, \`vw\`, \`vh\`, \`dvh\`):** Scale dynamically based on font size or viewport dimensions.

\`\`\`css
html {
  font-size: 16px; /* 1rem = 16px */
}

/* rem: Relative to Root html font-size (Predictable!) */
h1 { font-size: 2rem; } /* 32px */
p  { font-size: 1rem; } /* 16px */

/* em: Relative to parent/current element font-size (Compounds!) */
.badge { font-size: 0.8em; padding: 0.5em 1em; }

/* Viewport Units */
.hero-full { min-height: 100dvh; } /* Dynamic viewport height (mobile URL bar safe) */
.hero-title { font-size: 5vw; }    /* 5% of viewport width */
\`\`\`

---

### 2. \`rem\` vs \`em\` Comparison
- **\`rem\` (Root EM):** Always relative to the root \`<html>\` font size (usually 16px). Consistent across the entire document.
- **\`em\`:** Relative to the font size of the immediate parent element (compounds inside nested elements). Ideal for component padding that scales with font size.`,
          notes: `• Use rem for font sizes and layout spacing for consistent accessibility.
• If a visually impaired user increases their browser default font size from 16px to 24px, rem scales proportionally.
• Use dvh (Dynamic Viewport Height) to prevent mobile browser URL bar jumping bugs.`,
          questions: [
            {
              id: 'q-css-5-2-1',
              question: 'If the root <html> font-size is 16px, what is the computed pixel value of 1.5rem?',
              code: 'font-size: 1.5rem;',
              type: 'output',
              options: [],
              answer: '24px',
              explanation: '1.5rem * 16px = 24px.',
              category: 'Units',
              order: 1,
            },
            {
              id: 'q-css-5-2-2',
              question: 'What is the key advantage of using rem for typography over fixed px units?',
              code: '',
              type: 'interview',
              options: [],
              answer: 'rem respects user browser accessibility settings; if a user with low vision increases their default browser font size from 16px to 24px, all rem-based typography scales up gracefully.',
              explanation: 'Hardcoded px units override and break browser accessibility zoom preferences.',
              category: 'Accessibility & Units',
              order: 2,
            },
            {
              id: 'q-css-5-2-3',
              question: 'What does 100vw represent?',
              code: 'width: 100vw;',
              type: 'mcq',
              options: [
                '100% of the viewport width',
                '100 vector pixels',
                '100 view weight units',
                '100% of the parent width'
              ],
              answer: '100% of the viewport width',
              explanation: '1vw equals 1% of the viewport width, so 100vw equals the full viewport width.',
              category: 'Viewport Units',
              order: 3,
            },
          ],
          tasks: [
            {
              id: 't-css-5-2-1',
              taskNumber: 1,
              title: 'Convert a Legacy Pixel Design to Accessible REM Units',
              level: 'Level 1',
              category: 'Units',
              description: 'Convert a card with 32px padding, 24px title, 16px body, and 8px border-radius into proportional rem units assuming 16px base.',
              requirements: [
                'Set padding to 2rem (32px)',
                'Set title font-size to 1.5rem (24px)',
                'Set body font-size to 1rem (16px)',
                'Set border-radius to 0.5rem (8px)'
              ],
              example: '.card { padding: 2rem; font-size: 1rem; border-radius: 0.5rem; }',
              hints: ['Divide pixel value by 16 to find rem value (32 / 16 = 2rem).'],
              starterCode: `/* Write rem-based card styles below */\n`,
            },
          ],
        },
        {
          title: 'Mobile-first Design',
          type: 'text',
          duration: '22 mins',
          order: 3,
          content: `### 1. What is Mobile-First Design?
**Mobile-First Design** is an architectural strategy where you design and code the mobile version of an application first, and progressively enhance the layout for larger screens using \`min-width\` media queries.

\`\`\`css
/* 1. Mobile (Base Styles - Single Column, Touch Targets >= 44px) */
.product-card {
  display: flex;
  flex-direction: column;
  padding: 1rem;
}

.btn-cta {
  min-height: 48px; /* Touch-friendly tap target */
  width: 100%;
}

/* 2. Tablet Progressive Enhancement */
@media (min-width: 768px) {
  .product-card {
    flex-direction: row;
    gap: 1.5rem;
  }
  .btn-cta {
    width: auto;
  }
}
\`\`\`

---

### 2. Core Benefits of Mobile-First Development
1. **Faster Mobile Load Times:** Mobile devices don't have to parse and override heavy desktop CSS rules.
2. **Prioritized Content:** Forces design teams to focus on essential core features and concise copy.
3. **Clean CSS Architecture:** Avoids messy \`max-width\` overrides and reset hacks.`,
          notes: `• Start with base styles that render cleanly on small mobile viewports without any media queries.
• Ensure interactive buttons and links have a minimum touch target size of at least 44x44px (WCAG).
• Progressively enhance with @media (min-width: ...) as screen real estate expands.`,
          questions: [
            {
              id: 'q-css-5-3-1',
              question: 'Why is mobile-first development considered superior to desktop-first with max-width overrides?',
              code: '',
              type: 'interview',
              options: [],
              answer: 'Mobile devices download lighter CSS without parsing complex desktop overrides, code structure flows linearly with min-width, and designs prioritize essential core content before adding secondary enhancements.',
              explanation: 'Desktop-first requires constantly resetting desktop floats, grids, and widths on mobile screens.',
              category: 'Architecture',
              order: 1,
            },
            {
              id: 'q-css-5-3-2',
              question: 'What is the recommended minimum touch target dimension for buttons on mobile devices according to WCAG standards?',
              code: '',
              type: 'mcq',
              options: ['44px by 44px', '10px by 10px', '100px by 100px', '20px by 20px'],
              answer: '44px by 44px',
              explanation: 'WCAG 2.1 recommends touch targets be at least 44x44 CSS pixels to accommodate human fingers on touchscreens.',
              category: 'Accessibility & Touch UX',
              order: 2,
            },
            {
              id: 'q-css-5-3-3',
              question: 'In a mobile-first stylesheet, where are the base mobile styles placed?',
              code: '',
              type: 'mcq',
              options: [
                'Outside any media queries at the top of the stylesheet',
                'Inside an @media (max-width: 480px) block',
                'At the very bottom of the stylesheet',
                'Inside a JavaScript conditional'
              ],
              answer: 'Outside any media queries at the top of the stylesheet',
              explanation: 'Base styles apply to all screens by default; media queries then add enhancements for larger viewports.',
              category: 'Mobile-First',
              order: 3,
            },
          ],
          tasks: [
            {
              id: 't-css-5-3-1',
              taskNumber: 1,
              title: 'Build a Mobile-First Responsive Product Feature Section',
              level: 'Level 2',
              category: 'Mobile-First Design',
              description: 'Create a mobile-first product card with stacked 100% width button on mobile, transitioning to a side-by-side flex layout with auto-width button at 768px.',
              requirements: [
                'Base: .feature-card with flex-direction: column and .btn with width: 100%, min-height: 48px',
                'Breakpoint @media (min-width: 768px): flex-direction: row, .btn with width: auto'
              ],
              example: '.card { display: flex; flex-direction: column; } @media (min-width: 768px) { .card { flex-direction: row; } }',
              hints: ['Make base styles mobile-friendly without media queries.'],
              starterCode: `/* Write mobile-first feature styles below */\n`,
            },
          ],
        },
      ],
    },
  ],
};
