/**
 * Seed Data: MongoDB Data Modeling
 */
module.exports = {
  title: 'MongoDB Data Modeling',
  modules: [
    {
      title: 'NoSQL Foundations, BSON & Architecture',
      order: 1,
      description: 'Understand document database architecture, JSON vs BSON, ObjectId anatomy, and mongosh operations.',
      lessons: [
        {
          title: 'Document Database Architecture & ObjectId Anatomy',
          type: 'text',
          duration: '20 mins',
          order: 1,
          content: `### 1. Relational (RDBMS) vs Document (MongoDB) Architecture
| Relational Database | MongoDB Document Model |
| :--- | :--- |
| Tables | **Collections** |
| Rows / Records | **Documents (BSON)** |
| Columns | **Fields (Key-Value pairs, nested objects, arrays)** |
| Fixed SQL Schemas | **Flexible Dynamic Schema with Validation Rules** |
| Foreign Key Joins | **Embedding & Referencing with Aggregation $lookup** |

---

### 2. Anatomy of a 12-Byte MongoDB \`ObjectId\`
Every document automatically receives a unique \`_id\` of type \`ObjectId\`:
\`\`\`
  [ 4 Bytes: Unix Epoch Timestamp ]
+ [ 5 Bytes: Random Process / Machine Identifier ]
+ [ 3 Bytes: Incrementing Counter initialized to random value ]
= 12-Byte Globally Unique Identifier
\`\`\`

\`\`\`javascript
// Extracting creation time directly from ObjectId
const id = new ObjectId("64f1a2b3c4d5e6f7a8b9c0d1");
console.log(id.getTimestamp()); // Prints exact UTC creation date & time!
\`\`\``,
          notes: `• BSON (Binary JSON) extends JSON with extra data types (Date, ObjectId, Binary, Decimal128).
• Documents have a maximum size limit of 16 MB.
• The first 4 bytes of an ObjectId contain the timestamp, making documents naturally chronological.`,
          questions: [
            {
              id: 'q-mongo-1-1-1',
              question: 'What is the maximum allowed document size in MongoDB?',
              code: '',
              type: 'mcq',
              options: ['16 Megabytes (16 MB)', '64 Kilobytes (64 KB)', '1 Gigabyte (1 GB)', 'Unlimited'],
              answer: '16 Megabytes (16 MB)',
              explanation: 'MongoDB enforces a 16MB maximum document size to ensure high-speed RAM caching and prevent memory bloat.',
              category: 'Architecture',
              order: 1,
            },
          ],
          tasks: [
            {
              id: 't-mongo-1-1-1',
              taskNumber: 1,
              title: 'Inspect and Extract Timestamps from MongoDB ObjectIds',
              level: 'Level 1',
              category: 'BSON',
              description: 'Write a Node.js / Mongoose snippet that instantiates a MongoDB ObjectId and prints its embedded ISO timestamp.',
              requirements: [
                'Import mongoose.Types.ObjectId',
                'Instantiate an ObjectId',
                'Call .getTimestamp() and log result'
              ],
              example: 'const id = new mongoose.Types.ObjectId(); console.log(id.getTimestamp());',
              hints: ['Use mongoose.Types.ObjectId().getTimestamp().'],
              starterCode: `const mongoose = require('mongoose');\n\nfunction inspectObjectId() {\n  // Extract timestamp\n}\n`,
            },
          ],
        },
      ],
    },
    {
      title: 'CRUD Operations & Query Selectors',
      order: 2,
      description: 'Master create, read, update, and delete operations with comparison, logical, and array operators.',
      lessons: [
        {
          title: 'Advanced Query & Array Update Operators',
          type: 'text',
          duration: '24 mins',
          order: 1,
          content: `### 1. Complex Query Filtering Selectors
\`\`\`javascript
// Find active courses priced between 0 and 50 in Frontend or Backend categories
db.courses.find({
  $and: [
    { isPublished: true },
    { price: { $gte: 0, $lte: 50 } },
    { category: { $in: ['Frontend', 'Backend', 'Full Stack'] } }
  ]
}).sort({ order: 1 }).limit(10);
\`\`\`

---

### 2. Atomic Array Modifiers (\`$push\`, \`$pull\`, \`$addToSet\`)
\`\`\`javascript
// Add a student to enrolledStudents only if not already present ($addToSet)
db.courses.updateOne(
  { _id: courseId },
  { 
    $addToSet: { enrolledStudents: userId },
    $inc: { studentCount: 1 },
    $set: { updatedAt: new Date() }
  }
);

// Update a specific nested lesson title using arrayFilters
db.courses.updateOne(
  { _id: courseId },
  { $set: { "modules.$[m].lessons.$[l].title": "Updated Title" } },
  { arrayFilters: [{ "m.order": 1 }, { "l.order": 2 }] }
);
\`\`\``,
          notes: `• Use $addToSet instead of $push when you need set uniqueness in an array.
• Use arrayFilters for surgical updates to nested subdocument arrays.
• All single-document updates in MongoDB are atomic.`,
          questions: [
            {
              id: 'q-mongo-2-1-1',
              question: 'Which MongoDB update operator appends an element to an array only if the value does not already exist in the array?',
              code: 'db.users.updateOne({ _id: id }, { ??? : { tags: "react" } });',
              type: 'mcq',
              options: ['$addToSet', '$push', '$set', '$merge'],
              answer: '$addToSet',
              explanation: '$addToSet ensures array uniqueness by appending the value only if it is not already present, whereas $push always appends duplicates.',
              category: 'CRUD Updates',
              order: 1,
            },
          ],
          tasks: [
            {
              id: 't-mongo-2-1-1',
              taskNumber: 1,
              title: 'Perform Atomic Array Updates on User Course Enrollments',
              level: 'Level 2',
              category: 'CRUD Operations',
              description: 'Write an atomic MongoDB update query that adds a completed lesson ID into an array using $addToSet and increments totalScore by 10 using $inc.',
              requirements: [
                'Use db.enrollments.updateOne',
                'Apply $addToSet to completedLessons array',
                'Apply $inc to totalScore',
                'Apply $set to lastActive'
              ],
              example: 'db.enrollments.updateOne({ user: uId }, { $addToSet: { completedLessons: lId }, $inc: { totalScore: 10 } });',
              hints: ['Multiple update operators can be combined in a single update command.'],
              starterCode: `async function markLessonComplete(db, enrollmentId, lessonKey) {\n  // Write atomic update query\n}\n`,
            },
          ],
        },
      ],
    },
    {
      title: 'Aggregation Pipeline Mastery',
      order: 3,
      description: 'Master multistage data transformations: $match, $group, $project, $sort, $unwind, and $lookup joins.',
      lessons: [
        {
          title: 'Pipeline Stages & Cross-Collection $lookup Joins',
          type: 'text',
          duration: '26 mins',
          order: 1,
          content: `### 1. The Aggregation Pipeline Architecture
Documents pass through a sequence of transformation stages like items on an assembly line:

\`\`\`javascript
db.enrollments.aggregate([
  // Stage 1: Filter enrollments completed in 2026
  { $match: { completed: true, enrolledAt: { $gte: new Date('2026-01-01') } } },

  // Stage 2: Join course details from courses collection
  {
    $lookup: {
      from: 'courses',
      localField: 'courseId',
      foreignField: '_id',
      as: 'courseDetails'
    }
  },

  // Stage 3: Flatten joined course array (1:1 relation)
  { $unwind: '$courseDetails' },

  // Stage 4: Group by course category and calculate metrics
  {
    $group: {
      _id: '$courseDetails.category',
      totalCompletions: { $sum: 1 },
      averageScore: { $avg: '$score' },
    }
  },

  // Stage 5: Sort by completions descending
  { $sort: { totalCompletions: -1 } }
]);
\`\`\``,
          notes: `• Always place $match and $sort stages as early as possible in the pipeline to utilize indexes.
• $unwind deconstructs an array field from input documents to output a document for each element.
• $lookup performs left outer joins between collections in MongoDB.`,
          questions: [
            {
              id: 'q-mongo-3-1-1',
              question: 'Why should $match stages be placed at the very beginning of an aggregation pipeline whenever possible?',
              code: 'db.orders.aggregate([{ $match: { status: "shipped" } }, ... ]);',
              type: 'conceptual',
              options: [],
              answer: 'Placing $match first allows MongoDB to use existing indexes to filter down the candidate document set before performing in-memory transformations and grouping.',
              explanation: 'Early filtering drastically reduces the number of documents passed to downstream pipeline stages, preventing memory overflow (100MB RAM stage limit).',
              category: 'Aggregation Optimization',
              order: 1,
            },
          ],
          tasks: [
            {
              id: 't-mongo-3-1-1',
              taskNumber: 1,
              title: 'Build a Category Analytics Aggregation Pipeline',
              level: 'Level 2',
              category: 'Aggregation Pipeline',
              description: 'Construct a MongoDB aggregation query that groups courses by category, calculates the total courses count, and returns the average course price formatted with $project.',
              requirements: [
                'Group by $category with $group',
                'Compute count with { $sum: 1 } and avgPrice with { $avg: "$price" }',
                'Project formatted fields and sort by count descending'
              ],
              example: 'db.courses.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }]);',
              hints: ['Use $sort: { count: -1 } at the end of the pipeline.'],
              starterCode: `async function getCategoryReport(db) {\n  return await db.courses.aggregate([\n    // Write pipeline stages\n  ]).toArray();\n}\n`,
            },
          ],
        },
      ],
    },
    {
      title: 'Schema Design & Data Modeling Patterns',
      order: 4,
      description: 'Choose between embedding and referencing, implement the Subset pattern, and prevent anti-patterns.',
      lessons: [
        {
          title: 'Embedding vs Referencing & Production Schema Patterns',
          type: 'text',
          duration: '24 mins',
          order: 1,
          content: `### 1. The Fundamental Decision Rule
- **Embed when:**
  - Data is viewed together in a single screen query (1:1 or 1:Few relationships).
  - Data does not grow unboundedly (e.g. course topics/lessons, user addresses).
  - You require atomic updates across the parent and children.
- **Reference when:**
  - Data is accessed independently (1:Many or Many:Many relationships).
  - Subdocuments grow unboundedly (e.g. millions of user log events or comments).
  - You need to avoid duplicating frequently mutating data across documents.

---

### 2. The Subset Pattern
Instead of embedding an entire unbounded list of 5,000 reviews inside a product document, embed only the **top 5 most recent reviews** inside the main document, and store the full collection in a separate \`reviews\` collection.`,
          notes: `• The "Unbounded Array" anti-pattern will eventually exceed the 16MB document limit and degrade performance.
• Model your data according to your application's query access patterns, not mathematical tables.
• Use the Subset Pattern for high-performance product / course overview pages.`,
          questions: [
            {
              id: 'q-mongo-4-1-1',
              question: 'In which scenario is referencing strongly preferred over embedding in MongoDB?',
              code: '',
              type: 'mcq',
              options: [
                'When the child array can grow unboundedly (1-to-Millions relationship)',
                'When child data is small and always read with the parent',
                'When maximum read speed is required in a single query',
                'When storing a user street address'
              ],
              answer: 'When the child array can grow unboundedly (1-to-Millions relationship)',
              explanation: 'Unbounded arrays risk breaching the 16MB document size ceiling and degrade BSON serialization performance.',
              category: 'Data Modeling',
              order: 1,
            },
          ],
          tasks: [
            {
              id: 't-mongo-4-1-1',
              taskNumber: 1,
              title: 'Design a Scalable Schema for Courses and Reviews',
              level: 'Level 2',
              category: 'Schema Design',
              description: 'Write Mongoose schema definitions applying the Subset pattern: Course embeds top 3 recent reviews and averageRating, while Review collection stores all historical reviews with courseId reference.',
              requirements: [
                'Define CourseSchema with embedded recentReviews array and averageRating number',
                'Define ReviewSchema with course ObjectId ref: "Course"',
                'Add compound index on ReviewSchema ({ course: 1, createdAt: -1 })'
              ],
              example: 'const CourseSchema = new mongoose.Schema({ recentReviews: [ReviewSubSchema] });',
              hints: ['Create a sub-schema for embedded reviews without _id.'],
              starterCode: `const mongoose = require('mongoose');\n\n// Course Schema with Subset Pattern\nconst CourseSchema = new mongoose.Schema({\n  // Add fields\n});\n`,
            },
          ],
        },
      ],
    },
    {
      title: 'Indexes, Query Optimization & explain()',
      order: 5,
      description: 'Optimize queries with compound indexes, ESR (Equality, Sort, Range) rule, and analyze execution stats.',
      lessons: [
        {
          title: 'Compound Indexes, ESR Rule & executionStats',
          type: 'text',
          duration: '25 mins',
          order: 1,
          content: `### 1. The ESR (Equality, Sort, Range) Indexing Rule
When designing compound indexes to satisfy complex queries, structure index field order as:
1. **Equality (E)**: Exact match filters (\`{ status: "active", category: "Frontend" }\`).
2. **Sort (S)**: Sorting criteria (\`{ score: -1 }\`).
3. **Range (R)**: Inequality comparisons (\`{ price: { $gte: 10, $lte: 50 } }\`).

\`\`\`javascript
// Query:
db.courses.find({ category: "Frontend", price: { $lte: 50 } }).sort({ order: 1 });

// Optimal Compound Index matching ESR:
db.courses.createIndex({ category: 1, order: 1, price: 1 });
\`\`\`

---

### 2. Query Analysis with \`explain("executionStats")\`
Key metrics to inspect in explain output:
- **\`stage\`**: Want **\`IXSCAN\`** (Index Scan); avoid **\`COLLSCAN\`** (Collection Scan / full table scan).
- **\`totalDocsExamined\` vs \`nReturned\`**: An optimal index approaches a 1:1 ratio. If you examine 10,000 documents to return 5, your query is poorly indexed!`,
          notes: `• Follow the ESR rule (Equality -> Sort -> Range) for compound indexes.
• COLLSCAN indicates a full collection scan which destroys database throughput under load.
• Use TTL (Time-To-Live) indexes to auto-delete expired OTPs and session tokens.`,
          questions: [
            {
              id: 'q-mongo-5-1-1',
              question: 'What does a stage of "COLLSCAN" indicate in MongoDB explain("executionStats") output?',
              code: '{ "stage": "COLLSCAN", "totalDocsExamined": 50000, "nReturned": 2 }',
              type: 'mcq',
              options: [
                'A full collection scan where MongoDB had to inspect every document because no index matched the query',
                'A super-fast in-memory cached scan',
                'A collision between two database servers',
                'An index scan using a compound key'
              ],
              answer: 'A full collection scan where MongoDB had to inspect every document because no index matched the query',
              explanation: 'COLLSCAN means MongoDB scanned every document in the collection sequentially. Adding an appropriate index converts it to an efficient IXSCAN.',
              category: 'Indexing & Performance',
              order: 1,
            },
          ],
          tasks: [
            {
              id: 't-mongo-5-1-1',
              taskNumber: 1,
              title: 'Create an ESR-Optimized Compound Index & TTL Index in Mongoose',
              level: 'Level 2',
              category: 'Indexing',
              description: 'Add an ESR-compliant compound index for category and order, plus a TTL index that auto-expires document after 300 seconds (5 minutes) on an OTP collection.',
              requirements: [
                'Add compound index schema.index({ category: 1, order: 1, price: 1 })',
                'Add TTL index schema.index({ createdAt: 1 }, { expireAfterSeconds: 300 })'
              ],
              example: 'otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 300 });',
              hints: ['expireAfterSeconds must be passed as an option object in schema.index().'],
              starterCode: `const mongoose = require('mongoose');\n\nconst otpSchema = new mongoose.Schema({\n  email: String,\n  otp: String,\n  createdAt: { type: Date, default: Date.now }\n});\n\n// Add TTL index\n`,
            },
          ],
        },
      ],
    },
  ],
};
