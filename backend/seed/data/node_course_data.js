/**
 * Seed Data: Node.js API Engineering
 */
module.exports = {
  title: 'Node.js API Engineering',
  modules: [
    {
      title: 'Node.js Architecture & V8 Runtime',
      order: 1,
      description: 'Master the Libuv event loop phases, non-blocking asynchronous I/O, process globals, and execution cycles.',
      lessons: [
        {
          title: 'Event Loop Phases, Libuv & Non-Blocking I/O',
          type: 'text',
          duration: '22 mins',
          order: 1,
          content: `### 1. The Single-Threaded Event Loop & Libuv
Node.js uses Google V8 engine for JavaScript execution and **Libuv** (a C library) to handle asynchronous I/O operations through a background worker thread pool and OS kernel mechanisms.

\`\`\`
   ┌───────────────────────────┐
┌─>│          timers           │ (setTimeout, setInterval)
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │     pending callbacks     │ (I/O callbacks deferred)
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │        idle, prepare      │ (internal use)
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │           poll            │ (retrieve new I/O events)
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │           check           │ (setImmediate callbacks)
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
└──┤      close callbacks      │ (socket.on('close'))
   └───────────────────────────┘
\`\`\`

---

### 2. Microtasks: \`process.nextTick()\` vs \`Promise.then()\`
Microtasks execute immediately after the current operation finishes, before the event loop advances to the next phase:
1. **\`process.nextTick()\` queue** (highest priority microtask).
2. **Promise microtask queue** (\`Promise.then / catch / finally\`, \`queueMicrotask\`).`,
          notes: `• Node.js JavaScript execution is single-threaded, but I/O operations are offloaded to Libuv.
• process.nextTick() executes ahead of Promise microtasks and ahead of the next event loop phase.
• Never perform CPU-blocking operations (heavy encryption, large JSON parsing) on the main thread.`,
          questions: [
            {
              id: 'q-node-1-1-1',
              question: 'What is the console output order of the following Node.js code snippet?',
              code: 'console.log("1");\nsetTimeout(() => console.log("2"), 0);\nprocess.nextTick(() => console.log("3"));\nPromise.resolve().then(() => console.log("4"));\nconsole.log("5");',
              type: 'output',
              options: [],
              answer: '1, 5, 3, 4, 2',
              explanation: 'Synchronous logs 1 and 5 run first. Then microtasks drain: process.nextTick (3) runs before Promise (4). Finally, the timer phase executes (2).',
              category: 'Event Loop',
              order: 1,
            },
          ],
          tasks: [
            {
              id: 't-node-1-1-1',
              taskNumber: 1,
              title: 'Benchmark Synchronous vs Asynchronous File Operations',
              level: 'Level 2',
              category: 'Async I/O',
              description: 'Write a Node.js script comparing execution time of fs.readFileSync vs fs.promises.readFile using process.hrtime.bigint().',
              requirements: [
                'Import fs and fs/promises',
                'Measure high-resolution nanosecond timestamps before and after reads',
                'Log non-blocking event loop execution during async read'
              ],
              example: 'const start = process.hrtime.bigint(); ... const duration = process.hrtime.bigint() - start;',
              hints: ['Use process.hrtime.bigint() for precise nanosecond measurement.'],
              starterCode: `const fs = require('fs');\nconst fsp = require('fs/promises');\n\nasync function runBenchmark() {\n  // Implement benchmark\n}\nrunBenchmark();\n`,
            },
          ],
        },
      ],
    },
    {
      title: 'Core Modules & Event-Driven Architecture',
      order: 2,
      description: 'Master fs/promises, path manipulation, EventEmitter patterns, and event-driven microservices.',
      lessons: [
        {
          title: 'File System (fs), Path & EventEmitter Pattern',
          type: 'text',
          duration: '24 mins',
          order: 1,
          content: `### 1. Robust File System Management with \`fs/promises\`
\`\`\`javascript
const fsp = require('fs/promises');
const path = require('path');

async function manageConfig() {
  const filePath = path.join(__dirname, 'config', 'app.json');

  try {
    const rawData = await fsp.readFile(filePath, 'utf-8');
    const config = JSON.parse(rawData);
    config.lastLoaded = new Date().toISOString();

    await fsp.writeFile(filePath, JSON.stringify(config, null, 2), 'utf-8');
    console.log('Config updated successfully');
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error('Config file not found:', filePath);
    } else {
      console.error('File operation failed:', error.message);
    }
  }
}
\`\`\`

---

### 2. Custom Event-Driven Services with \`EventEmitter\`
\`\`\`javascript
const { EventEmitter } = require('events');

class OrderService extends EventEmitter {
  async createOrder(orderData) {
    console.log('Persisting order to database...');
    // Emit business events decoupled from notification/email logic
    this.emit('order:created', orderData);
  }
}

const orderService = new OrderService();

// Event Listener 1: Send confirmation email
orderService.on('order:created', (order) => {
  console.log(\`Sending receipt email to \${order.customerEmail}\`);
});

// Event Listener 2: Update inventory analytics
orderService.on('order:created', (order) => {
  console.log(\`Deducting item \${order.itemId} from inventory\`);
});
\`\`\``,
          notes: `• Always use path.join() instead of string concatenation to handle OS-specific path separators (/ vs \\).
• EventEmitter allows building decoupled, scalable event-driven architectures.
• Handle the 'error' event on EventEmitters to avoid crashing the Node process.`,
          questions: [
            {
              id: 'q-node-2-1-1',
              question: 'What happens in Node.js if an EventEmitter emits an "error" event and no listener is registered for "error"?',
              code: 'const emitter = new EventEmitter();\nemitter.emit("error", new Error("Boom"));',
              type: 'mcq',
              options: [
                'Node.js throws an unhandled exception, prints the stack trace, and crashes the process',
                'Node.js silently ignores the error',
                'The error is automatically sent to the browser console',
                'The event loop skips the current phase and continues'
              ],
              answer: 'Node.js throws an unhandled exception, prints the stack trace, and crashes the process',
              explanation: 'EventEmitter treats error events specially. If no listener exists, an UnhandledException is thrown and terminates the process.',
              category: 'EventEmitter',
              order: 1,
            },
          ],
          tasks: [
            {
              id: 't-node-2-1-1',
              taskNumber: 1,
              title: 'Build a Decoupled User Registration EventEmitter Service',
              level: 'Level 2',
              category: 'Event Architecture',
              description: 'Create a UserService extending EventEmitter that emits "user:registered", and attach separate listeners for welcome email, analytics logging, and audit tracking.',
              requirements: [
                'Extend EventEmitter in a UserService class',
                'Register at least 2 distinct listeners on "user:registered"',
                'Handle error cases with an "error" event listener'
              ],
              example: 'class UserService extends EventEmitter { ... }',
              hints: ['Call this.emit("user:registered", user) inside registerUser method.'],
              starterCode: `const { EventEmitter } = require('events');\n\nclass UserService extends EventEmitter {\n  // Implement service\n}\n`,
            },
          ],
        },
      ],
    },
    {
      title: 'Streams, Buffers & Memory Efficiency',
      order: 3,
      description: 'Process gigabyte-scale files and network data using Buffers, Readable/Writable streams, and pipeline transforms.',
      lessons: [
        {
          title: 'Buffers, Streams & pipeline Backpressure',
          type: 'text',
          duration: '25 mins',
          order: 1,
          content: `### 1. Why Streams Matter
Loading a 2GB file into memory with \`fs.readFile()\` crashes the Node.js process with an **Out of Memory (OOM)** error. Streams process data chunk-by-chunk with a tiny constant memory footprint (e.g. 64KB per chunk).

\`\`\`javascript
const fs = require('fs');
const zlib = require('zlib');
const { pipeline } = require('stream/promises');

async function compressLogFile(sourcePath, destPath) {
  try {
    await pipeline(
      fs.createReadStream(sourcePath), // Readable Stream
      zlib.createGzip(),              // Transform Stream
      fs.createWriteStream(destPath)  // Writable Stream
    );
    console.log('Stream pipeline completed with zero memory overflow!');
  } catch (error) {
    console.error('Pipeline failed:', error.message);
  }
}
\`\`\`

---

### 2. Backpressure Explained
Backpressure occurs when a Writable stream cannot write data as fast as a Readable stream emits it. \`stream.pipeline()\` automatically pauses and resumes the readable stream, preventing memory buffer exhaustion.`,
          notes: `• Always use stream/promises pipeline() instead of manual .pipe() to safely handle errors and stream cleanup.
• Buffers represent raw chunks of fixed memory allocated outside the V8 heap.
• Streams are ideal for audio/video streaming, file transformations, and CSV exports.`,
          questions: [
            {
              id: 'q-node-3-1-1',
              question: 'Why is stream.pipeline preferred over readable.pipe(writable)?',
              code: 'pipeline(readable, transform, writable, (err) => { ... });',
              type: 'conceptual',
              options: [],
              answer: 'pipeline properly closes all streams and cleans up file descriptors if an error occurs at any stage, whereas .pipe() leaves dangling stream leaks on errors.',
              explanation: 'Manual .pipe() chains do not forward error events down the pipeline, causing unhandled errors and memory leaks when streams fail midway.',
              category: 'Streams',
              order: 1,
            },
          ],
          tasks: [
            {
              id: 't-node-3-1-1',
              taskNumber: 1,
              title: 'Build a Streaming File Transformer Pipeline',
              level: 'Level 2',
              category: 'Streams',
              description: 'Create a Node.js script using Transform stream and pipeline() that reads a text file, converts all text to uppercase in real-time chunks, and writes to an output file.',
              requirements: [
                'Use { Transform } from "stream"',
                'Implement _transform(chunk, encoding, callback)',
                'Use stream/promises pipeline() to execute the pipeline'
              ],
              example: 'const upperCaseTransform = new Transform({ transform(chunk, enc, cb) { cb(null, chunk.toString().toUpperCase()); } });',
              hints: ['Convert chunk buffer to string with chunk.toString().'],
              starterCode: `const fs = require('fs');\nconst { Transform } = require('stream');\nconst { pipeline } = require('stream/promises');\n\n// Build uppercase transform stream pipeline\n`,
            },
          ],
        },
      ],
    },
    {
      title: 'HTTP Server from Scratch & Request Lifecycle',
      order: 4,
      description: 'Construct robust native HTTP servers, parse request headers, handle streaming request bodies, and implement CORS.',
      lessons: [
        {
          title: 'Native http.createServer & Request Body Chunking',
          type: 'text',
          duration: '22 mins',
          order: 1,
          content: `### 1. Building an HTTP Server Without Frameworks
Understanding native \`http.createServer()\` gives you deep insight into how frameworks like Express work under the hood.

\`\`\`javascript
const http = require('http');
const url = require('url');

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const { pathname, query } = parsedUrl;
  const method = req.method.toUpperCase();

  // Set standard headers
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (pathname === '/api/health' && method === 'GET') {
    res.writeHead(200);
    return res.end(JSON.stringify({ status: 'healthy', timestamp: Date.now() }));
  }

  if (pathname === '/api/echo' && method === 'POST') {
    let bodyChunks = [];
    
    req.on('data', (chunk) => {
      bodyChunks.push(chunk);
    });

    req.on('end', () => {
      const rawBody = Buffer.concat(bodyChunks).toString();
      try {
        const parsedBody = JSON.parse(rawBody);
        res.writeHead(200);
        res.end(JSON.stringify({ received: parsedBody }));
      } catch (err) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
      }
    });
    return;
  }

  // 404 Fallback
  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Route not found' }));
});

server.listen(4000, () => {
  console.log('Native HTTP server running on port 4000');
});
\`\`\``,
          notes: `• req is a Readable stream emitting 'data' and 'end' events.
• res is a Writable stream where you write status codes, headers, and payload data.
• Always handle JSON parsing errors inside try/catch when assembling request body chunks.`,
          questions: [
            {
              id: 'q-node-4-1-1',
              question: 'Why do we need to listen for req.on("data") and req.on("end") to read a POST request body in native Node.js http server?',
              code: 'req.on("data", chunk => ...);\nreq.on("end", () => ...);',
              type: 'conceptual',
              options: [],
              answer: 'Because the incoming HTTP request is a readable stream transmitting data across network TCP packets in chunks rather than as a single synchronous string.',
              explanation: 'Streaming allows Node to handle large request bodies efficiently without blocking memory or waiting for the complete payload before initializing the handler.',
              category: 'HTTP Lifecycle',
              order: 1,
            },
          ],
          tasks: [
            {
              id: 't-node-4-1-1',
              taskNumber: 1,
              title: 'Build a Native Micro-Router HTTP Server',
              level: 'Level 2',
              category: 'HTTP Servers',
              description: 'Construct a native http.createServer with support for GET /status, POST /messages (reading JSON chunks), and custom 404 responses with JSON content-type.',
              requirements: [
                'Create server with http.createServer',
                'Route GET /status returning { uptime: process.uptime() }',
                'Route POST /messages accumulating chunks and echoing message back',
                'Return 404 for undefined routes'
              ],
              example: 'res.writeHead(200, { "Content-Type": "application/json" });',
              hints: ['Use Buffer.concat(chunks).toString() in the end event handler.'],
              starterCode: `const http = require('http');\n\nconst server = http.createServer((req, res) => {\n  // Implement router and chunk parser\n});\n\nserver.listen(5000);\n`,
            },
          ],
        },
      ],
    },
  ],
};
