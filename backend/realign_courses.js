require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');
const Course = require('./models/course.model');

const roadmap = [
  {
    title: 'HTML5 Foundations',
    description: 'Learn modern semantic HTML5, accessible markup, document structure, forms, tables, media elements, and SEO best practices.',
    instructor: 'Elena Vance',
    price: 0,
    thumbnail: '',
    category: 'Frontend',
    level: 'Beginner',
    duration: '4 weeks',
    order: 1,
  },
  {
    title: 'CSS3 & Modern Layouts',
    description: 'Master modern styling with CSS3 Flexbox, Grid, custom properties, animations, transitions, and responsive mobile-first design.',
    instructor: 'Sarah Jenkins',
    price: 0,
    thumbnail: '',
    category: 'Frontend',
    level: 'Beginner',
    duration: '5 weeks',
    order: 2,
  },
  {
    title: 'JavaScript Foundations',
    description: 'Build a strong JavaScript foundation through hands-on exercises covering syntax, functions, arrays, objects, and modern browser APIs.',
    instructor: 'Maya Okafor',
    price: 0,
    thumbnail: '',
    category: 'Frontend',
    level: 'Beginner',
    duration: '6 weeks',
    order: 3,
  },
  {
    title: 'React Interface Workshop',
    description: 'Create responsive React interfaces with reusable components, state management, API integration, and practical accessibility patterns.',
    instructor: 'Daniel Mensah',
    price: 0,
    thumbnail: '',
    category: 'Frontend',
    level: 'Intermediate',
    duration: '8 weeks',
    order: 4,
  },
  {
    title: 'Node.js API Engineering',
    description: 'Design production-minded REST APIs with Node.js, asynchronous programming, streams, file systems, and server architecture.',
    instructor: 'Aisha Bello',
    price: 0,
    thumbnail: '',
    category: 'Backend',
    level: 'Intermediate',
    duration: '8 weeks',
    order: 5,
  },
  {
    title: 'Express.js Framework & REST APIs',
    description: 'Build high-performance web servers with Express.js, routing, middleware architectures, request validation, and JWT security.',
    instructor: 'Aisha Bello',
    price: 0,
    thumbnail: '',
    category: 'Backend',
    level: 'Intermediate',
    duration: '6 weeks',
    order: 6,
  },
  {
    title: 'Artificial Intelligence & Machine Learning',
    description: 'Explore core machine learning concepts, neural networks, supervised and unsupervised algorithms, and generative AI using Python.',
    instructor: 'Dr. Marcus Chen',
    price: 0,
    thumbnail: '',
    category: 'AI & ML',
    level: 'Intermediate',
    duration: '10 weeks',
    order: 7,
  },
  {
    title: 'MongoDB Data Modeling',
    description: 'Learn how to model document data, write effective queries, create indexes, and structure MongoDB collections for growing applications.',
    instructor: 'Chinedu Eze',
    price: 0,
    thumbnail: '',
    category: 'Database',
    level: 'Intermediate',
    duration: '5 weeks',
    order: 8,
  },
  {
    title: 'Git and Collaborative Development',
    description: 'Work confidently with Git branches, pull requests, code reviews, merge conflict resolution, and team-friendly commit practices.',
    instructor: 'Tara Williams',
    price: 0,
    thumbnail: '',
    category: 'Tools',
    level: 'Beginner',
    duration: '3 weeks',
    order: 9,
  },
  {
    title: 'Full-Stack Project Lab',
    description: 'Bring your skills together by planning, building, testing, and deploying a complete learning platform with a React frontend and Node.js backend.',
    instructor: 'Ibrahim Yusuf',
    price: 0,
    thumbnail: '',
    category: 'Full Stack',
    level: 'Advanced',
    duration: '10 weeks',
    order: 10,
  },
];

async function alignCourses() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    for (const c of roadmap) {
      const existing = await Course.findOne({ title: c.title });
      if (!existing) {
        await Course.create(c);
        console.log(`Created course: [${c.order}] ${c.title}`);
      } else {
        await Course.updateOne({ _id: existing._id }, { $set: { ...c } });
        console.log(`Updated course order: [${c.order}] ${c.title}`);
      }
    }

    const sortedList = await Course.find({}).sort({ order: 1 });
    console.log('\n--- ALIGNED COURSES SEQUENCE IN DB ---');
    sortedList.forEach((c) => {
      console.log(`${c.order}. ${c.title} (${c.category}) - Price: $${c.price}`);
    });

    await mongoose.disconnect();
    console.log('\nAlignment completed successfully.');
  } catch (err) {
    console.error('Error during alignment:', err);
    process.exit(1);
  }
}

alignCourses();
