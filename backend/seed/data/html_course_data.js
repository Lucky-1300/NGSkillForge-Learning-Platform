/**
 * Seed Data: HTML5 Foundations
 * Strict alignment with demo syllabus:
 * 1. Introduction to HTML (What is HTML?, HTML Document Structure, HTML Tags and Elements, Attributes)
 * 2. Text and Content (Headings, Paragraphs, Links, Lists)
 * 3. Images and Multimedia (Images, Audio, Video, iframe)
 * 4. HTML Forms (Form Element, Input Types, Labels, Form Validation)
 * 5. Semantic HTML (Semantic Elements, Header Nav Main Section Article Footer, Accessibility Basics)
 */
module.exports = {
  title: 'HTML5 Foundations',
  description: 'Learn modern semantic HTML5, accessible markup, document structure, forms, tables, media elements, and SEO best practices.',
  instructor: 'Elena Vance',
  price: 0,
  category: 'Frontend',
  level: 'Beginner',
  duration: '4 weeks',
  order: 1,
  thumbnail: 'https://res.cloudinary.com/dyjifbrab/image/upload/f_auto,q_auto/html.png',
  modules: [
    {
      title: 'Introduction to HTML',
      order: 1,
      description: 'Master the core foundations of HTML, document anatomy, tags, elements, and attributes.',
      lessons: [
        {
          title: 'What is HTML?',
          type: 'text',
          duration: '15 mins',
          order: 1,
          content: `### 1. What is HTML?
**HTML** stands for **HyperText Markup Language**. It is the standard markup language used worldwide to structure web pages and their content.

- **HyperText:** Refers to hyperlinks that connect web pages to one another, either within a single website or between different websites across the internet.
- **Markup Language:** A system of annotating a document with tags that tell the web browser how to structure, format, and display text, images, and other media.

\`\`\`html
<p>Welcome to NGSkillForge Learning Platform!</p>
\`\`\`

---

### 2. How the Browser Renders HTML
When you enter a URL or open an HTML file:
1. The browser reads raw bytes from the network or disk.
2. It parses the characters into HTML tokens (start tags, end tags, attributes, text).
3. Tokens are converted into **DOM Nodes** (Document Object Model).
4. The nodes form a hierarchical **DOM Tree** that the browser renders on screen.

---

### 3. Key Milestones in HTML Evolution
| Version | Year | Significant Innovations |
| :--- | :--- | :--- |
| **HTML 1.0** | 1991 | Basic text formatting and hyperlinks created by Tim Berners-Lee |
| **HTML 4.01** | 1999 | Standardized tables, forms, and stylesheet integration |
| **XHTML 1.0** | 2000 | Strict XML-based syntax rules |
| **HTML5** | 2014 | Native audio/video, semantic landmarks, canvas, WebSockets, offline storage |`,
          notes: `• HTML is a markup language, not a programming language; it defines structure, not procedural logic.
• Browsers parse HTML from top to bottom and construct the Document Object Model (DOM).
• Modern web development adheres strictly to the HTML5 standard maintained by the WHATWG.`,
          questions: [
            {
              id: 'q-html-1-1-1',
              question: 'What does the acronym HTML stand for?',
              code: '',
              type: 'mcq',
              options: [
                'HyperText Markup Language',
                'HighText Machine Language',
                'Hyperlink and Text Management Language',
                'Home Tool Markup Language'
              ],
              answer: 'HyperText Markup Language',
              explanation: 'HTML stands for HyperText Markup Language, the standard authoring language for web documents.',
              category: 'Fundamentals',
              order: 1,
            },
            {
              id: 'q-html-1-1-2',
              question: 'Is HTML considered a programming language? Why or why not in an interview?',
              code: '',
              type: 'interview',
              options: [],
              answer: 'No, HTML is a declarative markup language used to define document structure and content semantics, lacking computational logic, loops, conditional branching, or variable evaluation.',
              explanation: 'Programming languages define algorithms and procedural logic, whereas markup languages annotate content for layout and presentation by a renderer.',
              category: 'Interview',
              order: 2,
            },
            {
              id: 'q-html-1-1-3',
              question: 'What is the role of the Document Object Model (DOM) created by the browser?',
              code: '',
              type: 'conceptual',
              options: [],
              answer: 'The DOM is an in-memory tree representation of the HTML document that allows JavaScript to inspect, manipulate, and dynamically style elements.',
              explanation: 'The browser parses HTML tags into a tree of JavaScript-accessible node objects known as the DOM.',
              category: 'Browser Architecture',
              order: 3,
            },
          ],
          tasks: [
            {
              id: 't-html-1-1-1',
              taskNumber: 1,
              title: 'Create Your First HTML Announcement Block',
              level: 'Level 1',
              category: 'Basics',
              description: 'Write a basic HTML snippet containing an introductory heading, a brief paragraph explaining what HTML is, and an emphasis on semantic markup.',
              requirements: [
                'Use an <h1> heading for the main title',
                'Include a <p> paragraph with text explaining HyperText Markup Language',
                'Use <strong> to highlight key terms'
              ],
              example: '<h1>Welcome</h1>\n<p>HTML is a <strong>markup language</strong>.</p>',
              hints: ['Tags must have matching opening and closing angle brackets.'],
              starterCode: `<!-- Write your HTML announcement snippet below -->\n`,
            },
          ],
        },
        {
          title: 'HTML Document Structure',
          type: 'text',
          duration: '18 mins',
          order: 2,
          content: `### 1. Standard HTML5 Boilerplate
Every valid HTML5 document follows a strict structural skeleton consisting of the \`<!DOCTYPE html>\` declaration, the root \`<html>\` element, the \`<head>\` metadata section, and the \`<body>\` renderable content section.

\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="NGSkillForge interactive web development curriculum.">
  <title>Document Structure - NGSkillForge</title>
</head>
<body>
  <h1>Welcome to NGSkillForge</h1>
  <p>Learn web development step-by-step.</p>
</body>
</html>
\`\`\`

---

### 2. Core Structure Elements Explained
- **\`<!DOCTYPE html>\`**: Tells the browser to use modern standard rendering mode rather than legacy quirks mode.
- **\`<html lang="en">\`**: The root container for the entire page; the \`lang\` attribute informs screen readers and translation tools of the natural language.
- **\`<head>\`**: Houses page metadata, title, linked CSS stylesheets, fonts, and scripts.
- **\`<meta charset="UTF-8">\`**: Specifies universal Unicode character encoding.
- **\`<meta name="viewport">\`**: Configures the mobile viewport for responsive rendering.
- **\`<title>\`**: Sets the tab title shown in the browser toolbar and search engine result pages.
- **\`<body>\`**: Contains all visual elements rendered on the viewport.`,
          notes: `• Always place <!DOCTYPE html> at the very first line of every HTML file.
• Always specify the lang attribute on <html> for accessibility and SEO.
• Only one <body> element is allowed per HTML document.`,
          questions: [
            {
              id: 'q-html-1-2-1',
              question: 'What happens if you omit <!DOCTYPE html> from an HTML document in modern browsers?',
              code: '',
              type: 'mcq',
              options: [
                'The browser switches to Quirks Mode and may render layouts according to obsolete 1990s rules',
                'The browser refuses to load the page and throws an HTTP 500 error',
                'JavaScript execution is permanently disabled',
                'The webpage automatically converts to XML'
              ],
              answer: 'The browser switches to Quirks Mode and may render layouts according to obsolete 1990s rules',
              explanation: 'Without the HTML5 doctype declaration, browsers enter quirks mode to maintain backwards compatibility with legacy non-standard websites.',
              category: 'Standards',
              order: 1,
            },
            {
              id: 'q-html-1-2-2',
              question: 'Which element is placed inside <head> to define the title shown on browser tabs and search engine results?',
              code: '<head>\n  <???>My Web App</???>\n</head>',
              type: 'mcq',
              options: ['<title>', '<meta title="...">', '<header>', '<h1>'],
              answer: '<title>',
              explanation: 'The <title> tag nested inside <head> provides the official document title used by browser tabs, bookmarks, and search engine SERPs.',
              category: 'Metadata',
              order: 2,
            },
            {
              id: 'q-html-1-2-3',
              question: 'Explain why the <meta name="viewport"> tag is essential in modern mobile web design.',
              code: '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
              type: 'conceptual',
              options: [],
              answer: 'It instructs mobile browsers to set the viewport width to the device screen width at a 1:1 scale, preventing mobile devices from zooming out desktop-width pages.',
              explanation: 'Without this viewport tag, smartphones assume a 980px desktop screen and scale the page down, rendering tiny unreadable text.',
              category: 'Responsive Design',
              order: 3,
            },
          ],
          tasks: [
            {
              id: 't-html-1-2-1',
              taskNumber: 1,
              title: 'Build an Accessible HTML5 Boilerplate',
              level: 'Level 1',
              category: 'Document Structure',
              description: 'Construct a complete, standard HTML5 boilerplate with correct DOCTYPE, lang attribute, UTF-8 charset, responsive viewport, page title, and body greeting.',
              requirements: [
                'Include <!DOCTYPE html> at line 1',
                'Add <html lang="en"> root container',
                'Add <head> with charset, viewport, and title',
                'Add <body> with an <h1> and <p>'
              ],
              example: '<!DOCTYPE html>\n<html lang="en">\n<head>...</head>\n<body>...</body>\n</html>',
              hints: ['Ensure all tags are properly closed in correct nesting order.'],
              starterCode: `<!-- Write your HTML5 boilerplate below -->\n`,
            },
          ],
        },
        {
          title: 'HTML Tags and Elements',
          type: 'text',
          duration: '18 mins',
          order: 3,
          content: `### 1. Tags vs Elements vs Content
- **Opening Tag:** Marks where an element begins (e.g., \`<p>\`).
- **Closing Tag:** Marks where an element ends with a forward slash (e.g., \`</p>\`).
- **Element:** The complete unit comprising the opening tag, content, and closing tag.
- **Empty / Self-Closing Elements:** Elements that cannot hold child content or text (e.g., \`<img>\`, \`<br>\`, \`<hr>\`, \`<input>\`, \`<meta>\`).

\`\`\`html
<!-- Standard Element -->
<p>This entire line is an HTML element.</p>

<!-- Self-Closing Elements (void elements) -->
<img src="/logo.png" alt="Company Logo">
<hr>
<br>
\`\`\`

---

### 2. Block-Level vs Inline Elements
| Characteristic | Block-Level Elements | Inline Elements |
| :--- | :--- | :--- |
| **Default Display** | Starts on a new line and takes full available width | Sits inline with surrounding text without line breaks |
| **Examples** | \`<div>\`, \`<p>\`, \`<h1>\`-\`<h6>\`, \`<section>\`, \`<ul>\` | \`<span>\`, \`<a>\`, \`<strong>\`, \`<em>\`, \`<code>\` |
| **Margin & Padding** | Top, bottom, left, right margins and padding apply fully | Left/right apply; top/bottom padding does not push adjacent lines |`,
          notes: `• In modern HTML5, void elements do not strictly require a trailing slash (e.g., <img> is valid HTML5).
• Block elements can contain other block elements and inline elements; inline elements should only contain data or other inline elements.
• Use <span> for generic inline styling and <div> for generic block grouping.`,
          questions: [
            {
              id: 'q-html-1-3-1',
              question: 'Which of the following is a void (self-closing) element in HTML?',
              code: '',
              type: 'mcq',
              options: ['<input>', '<p>', '<section>', '<button>'],
              answer: '<input>',
              explanation: '<input> is a void element that cannot wrap text or children and does not have a closing </input> tag.',
              category: 'Elements',
              order: 1,
            },
            {
              id: 'q-html-1-3-2',
              question: 'What is the primary visual difference between a block-level element and an inline element?',
              code: '',
              type: 'mcq',
              options: [
                'Block elements start on a new line and take full container width; inline elements occupy only their content width',
                'Inline elements cannot be styled with CSS',
                'Block elements only work inside tables',
                'Inline elements are automatically converted to uppercase'
              ],
              answer: 'Block elements start on a new line and take full container width; inline elements occupy only their content width',
              explanation: 'Block elements expand to 100% width of their parent container and force line breaks before and after.',
              category: 'Layout Basics',
              order: 2,
            },
            {
              id: 'q-html-1-3-3',
              question: 'Can an inline element like <span> contain a block-level element like <div> according to HTML specifications?',
              code: '<span><div>Invalid Structure</div></span>',
              type: 'conceptual',
              options: [],
              answer: 'No, standard HTML specification forbids nesting block-level elements inside inline elements because it disrupts the document flow model.',
              explanation: 'Inline elements are designed to flow within lines of text and cannot correctly wrap block formatting contexts.',
              category: 'Specifications',
              order: 3,
            },
          ],
          tasks: [
            {
              id: 't-html-1-3-1',
              taskNumber: 1,
              title: 'Structure Inline Highlights Inside a Block Container',
              level: 'Level 1',
              category: 'Elements',
              description: 'Create a <div> container holding a paragraph with mixed inline elements including <span>, <strong>, <em>, and <code>.',
              requirements: [
                'Create a parent <div> with class "profile-card"',
                'Add a <p> containing text with <strong>, <em>, and <code> tags',
                'Add a horizontal rule <hr> at the bottom'
              ],
              example: '<div class="card"><p>Learn <strong>HTML5</strong> with <code>code</code>.</p><hr></div>',
              hints: ['Ensure void elements like <hr> do not have closing tags.'],
              starterCode: `<!-- Write your nested elements structure below -->\n`,
            },
          ],
        },
        {
          title: 'Attributes',
          type: 'text',
          duration: '18 mins',
          order: 4,
          content: `### 1. What are HTML Attributes?
Attributes provide additional configuration, behavior, or metadata to HTML elements. They are always specified in the **opening tag** as \`name="value"\` pairs.

\`\`\`html
<!-- Element with multiple attributes -->
<a href="https://ngskillforge.com" target="_blank" rel="noopener" title="Visit NGSkillForge">
  Learning Platform
</a>
\`\`\`

---

### 2. Common Global Attributes
Global attributes can be used on almost every HTML element:
- **\`id\`**: Unique identifier in the entire document (e.g., \`id="main-nav"\`).
- **\`class\`**: Space-separated classification names for CSS styling and JS selection (e.g., \`class="btn btn-primary"\`).
- **\`title\`**: Tooltip text shown when hovering over the element.
- **\`hidden\`**: Boolean attribute that visually hides the element from display.
- **\`data-*\`**: Custom data attributes used to store private application data (e.g., \`data-course-id="42"\`).

---

### 3. Boolean Attributes
Boolean attributes do not require an explicit value string. Their presence on the element represents \`true\`, and their absence represents \`false\`:
\`\`\`html
<button disabled>Cannot Click</button>
<input type="checkbox" checked>
<input type="text" required>
\`\`\``,
          notes: `• The id attribute must be completely unique within a single HTML page.
• Use data-* attributes to store custom data for JavaScript access via element.dataset.
• Boolean attributes are enabled simply by being present in the opening tag.`,
          questions: [
            {
              id: 'q-html-1-4-1',
              question: 'Which of the following describes the difference between the id and class attributes?',
              code: '',
              type: 'mcq',
              options: [
                'id must be unique across the entire document, while class can be shared across multiple elements',
                'id is for CSS only, class is for JavaScript only',
                'class must be a number, id must be text',
                'id can only be used once in an entire website'
              ],
              answer: 'id must be unique across the entire document, while class can be shared across multiple elements',
              explanation: 'The id attribute provides a unique document-wide identifier, whereas class is a shared identifier for styling and grouping multiple elements.',
              category: 'Attributes',
              order: 1,
            },
            {
              id: 'q-html-1-4-2',
              question: 'How do you access the value of data-course-id="101" using JavaScript on an element?',
              code: '<div id="card" data-course-id="101"></div>',
              type: 'output',
              options: [],
              answer: 'document.getElementById("card").dataset.courseId',
              explanation: 'Custom data attributes are accessible via the dataset DOM property in camelCase (data-course-id becomes dataset.courseId).',
              category: 'DOM & Data Attributes',
              order: 2,
            },
            {
              id: 'q-html-1-4-3',
              question: 'How do boolean attributes like required or disabled function in HTML5?',
              code: '<input type="text" required>',
              type: 'conceptual',
              options: [],
              answer: 'Their presence in the opening tag represents a true state, and their absence represents false, regardless of whether a value is specified.',
              explanation: 'Writing required, required="", or required="required" all evaluate to true in HTML5.',
              category: 'Attributes',
              order: 3,
            },
          ],
          tasks: [
            {
              id: 't-html-1-4-1',
              taskNumber: 1,
              title: 'Implement Custom Data Attributes and Global IDs',
              level: 'Level 1',
              category: 'Attributes',
              description: 'Create an interactive button element equipped with unique id, multiple styling classes, a tooltip title, a disabled boolean attribute, and a custom data-role attribute.',
              requirements: [
                'Add id="submit-btn"',
                'Add class="btn btn-primary active"',
                'Add data-action="enroll" and data-course="html5"',
                'Add disabled boolean attribute'
              ],
              example: '<button id="submit-btn" class="btn btn-primary" data-action="enroll" disabled>Enroll</button>',
              hints: ['Boolean attributes like disabled do not need an equal sign.'],
              starterCode: `<!-- Write button element with attributes below -->\n`,
            },
          ],
        },
      ],
    },
    {
      title: 'Text and Content',
      order: 2,
      description: 'Format typography, headings, paragraphs, hyperlinks, lists, and hierarchical content.',
      lessons: [
        {
          title: 'Headings',
          type: 'text',
          duration: '15 mins',
          order: 1,
          content: `### 1. Heading Hierarchy (\`<h1>\` through \`<h6>\`)
HTML provides six levels of section headings. \`<h1>\` represents the highest rank and most important topic, while \`<h6>\` represents the lowest.

\`\`\`html
<h1>Frontend Development Masterclass</h1>
  <h2>HTML5 Architecture</h2>
    <h3>Semantic Landmarks</h3>
      <h4>Header & Navigation</h4>
\`\`\`

---

### 2. Best Practices for SEO and Accessibility
1. **One \`<h1>\` per Page:** A webpage should have exactly one main \`<h1>\` that represents the primary subject of the document.
2. **Never Skip Heading Levels:** Move sequentially from \`<h1>\` to \`<h2>\` to \`<h3>\`. Do not jump directly from \`<h1>\` to \`<h4>\` just for visual sizing (use CSS for visual styling).
3. **Screen Reader Navigation:** Blind users frequently navigate complex pages by jumping from heading to heading using screen reader shortcuts (e.g., 'H' key in NVDA/VoiceOver).`,
          notes: `• Use only ONE <h1> per page for optimal SEO and screen reader hierarchy.
• Never choose heading tags based on default font size; use CSS to adjust styling.
• Maintain a logical numerical hierarchy without skipping levels (h1 ➔ h2 ➔ h3).`,
          questions: [
            {
              id: 'q-html-2-1-1',
              question: 'How many <h1> elements should ideally be present on a single web page for optimal SEO and accessibility?',
              code: '',
              type: 'mcq',
              options: ['Exactly one', 'As many as needed for styling', 'Up to six', 'None, h1 is deprecated'],
              answer: 'Exactly one',
              explanation: 'A single <h1> element clearly signals the primary topic of the document to search engine indexers and screen readers.',
              category: 'SEO & Semantics',
              order: 1,
            },
            {
              id: 'q-html-2-1-2',
              question: 'Why is skipping heading levels (e.g., jumping from <h1> directly to <h3>) considered a bad practice?',
              code: '',
              type: 'conceptual',
              options: [],
              answer: 'It confuses screen reader users who navigate the page outline hierarchically and may think content is missing or corrupted.',
              explanation: 'Screen readers generate an outline from heading tags; skipped levels create a broken outline tree.',
              category: 'Accessibility',
              order: 2,
            },
            {
              id: 'q-html-2-1-3',
              question: 'Which heading tag represents the lowest level of heading in HTML5?',
              code: '',
              type: 'mcq',
              options: ['<h6>', '<h10>', '<h1 priority="low">', '<head6>'],
              answer: '<h6>',
              explanation: 'HTML defines heading levels strictly from <h1> (highest) to <h6> (lowest).',
              category: 'Typography',
              order: 3,
            },
          ],
          tasks: [
            {
              id: 't-html-2-1-1',
              taskNumber: 1,
              title: 'Build a Multi-Level Document Heading Outline',
              level: 'Level 1',
              category: 'Typography',
              description: 'Create a structured content outline for an online learning module with a single <h1>, two <h2> section headings, and sub-headings using <h3>.',
              requirements: [
                'Include exactly one <h1> for the course title',
                'Include two <h2> headings for modules',
                'Include two <h3> subtopics under each module without skipping levels'
              ],
              example: '<h1>Course</h1>\n<h2>Module 1</h2>\n<h3>Topic 1.1</h3>',
              hints: ['Do not skip from h1 directly to h3.'],
              starterCode: `<!-- Write your heading outline below -->\n`,
            },
          ],
        },
        {
          title: 'Paragraphs',
          type: 'text',
          duration: '15 mins',
          order: 2,
          content: `### 1. Paragraph Element (\`<p>\`)
The \`<p>\` element represents a block paragraph of text. Browsers automatically add vertical margin before and after paragraphs to visually separate blocks of text.

\`\`\`html
<p>
  HTML5 makes web pages accessible and structured. It provides semantic elements
  that describe the purpose of content to browsers and screen readers.
</p>
<p>
  Combined with modern CSS and JavaScript, HTML forms the bedrock of the open web.
</p>
\`\`\`

---

### 2. Line Breaks (\`<br>\`) and Horizontal Rules (\`<hr>\`)
- **\`<br>\`**: Inserts a single line break within a paragraph (use for addresses or poetry, not for spacing!).
- **\`<hr>\`**: Represents a thematic break or transition between topics.
- **\`<pre>\`**: Represents preformatted text where whitespace and line breaks are preserved exactly as typed.`,
          notes: `• Use CSS margins for spacing between elements, not multiple consecutive <br> tags.
• Whitespace and consecutive newlines inside standard <p> tags are collapsed into a single space by default.
• Use <pre> when exact whitespace and line indentation must be preserved (e.g. ASCII art or code).`,
          questions: [
            {
              id: 'q-html-2-2-1',
              question: 'How does a browser handle multiple consecutive spaces or line breaks inside a standard <p> element?',
              code: '<p>Hello      World\n\nHow are you?</p>',
              type: 'mcq',
              options: [
                'It collapses all consecutive whitespace and newlines into a single space',
                'It preserves every single space and newline verbatim',
                'It throws an HTML syntax error',
                'It replaces spaces with tab characters'
              ],
              answer: 'It collapses all consecutive whitespace and newlines into a single space',
              explanation: 'HTML parsers perform whitespace normalization, collapsing sequential whitespace characters into a single space.',
              category: 'Text Formatting',
              order: 1,
            },
            {
              id: 'q-html-2-2-2',
              question: 'Which element is used when you need to preserve exact whitespace, indentation, and newlines in HTML?',
              code: '',
              type: 'mcq',
              options: ['<pre>', '<p whitespace="true">', '<code>', '<text>'],
              answer: '<pre>',
              explanation: 'The <pre> (preformatted text) element displays text in a monospace font and preserves both spaces and line breaks.',
              category: 'Text Formatting',
              order: 2,
            },
            {
              id: 'q-html-2-2-3',
              question: 'Why is using multiple <br><br><br> tags for visual spacing considered poor practice?',
              code: '',
              type: 'conceptual',
              options: [],
              answer: 'Because <br> is meant for semantic line breaks (like poetry/addresses). Visual spacing should always be managed using CSS margin or padding properties.',
              explanation: 'Screen readers announce <br> tags, and using them for spacing creates an annoying experience for assistive tech users.',
              category: 'Best Practices',
              order: 3,
            },
          ],
          tasks: [
            {
              id: 't-html-2-2-1',
              taskNumber: 1,
              title: 'Format an Article with Paragraphs, Breaks and Preformatted Text',
              level: 'Level 1',
              category: 'Text',
              description: 'Create an article section with two body paragraphs, a mailing address using <br>, a thematic divider <hr>, and a preformatted code snippet using <pre>.',
              requirements: [
                'Add two distinct <p> elements',
                'Add an address block using <br> for line breaks',
                'Include an <hr> divider and a <pre> block'
              ],
              example: '<p>Intro</p><hr><pre>Preformatted</pre>',
              hints: ['<pre> retains all tabs and newlines exactly as written.'],
              starterCode: `<!-- Write your paragraph and preformatted text layout below -->\n`,
            },
          ],
        },
        {
          title: 'Links',
          type: 'text',
          duration: '18 mins',
          order: 3,
          content: `### 1. The Anchor Element (\`<a>\`)
Hyperlinks are created using the \`<a>\` tag with the \`href\` (hypertext reference) attribute:

\`\`\`html
<!-- External Link -->
<a href="https://developer.mozilla.org" target="_blank" rel="noopener noreferrer">
  MDN Web Docs
</a>

<!-- Internal Page Link (Relative Path) -->
<a href="/courses/html">HTML Curriculum</a>

<!-- Same-Page Anchor Link -->
<a href="#section-faq">Jump to FAQ</a>

<!-- Contact Schemes -->
<a href="mailto:support@ngskillforge.com?subject=Inquiry">Email Support</a>
<a href="tel:+18005550199">Call Helpline</a>

<!-- File Download -->
<a href="/docs/syllabus.pdf" download="HTML5_Guide.pdf">Download Guide</a>
\`\`\`

---

### 2. The \`target\` and \`rel\` Attributes
- **\`target="_self"\` (Default):** Opens link in the same browsing context.
- **\`target="_blank"\`:** Opens link in a new tab or window.
- **\`rel="noopener noreferrer"\`:** Essential security protection when using \`target="_blank"\` to prevent the newly opened page from controlling \`window.opener\`.`,
          notes: `• Always include rel="noopener noreferrer" whenever using target="_blank".
• Use mailto: for email links and tel: for phone call triggers.
• Provide descriptive link text (e.g. "View Full Syllabus") rather than generic "click here".`,
          questions: [
            {
              id: 'q-html-2-3-1',
              question: 'What is the security risk of using target="_blank" without rel="noopener noreferrer"?',
              code: '<a href="https://external.com" target="_blank">Link</a>',
              type: 'interview',
              options: [],
              answer: 'The opened external page gains access to the originating tab via window.opener and can redirect it to a malicious phishing page (reverse tabnabbing).',
              explanation: 'rel="noopener" sets window.opener to null, fully isolating the new tab from the originating window context.',
              category: 'Web Security',
              order: 1,
            },
            {
              id: 'q-html-2-3-2',
              question: 'Which URL scheme is used to launch the default phone dialer on a mobile device?',
              code: '<a href="???:+1234567890">Call Us</a>',
              type: 'mcq',
              options: ['tel:', 'call:', 'phone:', 'dial:'],
              answer: 'tel:',
              explanation: 'The tel: scheme initiates a phone call or prompts the dialer on mobile browsers.',
              category: 'Protocols',
              order: 2,
            },
            {
              id: 'q-html-2-3-3',
              question: 'How do you create an in-page smooth jump to an element with id="contact"?',
              code: '',
              type: 'mcq',
              options: ['<a href="#contact">Contact</a>', '<a href="contact">Contact</a>', '<a target="contact">Contact</a>', '<a to="#contact">Contact</a>'],
              answer: '<a href="#contact">Contact</a>',
              explanation: 'Prefixing href with a hash (#) creates an anchor link targeting an element with the matching id in the same document.',
              category: 'Navigation',
              order: 3,
            },
          ],
          tasks: [
            {
              id: 't-html-2-3-1',
              taskNumber: 1,
              title: 'Build a Multi-Protocol Navigation Bar',
              level: 'Level 1',
              category: 'Links',
              description: 'Create a navigation bar containing an external secure link with target="_blank", an internal relative link, a mailto link, and an in-page anchor link.',
              requirements: [
                'External link with target="_blank" and rel="noopener noreferrer"',
                'Internal relative link to "/courses"',
                'Mailto link with pre-filled subject',
                'Jump link to #features'
              ],
              example: '<nav><a href="...">...</a></nav>',
              hints: ['Always remember noopener when target="_blank" is used.'],
              starterCode: `<nav class="quick-links">\n  <!-- Add links below -->\n</nav>`,
            },
          ],
        },
        {
          title: 'Lists',
          type: 'text',
          duration: '18 mins',
          order: 4,
          content: `### 1. Types of HTML Lists
HTML provides three main list types to organize related items:
1. **Unordered Lists (\`<ul>\`):** Bulleted list of items where sequence does not matter.
2. **Ordered Lists (\`<ol>\`):** Numbered list of items where chronological or numerical sequence matters.
3. **Description Lists (\`<dl>\`):** Key-value dictionary lists of terms (\`<dt>\`) and descriptions (\`<dd>\`).

\`\`\`html
<!-- Unordered List -->
<ul>
  <li>Semantic HTML5</li>
  <li>CSS3 Grid & Flexbox</li>
  <li>Modern JavaScript</li>
</ul>

<!-- Ordered List with Type and Start Attributes -->
<ol type="1" start="1">
  <li>Plan Architecture</li>
  <li>Write Clean Markup</li>
  <li>Deploy to Production</li>
</ol>

<!-- Description List -->
<dl>
  <dt>HTML</dt>
  <dd>HyperText Markup Language for document structure.</dd>
  <dt>CSS</dt>
  <dd>Cascading Style Sheets for visual styling and layouts.</dd>
</dl>
\`\`\``,
          notes: `• <ul> and <ol> can ONLY contain <li> elements as their immediate direct children.
• Description lists (<dl>) contain <dt> (term) and <dd> (description) pairs.
• Lists can be nested inside <li> elements to build multi-level menus and table of contents.`,
          questions: [
            {
              id: 'q-html-2-4-1',
              question: 'Which elements are the only allowed immediate direct children of a <ul> or <ol> element?',
              code: '',
              type: 'mcq',
              options: ['Only <li> elements', 'Any block elements', '<span> and <div> elements', '<p> elements'],
              answer: 'Only <li> elements',
              explanation: 'According to HTML specifications, <ul> and <ol> elements can only contain <li> (list item) elements directly.',
              category: 'List Semantics',
              order: 1,
            },
            {
              id: 'q-html-2-4-2',
              question: 'Which list type is ideal for displaying a glossary or key-value metadata pairs?',
              code: '<dl>\n  <dt>Term</dt>\n  <dd>Definition</dd>\n</dl>',
              type: 'mcq',
              options: ['<dl> Description List', '<ol> Ordered List', '<ul> Unordered List', '<kl> Key List'],
              answer: '<dl> Description List',
              explanation: '<dl> represents a description list comprised of terms (<dt>) and definitions (<dd>).',
              category: 'List Types',
              order: 2,
            },
            {
              id: 'q-html-2-4-3',
              question: 'How do you create an ordered list that starts numbering from 5 instead of 1?',
              code: '',
              type: 'output',
              options: [],
              answer: '<ol start="5">',
              explanation: 'The start attribute on <ol> sets the starting integer value for numbering list items.',
              category: 'List Attributes',
              order: 3,
            },
          ],
          tasks: [
            {
              id: 't-html-2-4-1',
              taskNumber: 1,
              title: 'Build a Nested Curriculum Navigation Menu',
              level: 'Level 2',
              category: 'Lists',
              description: 'Construct a nested unordered list representing a multi-level course catalog navigation menu with tracks and topics.',
              requirements: [
                'Create a top-level <ul> for Tracks (Frontend, Backend)',
                'Nest an inner <ul> inside each <li> containing specific course names',
                'Add a <dl> description list summarizing course requirements'
              ],
              example: '<ul><li>Frontend<ul><li>HTML</li></ul></li></ul>',
              hints: ['Ensure nested <ul> tags are placed inside an <li>, not directly in the parent <ul>.'],
              starterCode: `<!-- Write nested list structure below -->\n`,
            },
          ],
        },
      ],
    },
    {
      title: 'Images and Multimedia',
      order: 3,
      description: 'Integrate images, responsive art direction, audio players, video streams, and external iframes.',
      lessons: [
        {
          title: 'Images',
          type: 'text',
          duration: '18 mins',
          order: 1,
          content: `### 1. The \`<img>\` Element and Performance Attributes
The \`<img>\` element embeds images into HTML documents. It is a void element that requires \`src\` and \`alt\` attributes.

\`\`\`html
<img 
  src="https://res.cloudinary.com/dyjifbrab/image/upload/f_auto,q_auto/html.png" 
  alt="HTML5 Course Logo with orange shield icon"
  width="400"
  height="225"
  loading="lazy"
>
\`\`\`

---

### 2. Crucial Attributes
- **\`alt\` (Alternative Text):** Read by screen readers and displayed if the image fails to load. Crucial for accessibility and image SEO.
- **\`width\` and \`height\`:** Specifying aspect ratio dimensions allows the browser to reserve space before the image downloads, eliminating **Cumulative Layout Shift (CLS)**.
- **\`loading="lazy"\`:** Defers image downloading until it approaches the user's viewport.`,
          notes: `• Always supply a descriptive alt attribute for informative images; use alt="" for purely decorative images.
• Always specify width and height to prevent CLS layout jumping.
• Use modern formats like WebP or AVIF for optimal compression.`,
          questions: [
            {
              id: 'q-html-3-1-1',
              question: 'Why should you always specify width and height attributes on <img> tags in modern web development?',
              code: '<img src="pic.jpg" alt="Hero" width="800" height="400">',
              type: 'conceptual',
              options: [],
              answer: 'It defines the aspect ratio box so the browser reserves layout space immediately, preventing Cumulative Layout Shift (CLS) when the image finishes loading.',
              explanation: 'CLS hurts Google Core Web Vitals and causes annoying visual page jumps for users.',
              category: 'Performance',
              order: 1,
            },
            {
              id: 'q-html-3-1-2',
              question: 'What should you set as the alt attribute for a purely decorative background image that carries no informational value?',
              code: '',
              type: 'mcq',
              options: ['alt="" (empty alt attribute)', 'Omit the alt attribute entirely', 'alt="decorative"', 'alt="null"'],
              answer: 'alt="" (empty alt attribute)',
              explanation: 'An empty alt="" signals to screen readers that the image is decorative and should be safely ignored in speech output.',
              category: 'Accessibility',
              order: 2,
            },
            {
              id: 'q-html-3-1-3',
              question: 'What does loading="lazy" do on an <img> tag?',
              code: '<img src="banner.webp" alt="Banner" loading="lazy">',
              type: 'mcq',
              options: [
                'Defers downloading the image until it is close to scrolling into the viewport',
                'Lowers the visual resolution of the image',
                'Loads the image with a CSS fade-in transition',
                'Caches the image in localStorage'
              ],
              answer: 'Defers downloading the image until it is close to scrolling into the viewport',
              explanation: 'Native lazy loading saves mobile data and speeds up initial page rendering by loading offscreen images only when needed.',
              category: 'Performance',
              order: 3,
            },
          ],
          tasks: [
            {
              id: 't-html-3-1-1',
              taskNumber: 1,
              title: 'Embed a High-Performance Accessible Image',
              level: 'Level 1',
              category: 'Images',
              description: 'Write an <img> tag pointing to a Cloudinary image URL, complete with descriptive alt text, explicit width/height dimensions, and native lazy loading.',
              requirements: [
                'Set src to Cloudinary image URL',
                'Provide comprehensive alt text',
                'Include width="600", height="338", and loading="lazy"'
              ],
              example: '<img src="..." alt="..." width="600" height="338" loading="lazy">',
              hints: ['Ensure all attributes are inside the single opening <img> tag.'],
              starterCode: `<!-- Write accessible image element below -->\n`,
            },
          ],
        },
        {
          title: 'Audio',
          type: 'text',
          duration: '15 mins',
          order: 2,
          content: `### 1. HTML5 Native Audio Player (\`<audio>\`)
HTML5 enables native audio playback without requiring legacy third-party plugins.

\`\`\`html
<audio controls preload="metadata">
  <source src="/media/podcast-episode1.mp3" type="audio/mpeg">
  <source src="/media/podcast-episode1.ogg" type="audio/ogg">
  Your browser does not support the audio element.
</audio>
\`\`\`

---

### 2. Key Attributes
- **\`controls\`**: Displays browser native playback controls (Play/Pause, volume, seeker).
- **\`autoplay\`**: Starts audio playback automatically (often restricted by browser security policies).
- **\`loop\`**: Replays audio continuously upon completion.
- **\`preload\`**: Values: \`none\` (saves bandwidth), \`metadata\` (loads duration/headers only), or \`auto\` (downloads full file).`,
          notes: `• Always supply fallback text inside <audio> for obsolete browsers.
• Provide multiple <source> formats (MP3, OGG) to ensure cross-browser compatibility.
• Modern browsers block audio autoplay unless muted by user interaction policies.`,
          questions: [
            {
              id: 'q-html-3-2-1',
              question: 'Which boolean attribute must be present on an <audio> tag for users to see Play, Pause, and Volume controls?',
              code: '<audio ??? src="song.mp3"></audio>',
              type: 'mcq',
              options: ['controls', 'show-ui', 'buttons', 'player'],
              answer: 'controls',
              explanation: 'Without the controls attribute, the audio element is completely invisible on the page.',
              category: 'Audio',
              order: 1,
            },
            {
              id: 'q-html-3-2-2',
              question: 'What is the recommended value for the preload attribute on audio files to conserve mobile user bandwidth?',
              code: '<audio controls preload="???">',
              type: 'mcq',
              options: ['metadata or none', 'auto', 'full', 'stream'],
              answer: 'metadata or none',
              explanation: 'preload="metadata" fetches track duration without downloading the full audio payload until the user clicks play.',
              category: 'Performance',
              order: 2,
            },
            {
              id: 'q-html-3-2-3',
              question: 'Why do modern browsers generally prevent audio elements from playing automatically with autoplay?',
              code: '',
              type: 'conceptual',
              options: [],
              answer: 'To prevent jarring user experiences, unwanted noise in public environments, and excessive cellular data consumption.',
              explanation: 'Browsers enforce strict Autoplay Policies requiring direct user gesture interaction before unmuted media can play.',
              category: 'Browser Policies',
              order: 3,
            },
          ],
          tasks: [
            {
              id: 't-html-3-2-1',
              taskNumber: 1,
              title: 'Build a Multi-Source HTML5 Podcast Audio Player',
              level: 'Level 1',
              category: 'Multimedia',
              description: 'Create an accessible <audio> player with controls, preload="metadata", multiple <source> tags (MP3 and OGG), and a text fallback.',
              requirements: [
                'Include <audio controls preload="metadata">',
                'Add <source src="audio.mp3" type="audio/mpeg">',
                'Add <source src="audio.ogg" type="audio/ogg">',
                'Include fallback message for unsupported browsers'
              ],
              example: '<audio controls><source ...><source ...>Fallback text</audio>',
              hints: ['Source elements must be placed inside the audio element.'],
              starterCode: `<!-- Write HTML5 audio player below -->\n`,
            },
          ],
        },
        {
          title: 'Video',
          type: 'text',
          duration: '18 mins',
          order: 3,
          content: `### 1. HTML5 Video Player (\`<video>\`)
The \`<video>\` element embeds video media directly into the browser with full hardware acceleration support:

\`\`\`html
<video 
  controls 
  width="800" 
  height="450" 
  poster="/images/course-poster.jpg" 
  preload="metadata"
>
  <source src="/media/intro-lesson.mp4" type="video/mp4">
  <source src="/media/intro-lesson.webm" type="video/webm">
  <track src="/subtitles/en.vtt" kind="subtitles" srclang="en" label="English Subtitles">
  Your browser does not support HTML5 video playback.
</video>
\`\`\`

---

### 2. Video Attributes & Captions
- **\`poster\`**: Displays a placeholder thumbnail image before playback starts.
- **\`<track>\`**: Embeds WebVTT subtitles, closed captions, and chapter navigation for accessibility.
- **\`playsinline\`**: Prevents iOS Safari from forcibly opening full-screen playback.`,
          notes: `• Always include a poster image for professional appearance before video loading.
• Add <track kind="subtitles"> for accessibility and hearing-impaired users (WCAG compliance).
• MP4 (H.264) and WebM (VP9/AV1) provide universal modern browser playback support.`,
          questions: [
            {
              id: 'q-html-3-3-1',
              question: 'Which element is used to add subtitles or captions to an HTML5 video?',
              code: '<video ...>\n  <source ...>\n  <??? src="sub.vtt" kind="subtitles">\n</video>',
              type: 'mcq',
              options: ['<track>', '<caption>', '<subtitle>', '<texttrack>'],
              answer: '<track>',
              explanation: 'The <track> element specifies timed text tracks (subtitles, captions, chapters) via WebVTT (.vtt) files.',
              category: 'Accessibility',
              order: 1,
            },
            {
              id: 'q-html-3-3-2',
              question: 'What is the purpose of the poster attribute on a <video> element?',
              code: '<video poster="cover.jpg" controls>',
              type: 'mcq',
              options: [
                'Specifies an image to display while the video is downloading or until the user hits play',
                'Adds a watermark overlay on top of the playing video',
                'Sets the background color of the video player',
                'Defines the thumbnail shown in browser bookmarks'
              ],
              answer: 'Specifies an image to display while the video is downloading or until the user hits play',
              explanation: 'The poster attribute provides a preview image displayed in the player canvas prior to playback.',
              category: 'Video',
              order: 2,
            },
            {
              id: 'q-html-3-3-3',
              question: 'Why is playsinline important for video playback on mobile devices like iPhone?',
              code: '<video playsinline controls>',
              type: 'conceptual',
              options: [],
              answer: 'It allows the video to play directly within the webpage layout rather than automatically expanding into a full-screen system modal.',
              explanation: 'iOS Safari defaults to taking over the screen in fullscreen mode unless playsinline is explicitly declared.',
              category: 'Mobile Video',
              order: 3,
            },
          ],
          tasks: [
            {
              id: 't-html-3-3-1',
              taskNumber: 1,
              title: 'Create an Accessible Video Player with Poster & Subtitles',
              level: 'Level 2',
              category: 'Video',
              description: 'Construct a full HTML5 video element with controls, poster image, MP4/WebM sources, a WebVTT subtitles track, and fallback text.',
              requirements: [
                'Set width, height, controls, and poster attributes on <video>',
                'Provide <source> for MP4 and WebM',
                'Include <track kind="subtitles" srclang="en" label="English">'
              ],
              example: '<video controls poster="..."><source ...><track ...></video>',
              hints: ['The track element is self-closing.'],
              starterCode: `<!-- Write HTML5 video element below -->\n`,
            },
          ],
        },
        {
          title: 'iframe',
          type: 'text',
          duration: '18 mins',
          order: 4,
          content: `### 1. The Inline Frame Element (\`<iframe>\`)
An \`<iframe>\` embeds another separate HTML document or third-party widget (e.g. YouTube video, Google Maps, code sandbox) inside the current web page.

\`\`\`html
<iframe 
  src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
  title="Interactive Code Demonstration"
  width="560" 
  height="315" 
  loading="lazy"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
  allowfullscreen
  sandbox="allow-scripts allow-same-origin"
></iframe>
\`\`\`

---

### 2. Security & The \`sandbox\` Attribute
The \`sandbox\` attribute applies extraordinary security restrictions to embedded iframes:
- Without parameters (\`sandbox\`), scripts, forms, popups, and same-origin cookies are disabled.
- **\`allow-scripts\`**: Allows the iframe to run its own JavaScript.
- **\`allow-same-origin\`**: Allows the iframe to maintain its own domain origin context.
- **\`allow-forms\`**: Allows the iframe to submit forms.`,
          notes: `• Always include a meaningful title attribute on <iframe> for screen readers.
• Use the sandbox attribute to prevent untrusted third-party embeds from running malicious scripts or framebusting.
• Always use loading="lazy" on iframes below the fold.`,
          questions: [
            {
              id: 'q-html-3-4-1',
              question: 'Why is the title attribute required on <iframe> elements for accessibility?',
              code: '<iframe src="..." title="Google Maps Location"></iframe>',
              type: 'conceptual',
              options: [],
              answer: 'Screen readers announce the title attribute to blind users so they understand what embedded content the iframe contains without having to enter it.',
              explanation: 'Without title, screen readers can only announce "frame", giving the user zero context regarding the embedded content.',
              category: 'A11y',
              order: 1,
            },
            {
              id: 'q-html-3-4-2',
              question: 'What is the purpose of the sandbox attribute on an <iframe>?',
              code: '<iframe sandbox src="untrusted.html"></iframe>',
              type: 'mcq',
              options: [
                'It imposes extra security restrictions, disabling scripts, popups, and plugins in the embedded document',
                'It applies a CSS border with rounded sand-colored corners',
                'It speeds up iframe download speeds by 50%',
                'It enables automatic translation into other languages'
              ],
              answer: 'It imposes extra security restrictions, disabling scripts, popups, and plugins in the embedded document',
              explanation: 'sandbox creates a hardened security sandbox, protecting the host website from untrusted external content.',
              category: 'Security',
              order: 2,
            },
            {
              id: 'q-html-3-4-3',
              question: 'Which attribute allows an embedded YouTube video iframe to expand into full-screen mode?',
              code: '<iframe src="..." allowfullscreen></iframe>',
              type: 'mcq',
              options: ['allowfullscreen', 'fullscreen="true"', 'max-size="viewport"', 'expandable'],
              answer: 'allowfullscreen',
              explanation: 'allowfullscreen is a boolean attribute enabling the iframe to call requestFullscreen().',
              category: 'Multimedia',
              order: 3,
            },
          ],
          tasks: [
            {
              id: 't-html-3-4-1',
              taskNumber: 1,
              title: 'Embed a Secure Third-Party Video Iframe',
              level: 'Level 2',
              category: 'Iframe',
              description: 'Write an <iframe> embedding an external resource with descriptive title, width/height dimensions, lazy loading, allowfullscreen, and sandbox protections.',
              requirements: [
                'Set src to a secure URL (https://)',
                'Add title="Course video player"',
                'Add loading="lazy" and allowfullscreen',
                'Add sandbox="allow-scripts allow-same-origin"'
              ],
              example: '<iframe src="https://..." title="..." allowfullscreen></iframe>',
              hints: ['Never omit the title attribute on an iframe.'],
              starterCode: `<!-- Write your secure iframe snippet below -->\n`,
            },
          ],
        },
      ],
    },
    {
      title: 'HTML Forms',
      order: 4,
      description: 'Master form architecture, modern input types, label associations, fieldsets, and client-side validation.',
      lessons: [
        {
          title: 'Form Element',
          type: 'text',
          duration: '18 mins',
          order: 1,
          content: `### 1. The \`<form>\` Container
The \`<form>\` element captures user input and packages data for transmission to a server:

\`\`\`html
<form action="/api/enroll" method="POST" autocomplete="on">
  <!-- Form controls go here -->
  <button type="submit">Submit Application</button>
</form>
\`\`\`

---

### 2. HTTP Methods: GET vs POST
| Characteristic | GET Method | POST Method |
| :--- | :--- | :--- |
| **Data Transmission** | Appends form fields directly into URL query string (\`?name=value\`) | Sends data inside the HTTP request body |
| **Visibility** | Exposed in browser address bar, history, and server access logs | Concealed in HTTP payload body |
| **Security** | Inappropriate for passwords, tokens, or private data | Required for passwords, transactions, and mutations |
| **Idempotency** | Safe and idempotent; ideal for search queries | Non-idempotent; creates or updates server records |`,
          notes: `• Use method="POST" for forms that modify server data, create accounts, or transmit passwords.
• Use method="GET" for search bars and filter forms so users can bookmark or share the query URL.
• Always specify action to define the backend destination endpoint.`,
          questions: [
            {
              id: 'q-html-4-1-1',
              question: 'Why should user login and registration forms ALWAYS use method="POST" instead of method="GET"?',
              code: '<form action="/login" method="POST">',
              type: 'interview',
              options: [],
              answer: 'GET appends form field values into the visible URL query string, exposing sensitive plaintext passwords in browser history, server access logs, and referral headers.',
              explanation: 'POST transmits data securely within the HTTP request body where it is encrypted under TLS/HTTPS.',
              category: 'Form Security',
              order: 1,
            },
            {
              id: 'q-html-4-1-2',
              question: 'What is the purpose of the action attribute on a <form> element?',
              code: '<form action="/submit-survey" method="POST">',
              type: 'mcq',
              options: [
                'It specifies the URL endpoint where the form data should be sent upon submission',
                'It triggers a JavaScript animation on submit',
                'It sets the database collection name',
                'It validates the user email address'
              ],
              answer: 'It specifies the URL endpoint where the form data should be sent upon submission',
              explanation: 'The action attribute defines the target server-side URL that processes the submitted form payload.',
              category: 'Forms',
              order: 2,
            },
            {
              id: 'q-html-4-1-3',
              question: 'What happens if the action attribute is omitted from a <form> tag?',
              code: '<form method="POST">',
              type: 'mcq',
              options: [
                'The form submits back to the current page URL',
                'The browser refuses to submit the form',
                'The data is permanently lost',
                'The form converts to an alert dialog'
              ],
              answer: 'The form submits back to the current page URL',
              explanation: 'When action is omitted, the browser submits the HTTP request to the current document URL.',
              category: 'Forms',
              order: 3,
            },
          ],
          tasks: [
            {
              id: 't-html-4-1-1',
              taskNumber: 1,
              title: 'Construct a Secure POST Form Container',
              level: 'Level 1',
              category: 'Forms',
              description: 'Create a <form> element configured to send a POST request to "/api/auth/register" with autocomplete enabled and a submit button.',
              requirements: [
                'Use action="/api/auth/register"',
                'Use method="POST"',
                'Add autocomplete="on"',
                'Include a <button type="submit">Register</button>'
              ],
              example: '<form action="/api/auth/register" method="POST"><button type="submit">Submit</button></form>',
              hints: ['Always set type="submit" on the primary action button.'],
              starterCode: `<!-- Write your form wrapper below -->\n`,
            },
          ],
        },
        {
          title: 'Input Types',
          type: 'text',
          duration: '22 mins',
          order: 2,
          content: `### 1. Modern HTML5 \`<input>\` Types
HTML5 introduced rich input types that automatically trigger specialized mobile virtual keyboards and perform built-in client validation:

\`\`\`html
<!-- Text and Credentials -->
<input type="text" name="username" placeholder="Username">
<input type="email" name="email" placeholder="user@example.com">
<input type="password" name="pwd">

<!-- Numerical and Ranges -->
<input type="number" name="age" min="18" max="100" step="1">
<input type="range" name="volume" min="0" max="100">

<!-- Contact and Search -->
<input type="tel" name="phone" placeholder="+1-555-0199">
<input type="url" name="portfolio" placeholder="https://">
<input type="search" name="q" placeholder="Search courses...">

<!-- Dates and Color -->
<input type="date" name="dob">
<input type="color" name="themeColor">

<!-- Selection Controls -->
<input type="checkbox" name="agree" id="agree">
<input type="radio" name="gender" value="m">
<input type="file" name="avatar" accept="image/*">
\`\`\``,
          notes: `• Using type="email", type="tel", and type="number" shows specialized mobile virtual keyboards.
• Radio buttons sharing the exact same name attribute form a mutually exclusive selection group.
• Checkboxes allow multiple independent selections.`,
          questions: [
            {
              id: 'q-html-4-2-1',
              question: 'How do you ensure that only one radio button can be selected at a time from a group of choices?',
              code: '<input type="radio" name="plan" value="free">\n<input type="radio" name="plan" value="pro">',
              type: 'mcq',
              options: [
                'Give all related radio buttons the exact same name attribute',
                'Give them the exact same id attribute',
                'Use JavaScript event listeners',
                'Radio buttons are automatically grouped by paragraph'
              ],
              answer: 'Give all related radio buttons the exact same name attribute',
              explanation: 'The browser groups radio buttons sharing the identical name value, allowing only one member of the group to be checked at any time.',
              category: 'Form Controls',
              order: 1,
            },
            {
              id: 'q-html-4-2-2',
              question: 'What is the user experience benefit of setting type="email" instead of type="text" on mobile devices?',
              code: '<input type="email" name="userEmail">',
              type: 'conceptual',
              options: [],
              answer: 'Mobile operating systems automatically display a keyboard optimized with the @ symbol, period, and .com shortcuts, plus native browser email format validation.',
              explanation: 'Proper input types optimize virtual keyboard layouts and user input speed on mobile devices.',
              category: 'Mobile UX',
              order: 2,
            },
            {
              id: 'q-html-4-2-3',
              question: 'Which attribute restricts file uploads in an <input type="file"> to image formats only?',
              code: '<input type="file" ???="image/*">',
              type: 'mcq',
              options: ['accept="image/*"', 'filter="images"', 'type="image"', 'allow="jpg,png"'],
              answer: 'accept="image/*"',
              explanation: 'The accept attribute specifies allowed MIME types or file extensions for file picker dialogs.',
              category: 'File Inputs',
              order: 3,
            },
          ],
          tasks: [
            {
              id: 't-html-4-2-1',
              taskNumber: 1,
              title: 'Build a Multi-Input User Onboarding Form',
              level: 'Level 2',
              category: 'Input Types',
              description: 'Create a form featuring text, email, password, number (with min/max), date, radio group for student status, and a checkbox for newsletter.',
              requirements: [
                'Include text, email, and password inputs',
                'Include a number input with min="18" and max="99"',
                'Include two radio buttons with the same name="status"',
                'Include a checkbox for terms agreement'
              ],
              example: '<input type="email" name="email">\n<input type="number" min="18">',
              hints: ['Ensure the radio buttons share the same name attribute.'],
              starterCode: `<!-- Write multi-input form below -->\n`,
            },
          ],
        },
        {
          title: 'Labels',
          type: 'text',
          duration: '15 mins',
          order: 3,
          content: `### 1. The Critical Role of \`<label>\`
Every form control must have an accessible label for two primary reasons:
1. **Accessibility:** Screen readers announce the label text when the input receives focus.
2. **Usability:** Clicking the label text focuses or toggles the associated input, dramatically expanding the clickable target area on mobile touchscreens.

\`\`\`html
<!-- Explicit Association (Recommended Standard) -->
<label for="user-email">Email Address</label>
<input type="email" id="user-email" name="email">

<!-- Implicit Association (Nesting) -->
<label>
  <input type="checkbox" name="agree">
  I agree to the Terms of Service
</label>
\`\`\`

---

### 2. Grouping with \`<fieldset>\` and \`<legend>\`
Use \`<fieldset>\` to group related inputs (such as payment details or radio choices) and \`<legend>\` to provide a caption:

\`\`\`html
<fieldset>
  <legend>Select Your Skill Level</legend>
  <label for="lvl-beg">
    <input type="radio" id="lvl-beg" name="skillLevel" value="beginner"> Beginner
  </label>
  <label for="lvl-adv">
    <input type="radio" id="lvl-adv" name="skillLevel" value="advanced"> Advanced
  </label>
</fieldset>
\`\`\``,
          notes: `• The for attribute on <label> must match the id attribute of the associated input.
• Never rely on placeholder text in place of a proper <label>; placeholders disappear when typing!
• Use <fieldset> and <legend> to group sets of radio buttons and checkboxes.`,
          questions: [
            {
              id: 'q-html-4-3-1',
              question: 'How do you explicitly link a <label> to an <input> element?',
              code: '<label ???="user-pwd">Password</label>\n<input id="user-pwd" type="password">',
              type: 'mcq',
              options: ['for="user-pwd"', 'id="user-pwd"', 'name="user-pwd"', 'target="user-pwd"'],
              answer: 'for="user-pwd"',
              explanation: 'The for attribute of the label matches the id attribute of the input to create an explicit programmatic association.',
              category: 'Accessibility & Forms',
              order: 1,
            },
            {
              id: 'q-html-4-3-2',
              question: 'Why is using placeholder="..." as a replacement for <label> considered an accessibility failure?',
              code: '<input type="text" placeholder="First Name">',
              type: 'conceptual',
              options: [],
              answer: 'Placeholders disappear as soon as the user starts typing, leaving them with no visible label to verify their input, and low color contrast impairs users with visual impairments.',
              explanation: 'Placeholders are temporary hints, not accessible field descriptions.',
              category: 'UX & A11y',
              order: 2,
            },
            {
              id: 'q-html-4-3-3',
              question: 'What elements are used to semantically group related radio buttons together with a descriptive header?',
              code: '',
              type: 'mcq',
              options: ['<fieldset> and <legend>', '<group> and <title>', '<section> and <header>', '<radiogroup> and <label>'],
              answer: '<fieldset> and <legend>',
              explanation: '<fieldset> groups form controls and <legend> provides the accessible caption announced by screen readers for the whole group.',
              category: 'Semantics',
              order: 3,
            },
          ],
          tasks: [
            {
              id: 't-html-4-3-1',
              taskNumber: 1,
              title: 'Build a Fully Labeled Payment Preference Form',
              level: 'Level 1',
              category: 'Labels',
              description: 'Construct a form with explicit <label for="..."> associations and a <fieldset> with <legend> grouping payment methods.',
              requirements: [
                'Create text inputs for cardholder name and billing zip with matching labels',
                'Create a <fieldset> with <legend>Select Payment Type</legend>',
                'Include radio buttons for Credit Card and PayPal wrapped in labels'
              ],
              example: '<fieldset><legend>Method</legend><label for="cc"><input type="radio" id="cc"> Card</label></fieldset>',
              hints: ['Ensure every label for attribute points to a unique input id.'],
              starterCode: `<!-- Write labeled form below -->\n`,
            },
          ],
        },
        {
          title: 'Form Validation',
          type: 'text',
          duration: '20 mins',
          order: 4,
          content: `### 1. Native HTML5 Form Validation
HTML5 provides client-side validation constraints without requiring custom JavaScript:

\`\`\`html
<form action="/api/apply" method="POST">
  <!-- Required field with length constraints -->
  <label for="username">Username (5-15 characters):</label>
  <input 
    type="text" 
    id="username" 
    name="username" 
    required 
    minlength="5" 
    maxlength="15"
  >

  <!-- Regex pattern for 10-digit phone number -->
  <label for="phone">Phone Number (10 digits):</label>
  <input 
    type="tel" 
    id="phone" 
    name="phone" 
    required 
    pattern="[0-9]{10}"
    title="Please enter exactly 10 digits."
  >

  <!-- Number bounds -->
  <label for="score">Quiz Score (0 to 100):</label>
  <input type="number" id="score" name="score" min="0" max="100" required>

  <button type="submit">Submit</button>
</form>
\`\`\`

---

### 2. Validation Attributes Summary
| Attribute | Function | Supported Types |
| :--- | :--- | :--- |
| **\`required\`** | Prohibits empty submission | text, email, password, select, checkbox, radio |
| **\`pattern\`** | Tests input against a regular expression | text, search, url, tel, email, password |
| **\`minlength\` / \`maxlength\`** | Bounds character count | text, email, search, password, textarea |
| **\`min\` / \`max\` / \`step\`** | Bounds numerical or date values | number, range, date, time |`,
          notes: `• Client-side HTML5 validation provides instant visual feedback to users.
• Never rely solely on client-side validation for security; ALWAYS validate data on the backend server!
• Use the title attribute to provide helpful explanation messages when a pattern regex fails.`,
          questions: [
            {
              id: 'q-html-4-4-1',
              question: 'Which HTML5 attribute allows validating input text against a custom Regular Expression?',
              code: '<input type="text" ???="[A-Z]{3}-[0-9]{4}">',
              type: 'mcq',
              options: ['pattern', 'regex', 'validate', 'match'],
              answer: 'pattern',
              explanation: 'The pattern attribute accepts a regex pattern that the input value must match for the form to be valid.',
              category: 'Validation',
              order: 1,
            },
            {
              id: 'q-html-4-4-2',
              question: 'Why must client-side HTML form validation always be paired with backend server-side validation?',
              code: '',
              type: 'interview',
              options: [],
              answer: 'Client-side validation can be effortlessly bypassed by malicious actors using Postman, cURL, or browser dev tools (e.g. removing the required attribute). Server validation is the only secure line of defense.',
              explanation: 'Client validation is strictly for user experience (speedy feedback); server validation guarantees security and data integrity.',
              category: 'Security & Validation',
              order: 2,
            },
            {
              id: 'q-html-4-4-3',
              question: 'Which boolean attribute prevents a form from submitting if an input field is left empty?',
              code: '<input type="email" ???>',
              type: 'mcq',
              options: ['required', 'not-empty', 'validate="true"', 'mandatory'],
              answer: 'required',
              explanation: 'The required attribute forces the user to provide a valid value before the form can be submitted.',
              category: 'Validation',
              order: 3,
            },
          ],
          tasks: [
            {
              id: 't-html-4-4-1',
              taskNumber: 1,
              title: 'Build a Strictly Validated Registration Form',
              level: 'Level 2',
              category: 'Form Validation',
              description: 'Create a registration form featuring required fields, minlength/maxlength constraints, pattern validation for a postal code, and numerical bounds for age.',
              requirements: [
                'Full name with required and minlength="3"',
                'Email with required and type="email"',
                'Age with type="number", min="18", max="65"',
                'Postal code with pattern="[0-9]{5}" and title helper'
              ],
              example: '<input type="text" required minlength="3">',
              hints: ['Use title="..." to explain the pattern requirement to users.'],
              starterCode: `<!-- Write validated registration form below -->\n`,
            },
          ],
        },
      ],
    },
    {
      title: 'Semantic HTML',
      order: 5,
      description: 'Implement semantic landmark elements, structured web architecture, and core web accessibility principles.',
      lessons: [
        {
          title: 'Semantic Elements',
          type: 'text',
          duration: '18 mins',
          order: 1,
          content: `### 1. What is Semantic HTML?
**Semantic HTML** means using markup elements that convey meaning about the content they contain, rather than just describing its visual appearance.

\`\`\`html
<!-- Non-Semantic Markup (Div Soup) -->
<div id="header">
  <div class="nav-links">...</div>
</div>
<div id="content">
  <div class="article-box">...</div>
</div>
<div id="footer">...</div>

<!-- Semantic HTML5 Markup -->
<header>
  <nav>...</nav>
</header>
<main>
  <article>...</article>
</main>
<footer>...</footer>
\`\`\`

---

### 2. Why Semantic HTML Matters
1. **Accessibility (a11y):** Screen readers use semantic landmarks to generate an accessible page outline, enabling users to jump straight to navigation, main content, or footers.
2. **SEO Rankings:** Search engine crawlers (Googlebot) prioritize headings and text inside \`<main>\` and \`<article>\` over generic divs.
3. **Maintainability:** Codebases are significantly cleaner and easier for engineering teams to understand.`,
          notes: `• Semantic tags give meaning to computers, search engines, and assistive technologies.
• Avoid "div soup" by replacing generic containers with semantic elements.
• Semantic HTML is the foundation of web accessibility (WCAG 2.1).`,
          questions: [
            {
              id: 'q-html-5-1-1',
              question: 'Which of the following is the primary advantage of using Semantic HTML5 elements over generic <div> tags?',
              code: '',
              type: 'mcq',
              options: [
                'Improves web accessibility for screen readers and search engine indexability (SEO)',
                'Automatically makes the webpage responsive on mobile devices',
                'Increases JavaScript execution speed by 2x',
                'Applies CSS Grid styles by default'
              ],
              answer: 'Improves web accessibility for screen readers and search engine indexability (SEO)',
              explanation: 'Semantic elements provide meaningful structural landmarks for assistive devices and search engine bots.',
              category: 'Semantics',
              order: 1,
            },
            {
              id: 'q-html-5-1-2',
              question: 'Is a <div> element considered a semantic element? Explain.',
              code: '<div class="main-content">...</div>',
              type: 'conceptual',
              options: [],
              answer: 'No, <div> is a non-semantic generic container that carries zero meaning about its content; it is strictly used as a styling or grouping hook.',
              explanation: '<div> tells the browser nothing about the role of the content inside it.',
              category: 'Semantics',
              order: 2,
            },
            {
              id: 'q-html-5-1-3',
              question: 'Which semantic element should wrap independent, self-contained content that could be syndicated (like a blog post or news story)?',
              code: '',
              type: 'mcq',
              options: ['<article>', '<section>', '<aside>', '<main>'],
              answer: '<article>',
              explanation: '<article> represents an independent, self-contained piece of content that makes sense on its own.',
              category: 'Semantics',
              order: 3,
            },
          ],
          tasks: [
            {
              id: 't-html-5-1-1',
              taskNumber: 1,
              title: 'Refactor Div-Based Code into Semantic Markup',
              level: 'Level 1',
              category: 'Semantic HTML',
              description: 'Convert a legacy div-based layout containing a header, navbar, main area, blog card, and footer into modern semantic HTML5 tags.',
              requirements: [
                'Replace <div class="header"> with <header>',
                'Replace <div class="nav"> with <nav>',
                'Wrap core content in <main>',
                'Use <article> for the blog card and <footer> for bottom content'
              ],
              example: '<header><nav>...</nav></header><main><article>...</article></main><footer>...</footer>',
              hints: ['There should be only one <main> tag on the page.'],
              starterCode: `<!-- Refactor the legacy structure below -->\n<div class="header">\n  <div class="nav">Menu</div>\n</div>\n<div class="main">\n  <div class="post">Blog Post</div>\n</div>\n<div class="footer">Copyright</div>\n`,
            },
          ],
        },
        {
          title: 'Header, Nav, Main, Section, Article, Footer',
          type: 'text',
          duration: '22 mins',
          order: 2,
          content: `### 1. The Core Semantic Landmark Tags
\`\`\`html
<header>
  <a href="/" class="logo">NGSkillForge</a>
  <nav aria-label="Main Navigation">
    <ul>
      <li><a href="#courses">Courses</a></li>
      <li><a href="#about">About</a></li>
    </ul>
  </nav>
</header>

<main>
  <section id="hero">
    <h1>Learn Full-Stack Web Development</h1>
    <p>Hands-on interactive coding platform.</p>
  </section>

  <section id="courses">
    <h2>Available Tracks</h2>
    <article class="course-card">
      <h3>HTML5 Foundations</h3>
      <p>Master modern web document architecture.</p>
    </article>
    <article class="course-card">
      <h3>CSS3 & Modern Layouts</h3>
      <p>Master Flexbox, Grid, and responsive styling.</p>
    </article>
  </section>

  <aside>
    <h3>Upcoming Workshops</h3>
    <p>Join our live React build-along this Saturday!</p>
  </aside>
</main>

<footer>
  <p>&copy; 2026 NGSkillForge. All rights reserved.</p>
</footer>
\`\`\`

---

### 2. Semantic Landmark Rules
- **\`<header>\`**: Introductory content for the page or an enclosing section.
- **\`<nav>\`**: Dedicated navigation landmark containing major links.
- **\`<main>\`**: The dominant central content of the document (only ONE per page).
- **\`<section>\`**: Thematic grouping of content, typically with a heading (\`<h2>\`-\`<h6>\`).
- **\`<article>\`**: Self-contained, independently distributable entity.
- **\`<aside>\`**: Content tangentially related to the main content (sidebars, callouts, ads).
- **\`<footer>\`**: Closing information, legal notices, copyright, author credits.`,
          notes: `• Do not place more than one visible <main> element on a page.
• Always include a heading (<h2>-<h6>) inside <section> elements.
• <aside> can be used inside or outside <main> for tangential sidebar content.`,
          questions: [
            {
              id: 'q-html-5-2-1',
              question: 'What is the key difference between <section> and <article>?',
              code: '',
              type: 'interview',
              options: [],
              answer: '<article> represents an independent, self-contained piece of content that makes sense on its own (like a blog post or tweet), while <section> is a thematic grouping of related content that forms part of a larger whole.',
              explanation: 'If the content can be cleanly republished in an RSS feed or separate widget, use <article>. If it is just a chapter/section of the page, use <section>.',
              category: 'Semantic Hierarchy',
              order: 1,
            },
            {
              id: 'q-html-5-2-2',
              question: 'Can you have more than one <header> element on a single HTML page?',
              code: '',
              type: 'mcq',
              options: [
                'Yes, you can have a page header and also section/article headers',
                'No, <header> can only be used once per HTML document',
                'Only if the second header is in a sidebar',
                'Only in XML documents'
              ],
              answer: 'Yes, you can have a page header and also section/article headers',
              explanation: '<header> can represent the top of the entire document or the introductory banner of an <article> or <section>.',
              category: 'Semantics',
              order: 2,
            },
            {
              id: 'q-html-5-2-3',
              question: 'Which element is intended for sidebars, callouts, and tangentially related secondary content?',
              code: '',
              type: 'mcq',
              options: ['<aside>', '<sidebar>', '<section type="side">', '<nav>'],
              answer: '<aside>',
              explanation: '<aside> defines content aside from the content it is placed in (like a sidebar or callout box).',
              category: 'Landmarks',
              order: 3,
            },
          ],
          tasks: [
            {
              id: 't-html-5-2-1',
              taskNumber: 1,
              title: 'Build a Complete Semantic Webpage Layout',
              level: 'Level 2',
              category: 'Semantic Layout',
              description: 'Construct a semantic single-page layout featuring header with nav, main with hero section, two article course cards, an aside sidebar, and a footer.',
              requirements: [
                'Include <header> with <nav>',
                'Use a single <main> element containing two <section> blocks',
                'Include at least two <article> cards with internal headings',
                'Include <aside> and <footer>'
              ],
              example: '<header>...</header><main><section>...</section><aside>...</aside></main><footer>...</footer>',
              hints: ['Ensure every section and article contains a heading tag.'],
              starterCode: `<!-- Write your semantic page layout below -->\n`,
            },
          ],
        },
        {
          title: 'Accessibility Basics',
          type: 'text',
          duration: '20 mins',
          order: 3,
          content: `### 1. Web Accessibility (a11y) & WCAG Principles
Web accessibility ensures that websites, tools, and technologies are designed so that people with disabilities (visual, auditory, motor, cognitive) can use them.

The **POUR** Principles:
1. **Perceivable:** Content must be presented so users can perceive it (alt text, transcripts).
2. **Operable:** Interface components must be keyboard-navigable (no mouse-only traps).
3. **Understandable:** Content and operation must be clear and predictable.
4. **Robust:** Content must work reliably across a wide variety of user agents and assistive tech.

---

### 2. ARIA Basics (Accessible Rich Internet Applications)
The **First Rule of ARIA**:
> *"If you can use a native HTML element or attribute with the semantics and behavior you require already built in, then do so instead of re-purposing an element and adding an ARIA role."*

\`\`\`html
<!-- Bad: Inaccessible div button -->
<div class="btn" onclick="submit()">Click Me</div>

<!-- Good: Native accessible button -->
<button type="button" onclick="submit()">Click Me</button>

<!-- Accessible Icon-Only Button with ARIA -->
<button type="button" aria-label="Close dialog modal">
  <svg aria-hidden="true" width="16" height="16">...</svg>
</button>
\`\`\``,
          notes: `• Always prefer native HTML elements (<button>, <a>, <nav>) over ARIA-augmented <div> tags.
• Use aria-label on icon-only buttons to give screen readers a clear verbal label.
• Use aria-hidden="true" on decorative icons to hide redundant noise from screen readers.`,
          questions: [
            {
              id: 'q-html-5-3-1',
              question: 'What is the "First Rule of ARIA"?',
              code: '',
              type: 'interview',
              options: [],
              answer: 'Use native HTML elements with built-in accessibility features whenever possible before attempting to replicate functionality with custom ARIA roles and divs.',
              explanation: 'Native elements (like <button>) come with free keyboard focus, enter/space key handling, and accessibility API wiring.',
              category: 'Accessibility',
              order: 1,
            },
            {
              id: 'q-html-5-3-2',
              question: 'How do you provide an accessible label for an icon-only button containing only an SVG icon?',
              code: '<button ???="Search courses"><svg>...</svg></button>',
              type: 'mcq',
              options: ['aria-label="Search courses"', 'title="Search courses" only', 'alt="Search courses"', 'aria-hidden="false"'],
              answer: 'aria-label="Search courses"',
              explanation: 'aria-label supplies an explicit text string that screen readers announce when an element lacks visible text.',
              category: 'ARIA',
              order: 2,
            },
            {
              id: 'q-html-5-3-3',
              question: 'What does aria-hidden="true" do when applied to an element?',
              code: '<svg aria-hidden="true">...</svg>',
              type: 'mcq',
              options: [
                'Hides the element from assistive screen readers while keeping it visually visible on screen',
                'Hides the element visually from the screen like display: none',
                'Encrypts the element source code',
                'Makes the element unclickable'
              ],
              answer: 'Hides the element from assistive screen readers while keeping it visually visible on screen',
              explanation: 'aria-hidden="true" hides purely decorative elements from the accessibility tree so screen readers do not announce them.',
              category: 'ARIA',
              order: 3,
            },
          ],
          tasks: [
            {
              id: 't-html-5-3-1',
              taskNumber: 1,
              title: 'Build an Accessible Icon Button and Alert Box',
              level: 'Level 2',
              category: 'Accessibility',
              description: 'Create an accessible icon button with aria-label and aria-hidden="true" on the icon, plus an accessible live alert region with role="alert".',
              requirements: [
                'Create a <button> with aria-label="Dismiss notification"',
                'Add an inner decorative span with aria-hidden="true"',
                'Create a status container with role="alert" and aria-live="polite"'
              ],
              example: '<button aria-label="Close"><span aria-hidden="true">&times;</span></button><div role="alert">Updated</div>',
              hints: ['Always use a native <button> tag for interactive clickables.'],
              starterCode: `<!-- Write accessible components below -->\n`,
            },
          ],
        },
      ],
    },
  ],
};
