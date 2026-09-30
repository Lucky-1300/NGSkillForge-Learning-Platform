/**
 * Seed Data: Data Structures & Algorithms (DSA)
 */
module.exports = {
  title: 'Data Structures & Algorithms (DSA)',
  modules: [
    {
      title: 'Asymptotic Analysis & Big-O Notation',
      order: 1,
      description: 'Master time and space complexity analysis, asymptotic bounds (O, Ω, Θ), and algorithmic efficiency tradeoffs.',
      lessons: [
        {
          title: 'Big-O Notation & Complexity Classes',
          type: 'text',
          duration: '22 mins',
          order: 1,
          content: `### 1. The Hierarchy of Time Complexities
Big-O notation describes the upper bound on the growth rate of runtime or memory as input size \`N\` scales toward infinity.

\`\`\`
O(1) < O(log N) < O(N) < O(N log N) < O(N²) < O(2^N) < O(N!)
[Excellent]  ───────────────>  [Fair]  ───────────────>  [Unacceptable]
\`\`\`

| Complexity | Common Algorithms / Operations |
| :--- | :--- |
| **O(1) - Constant** | Hash Map lookup, Array indexing by index, push/pop on stack |
| **O(log N) - Logarithmic** | Binary Search on sorted array, Balanced BST search |
| **O(N) - Linear** | Linear scan, finding max/min in unsorted array |
| **O(N log N) - Linearithmic** | Merge Sort, Quick Sort (average), Heap Sort |
| **O(N²) - Quadratic** | Nested loops, Bubble Sort, Insertion Sort, brute-force pair comparisons |
| **O(2^N) - Exponential** | Naive recursive Fibonacci, generating all power set subsets |

---

### 2. Time vs Space Complexity Analysis
- **Time Complexity**: Number of basic computational operations executed.
- **Auxiliary Space Complexity**: Extra memory allocated by the algorithm (excluding input storage and counting call stack frames).`,
          notes: `• Drop constants and non-dominant lower-order terms: O(3N² + 5N + 100) simplifies to O(N²).
• Binary search cuts search space in half each iteration -> O(log N).
• Recursive calls consume space on the call stack proportional to the maximum recursion depth.`,
          questions: [
            {
              id: 'q-dsa-1-1-1',
              question: 'What is the time complexity of searching for an element in an unsorted array of size N vs a sorted array of size N using Binary Search?',
              code: '',
              type: 'mcq',
              options: [
                'Unsorted: O(N), Sorted Binary Search: O(log N)',
                'Unsorted: O(1), Sorted Binary Search: O(N)',
                'Unsorted: O(N²), Sorted Binary Search: O(N log N)',
                'Both are O(N)'
              ],
              answer: 'Unsorted: O(N), Sorted Binary Search: O(log N)',
              explanation: 'An unsorted array requires checking each element one by one (O(N) linear scan). A sorted array allows Binary Search to divide the search space in half at each comparison (O(log N)).',
              category: 'Complexity Analysis',
              order: 1,
            },
          ],
          tasks: [
            {
              id: 't-dsa-1-1-1',
              taskNumber: 1,
              title: 'Implement Binary Search with O(log N) Time Complexity',
              level: 'Level 1',
              category: 'Searching Algorithms',
              description: 'Write an iterative binary search function that returns the index of a target element in a sorted array, or -1 if not found.',
              requirements: [
                'Maintain low and high pointers',
                'Calculate mid = Math.floor(low + (high - low) / 2) to prevent overflow',
                'Achieve O(log N) time and O(1) space complexity'
              ],
              example: 'binarySearch([1, 3, 5, 7, 9], 7) // Returns 3',
              hints: ['Adjust low = mid + 1 when arr[mid] < target, and high = mid - 1 otherwise.'],
              starterCode: `function binarySearch(arr, target) {\n  let low = 0;\n  let high = arr.length - 1;\n  // Implement binary search loop\n  return -1;\n}\n`,
            },
          ],
        },
      ],
    },
    {
      title: 'Arrays, Strings & Two-Pointer Patterns',
      order: 2,
      description: 'Master in-place array transformations, Two-Pointer technique, and Sliding Window maximum algorithms.',
      lessons: [
        {
          title: 'Two Pointers & Dynamic Sliding Window Patterns',
          type: 'text',
          duration: '25 mins',
          order: 1,
          content: `### 1. The Two-Pointer Technique (Opposite Direction)
Given a sorted array, find if two numbers sum to a target value in \`O(N)\` time and \`O(1)\` space:

\`\`\`javascript
function twoSumSorted(arr, target) {
  let left = 0;
  let right = arr.length - 1;

  while (left < right) {
    const sum = arr[left] + arr[right];
    if (sum === target) {
      return [left, right];
    } else if (sum < target) {
      left++;  // Need a larger sum -> move left pointer right
    } else {
      right--; // Need a smaller sum -> move right pointer left
    }
  }
  return null;
}
\`\`\`

---

### 2. The Sliding Window Pattern
Finding the maximum sum of any contiguous subarray of size \`K\`:

\`\`\`javascript
function maxSubarraySum(arr, k) {
  if (arr.length < k) return null;
  let maxSum = 0;
  let windowSum = 0;

  // Compute sum of first window
  for (let i = 0; i < k; i++) {
    windowSum += arr[i];
  }
  maxSum = windowSum;

  // Slide window across remaining array in O(N)
  for (let i = k; i < arr.length; i++) {
    windowSum += arr[i] - arr[i - k]; // Add incoming element, remove outgoing element
    maxSum = Math.max(maxSum, windowSum);
  }
  return maxSum;
}
\`\`\``,
          notes: `• Two pointers reduce O(N²) brute-force nested loops down to clean O(N) linear scans.
• Sliding Window avoids redundant recalculations by adding the entering element and subtracting the leaving element.
• Both techniques operate with O(1) auxiliary space complexity.`,
          questions: [
            {
              id: 'q-dsa-2-1-1',
              question: 'Why is the sliding window technique more efficient than calculating the sum of every subarray with nested loops?',
              code: 'windowSum += arr[i] - arr[i - k];',
              type: 'conceptual',
              options: [],
              answer: 'It recalculates each new window sum in O(1) time by adding the entering element and subtracting the leaving element, reducing overall runtime from O(N * K) to O(N).',
              explanation: 'Instead of summing all K elements from scratch at each step, sliding window reuses the overlapping K-1 sum.',
              category: 'Array Algorithms',
              order: 1,
            },
          ],
          tasks: [
            {
              id: 't-dsa-2-1-1',
              taskNumber: 1,
              title: 'Find Longest Substring Without Repeating Characters',
              level: 'Level 2',
              category: 'Sliding Window',
              description: 'Implement a function returning the length of the longest contiguous substring without any repeating characters using sliding window and a Map/Set.',
              requirements: [
                'Track characters with a Map or Set',
                'Maintain a sliding window [start, end]',
                'Achieve O(N) time complexity'
              ],
              example: 'lengthOfLongestSubstring("abcabcbb") // Returns 3 ("abc")',
              hints: ['When a duplicate character is encountered, advance the window start pointer past the previous occurrence.'],
              starterCode: `function lengthOfLongestSubstring(s) {\n  let maxLength = 0;\n  let start = 0;\n  const seen = new Map();\n  // Implement sliding window\n  return maxLength;\n}\n`,
            },
          ],
        },
      ],
    },
    {
      title: 'Linked Lists & Cycle Detection',
      order: 3,
      description: 'Master singly and doubly linked list pointer manipulations, in-place list reversal, and Floyd’s Cycle Detection.',
      lessons: [
        {
          title: 'Linked List Reversal & Floyd\'s Tortoise and Hare Algorithm',
          type: 'text',
          duration: '25 mins',
          order: 1,
          content: `### 1. In-Place Singly Linked List Reversal
Reversing pointers in-place with \`O(N)\` time and \`O(1)\` auxiliary space:

\`\`\`javascript
class ListNode {
  constructor(val, next = null) {
    this.val = val;
    this.next = next;
  }
}

function reverseList(head) {
  let prev = null;
  let curr = head;

  while (curr !== null) {
    let nextTemp = curr.next; // Save next pointer
    curr.next = prev;         // Reverse pointer direction
    prev = curr;              // Advance prev
    curr = nextTemp;          // Advance curr
  }
  return prev; // New head of reversed list
}
\`\`\`

---

### 2. Floyd\'s Cycle Detection (Fast & Slow Pointers)
Move \`slow\` pointer 1 step and \`fast\` pointer 2 steps. If a cycle exists, they will inevitably meet inside the loop:

\`\`\`javascript
function hasCycle(head) {
  let slow = head;
  let fast = head;

  while (fast !== null && fast.next !== null) {
    slow = slow.next;
    fast = fast.next.next;

    if (slow === fast) {
      return true; // Loop detected!
    }
  }
  return false; // Reached null termination -> No cycle
}
\`\`\``,
          notes: `• Linked list insertion and deletion at head is O(1), but search is O(N) because nodes are not contiguous in memory.
• Always use a temporary pointer when reversing linked list node links to avoid losing references.
• Floyd's algorithm detects cycles in O(N) time and O(1) memory without a Hash Set.`,
          questions: [
            {
              id: 'q-dsa-3-1-1',
              question: 'In Floyd\'s Cycle Detection Algorithm, what speed do the slow and fast pointers advance at?',
              code: 'slow = slow.next;\nfast = fast.next.next;',
              type: 'mcq',
              options: [
                'Slow moves 1 node per step, Fast moves 2 nodes per step',
                'Slow moves 2 nodes per step, Fast moves 4 nodes per step',
                'Both move at 1 node per step',
                'Fast moves backwards while Slow moves forwards'
              ],
              answer: 'Slow moves 1 node per step, Fast moves 2 nodes per step',
              explanation: 'Advancing fast at 2x speed closes the distance between slow and fast by 1 node in each iteration of a cycle until they collide.',
              category: 'Linked Lists',
              order: 1,
            },
          ],
          tasks: [
            {
              id: 't-dsa-3-1-1',
              taskNumber: 1,
              title: 'Find the Middle Node of a Linked List in One Pass',
              level: 'Level 1',
              category: 'Linked Lists',
              description: 'Implement a function using fast and slow pointers that finds and returns the middle node of a singly linked list in a single traversal.',
              requirements: [
                'Advance slow by 1 step and fast by 2 steps in each iteration',
                'When fast reaches null or fast.next is null, slow is at the middle node',
                'Achieve O(N) time and O(1) auxiliary space'
              ],
              example: '1 -> 2 -> 3 -> 4 -> 5 returns node with val 3',
              hints: ['When fast reaches the end, slow has traversed exactly half the list.'],
              starterCode: `function findMiddleNode(head) {\n  let slow = head;\n  let fast = head;\n  // Traverse with two pointers\n  return slow;\n}\n`,
            },
          ],
        },
      ],
    },
    {
      title: 'Stacks, Queues & Monotonic Patterns',
      order: 4,
      description: 'Master LIFO Stacks, FIFO Queues, matching bracket parsing, and Monotonic Stack Next Greater Element algorithms.',
      lessons: [
        {
          title: 'Stack Parentheses Validation & Monotonic Stacks',
          type: 'text',
          duration: '24 mins',
          order: 1,
          content: `### 1. Valid Parentheses with Stack (LIFO)
\`\`\`javascript
function isValidParentheses(s) {
  const stack = [];
  const bracketMap = { ')': '(', '}': '{', ']': '[' };

  for (const char of s) {
    if (char === '(' || char === '{' || char === '[') {
      stack.push(char);
    } else if (bracketMap[char]) {
      if (stack.length === 0 || stack.pop() !== bracketMap[char]) {
        return false;
      }
    }
  }
  return stack.length === 0;
}
\`\`\`

---

### 2. Monotonic Stack: Next Greater Element in \`O(N)\`
Find the next greater number to the right for every element in an array using a decreasing monotonic stack:

\`\`\`javascript
function nextGreaterElement(nums) {
  const result = new Array(nums.length).fill(-1);
  const stack = []; // Stores indices

  for (let i = 0; i < nums.length; i++) {
    while (stack.length > 0 && nums[i] > nums[stack[stack.length - 1]]) {
      const poppedIndex = stack.pop();
      result[poppedIndex] = nums[i];
    }
    stack.push(i);
  }
  return result;
}
\`\`\``,
          notes: `• Stacks follow Last-In, First-Out (LIFO); Queues follow First-In, First-Out (FIFO).
• Monotonic stacks maintain elements in strictly sorted order (increasing or decreasing).
• Monotonic stacks solve Next Greater / Previous Smaller element problems in linear O(N) time.`,
          questions: [
            {
              id: 'q-dsa-4-1-1',
              question: 'What is the runtime of nextGreaterElement on an array of length N when implemented with a Monotonic Stack?',
              code: 'nextGreaterElement([2, 1, 2, 4, 3]) // [4, 2, 4, -1, -1]',
              type: 'mcq',
              options: ['O(N) Linear Time', 'O(N²) Quadratic Time', 'O(N log N)', 'O(1)'],
              answer: 'O(N) Linear Time',
              explanation: 'Even though there is a while loop inside the for loop, each element is pushed to and popped from the stack at most once, yielding an amortized O(N) runtime.',
              category: 'Monotonic Stack',
              order: 1,
            },
          ],
          tasks: [
            {
              id: 't-dsa-4-1-1',
              taskNumber: 1,
              title: 'Implement a MinStack with O(1) getMin()',
              level: 'Level 2',
              category: 'Stack Architecture',
              description: 'Design a MinStack class supporting push(val), pop(), top(), and getMin() operations, each operating in strict O(1) constant time.',
              requirements: [
                'Implement push, pop, top, and getMin methods',
                'Ensure all methods run in O(1) time',
                'Maintain an auxiliary stack tracking minimum values'
              ],
              example: 'const minStack = new MinStack(); minStack.push(-2); minStack.push(0); minStack.getMin(); // -2',
              hints: ['Push to the minTracker stack whenever val <= currentMin.'],
              starterCode: `class MinStack {\n  constructor() {\n    this.stack = [];\n    this.minStack = [];\n  }\n  push(val) {}\n  pop() {}\n  top() {}\n  getMin() {}\n}\n`,
            },
          ],
        },
      ],
    },
    {
      title: 'Trees, BSTs & Binary Tree Traversals',
      order: 5,
      description: 'Master binary tree representations, Depth-First (Pre/In/Post) traversals, Breadth-First Level-Order, and BST operations.',
      lessons: [
        {
          title: 'Tree Traversals (DFS & BFS) & BST Operations',
          type: 'text',
          duration: '26 mins',
          order: 1,
          content: `### 1. Depth-First Traversals (DFS)
\`\`\`javascript
class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

// Inorder Traversal (Left -> Root -> Right)
// *Note*: Inorder traversal of a Binary Search Tree (BST) visits nodes in strictly SORTED ascending order!
function inorder(root, result = []) {
  if (!root) return result;
  inorder(root.left, result);
  result.push(root.val);
  inorder(root.right, result);
  return result;
}
\`\`\`

---

### 2. Breadth-First Search (BFS / Level-Order Traversal)
Using a Queue to traverse tree levels row by row:

\`\`\`javascript
function levelOrder(root) {
  if (!root) return [];
  const result = [];
  const queue = [root];

  while (queue.length > 0) {
    const levelSize = queue.length;
    const currentLevel = [];

    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift();
      currentLevel.push(node.val);

      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    result.push(currentLevel);
  }
  return result;
}
\`\`\``,
          notes: `• Inorder traversal on a BST yields elements in strictly ascending sorted order.
• Level-Order traversal uses a FIFO queue to visit nodes level-by-level (BFS).
• Validating a BST requires checking that every node satisfies min < node.val < max range bounds.`,
          questions: [
            {
              id: 'q-dsa-5-1-1',
              question: 'Which tree traversal produces values in sorted ascending order when executed on a Binary Search Tree (BST)?',
              code: '',
              type: 'mcq',
              options: ['Inorder (Left -> Root -> Right)', 'Preorder (Root -> Left -> Right)', 'Postorder (Left -> Right -> Root)', 'Level-Order BFS'],
              answer: 'Inorder (Left -> Root -> Right)',
              explanation: 'Because a BST places smaller values to the left and larger values to the right, visiting Left then Root then Right guarantees sorted output.',
              category: 'Tree Traversals',
              order: 1,
            },
          ],
          tasks: [
            {
              id: 't-dsa-5-1-1',
              taskNumber: 1,
              title: 'Validate Binary Search Tree (BST) Validity',
              level: 'Level 2',
              category: 'Trees',
              description: 'Implement a function that checks whether a given binary tree is a valid Binary Search Tree using min/max range boundaries.',
              requirements: [
                'Define helper function isValidBST(node, min, max)',
                'Return false if node.val <= min or node.val >= max',
                'Recursively check left child with (node.left, min, node.val) and right child with (node.right, node.val, max)'
              ],
              example: 'isValidBST(root) // Returns true or false',
              hints: ['Pass -Infinity and +Infinity as initial min and max bounds.'],
              starterCode: `function isValidBST(root, min = -Infinity, max = Infinity) {\n  if (!root) return true;\n  // Check bounds and recurse\n}\n`,
            },
          ],
        },
      ],
    },
    {
      title: 'Dynamic Programming & Classic Algorithms',
      order: 6,
      description: 'Master Memoization (Top-Down), Tabulation (Bottom-Up), and classic DP problems (Climbing Stairs, Coin Change, 0/1 Knapsack).',
      lessons: [
        {
          title: 'Top-Down Memoization vs Bottom-Up Tabulation',
          type: 'text',
          duration: '28 mins',
          order: 1,
          content: `### 1. When to Use Dynamic Programming
Dynamic Programming applies when a problem exhibits:
1. **Overlapping Subproblems**: The same subproblems are solved repeatedly (e.g. recursive Fibonacci recalculating \`fib(3)\` thousands of times).
2. **Optimal Substructure**: The optimal solution to the overall problem can be constructed from optimal solutions to its subproblems.

---

### 2. Coin Change Problem (Bottom-Up Tabulation)
Given coin denominations and an amount, find the minimum number of coins needed:

\`\`\`javascript
function coinChange(coins, amount) {
  // dp[i] represents minimum coins needed to make amount i
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0; // Base case: 0 coins needed for amount 0

  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (i - coin >= 0) {
        dp[i] = Math.min(dp[i], 1 + dp[i - coin]);
      }
    }
  }

  return dp[amount] === Infinity ? -1 : dp[amount];
}
\`\`\``,
          notes: `• Top-Down (Memoization) uses recursion + hash table / array cache.
• Bottom-Up (Tabulation) uses an iterative loop to fill a DP table from base cases upward.
• Tabulation avoids call stack overflow on large inputs and allows space optimization.`,
          questions: [
            {
              id: 'q-dsa-6-1-1',
              question: 'What are the two core conditions required to apply Dynamic Programming to an algorithmic problem?',
              code: '',
              type: 'mcq',
              options: [
                'Overlapping Subproblems and Optimal Substructure',
                'Sorted Array Input and Binary Tree Structure',
                'Linear Space and Single-Threaded Runtime',
                'Greedy Choice Property and Tail Recursion'
              ],
              answer: 'Overlapping Subproblems and Optimal Substructure',
              explanation: 'Overlapping subproblems allow caching to eliminate repeated work, and optimal substructure guarantees global optimality from subproblem solutions.',
              category: 'Dynamic Programming',
              order: 1,
            },
          ],
          tasks: [
            {
              id: 't-dsa-6-1-1',
              taskNumber: 1,
              title: 'Solve Climbing Stairs with O(N) Time and O(1) Space',
              level: 'Level 1',
              category: 'Dynamic Programming',
              description: 'You are climbing a staircase with n steps. Each time you can climb 1 or 2 steps. In how many distinct ways can you climb to the top? Solve in O(N) time and O(1) space.',
              requirements: [
                'Handle base cases n <= 2',
                'Iteratively calculate ways using two rolling variables (a, b)',
                'Achieve O(N) time and O(1) space'
              ],
              example: 'climbStairs(3) // 3 (1+1+1, 1+2, 2+1)',
              hints: ['This problem follows the Fibonacci recurrence: dp[i] = dp[i-1] + dp[i-2].'],
              starterCode: `function climbStairs(n) {\n  if (n <= 2) return n;\n  let prev2 = 1;\n  let prev1 = 2;\n  // Implement O(1) space loop\n  return prev1;\n}\n`,
            },
          ],
        },
      ],
    },
  ],
};
