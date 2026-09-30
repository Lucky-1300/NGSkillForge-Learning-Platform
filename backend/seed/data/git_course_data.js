/**
 * Seed Data: Git and Collaborative Development
 */
module.exports = {
  title: 'Git and Collaborative Development',
  modules: [
    {
      title: 'Git Architecture & Local Repositories',
      order: 1,
      description: 'Master the Git Three Trees architecture, DAG commit history, staging area, and local command workflow.',
      lessons: [
        {
          title: 'The Three Trees of Git & Local Commit Lifecycle',
          type: 'text',
          duration: '18 mins',
          order: 1,
          content: `### 1. The Three Trees of Git
Git manages code across 3 distinct architectural areas:
1. **Working Directory**: The actual sandbox files on your local filesystem that you edit.
2. **Staging Area (Index)**: The snapshot preparation zone where changes are gathered with \`git add\`.
3. **Repository (Commit History DAG)**: The permanent database of cryptographically hashed commit snapshots (\`.git\` directory).

\`\`\`
[ Working Directory ]  ── git add ──>  [ Staging Area (Index) ]  ── git commit ──>  [ Git Repository (HEAD) ]
\`\`\`

---

### 2. Essential Local Commands
\`\`\`bash
# Initialize a new Git repository
git init

# Stage specific files or entire directory
git add src/app.js
git add .

# Create a permanent commit snapshot with descriptive message
git commit -m "feat(auth): implement JWT token verification middleware"

# Inspect repository status & visual commit graph
git status
git log --oneline --graph --all
\`\`\``,
          notes: `• Git stores full snapshots of your files at each commit, not simple delta diffs.
• Commits are identified by SHA-1 (40-character hex string) hashes.
• Always write clear, imperative commit messages (e.g. "feat: add user login" instead of "fixed stuff").`,
          questions: [
            {
              id: 'q-git-1-1-1',
              question: 'Which Git command moves modified files from the Working Directory into the Staging Area (Index)?',
              code: 'git ??? <filename>',
              type: 'mcq',
              options: ['git add', 'git commit', 'git push', 'git checkout'],
              answer: 'git add',
              explanation: 'git add stages working directory modifications, preparing them to be committed in the next commit snapshot.',
              category: 'Git Workflow',
              order: 1,
            },
          ],
          tasks: [
            {
              id: 't-git-1-1-1',
              taskNumber: 1,
              title: 'Initialize a Git Repository with Proper .gitignore',
              level: 'Level 1',
              category: 'Setup & Staging',
              description: 'Write the sequence of Git CLI commands and .gitignore file contents to initialize a repo, ignore node_modules and .env, and make an initial commit.',
              requirements: [
                'Create .gitignore containing node_modules and .env',
                'Run git init, git add ., and git commit -m "Initial commit"'
              ],
              example: 'node_modules/\n.env\n.DS_Store',
              hints: ['Never commit sensitive .env files to Git repositories.'],
              starterCode: `# Write the terminal commands and .gitignore file rules\n`,
            },
          ],
        },
      ],
    },
    {
      title: 'Branching, Merging & Remote Collaboration',
      order: 2,
      description: 'Master branch pointers, Fast-Forward vs 3-way merges, remote tracking, and GitHub Pull Request workflows.',
      lessons: [
        {
          title: 'Branch Pointers, Fast-Forward Merges & PR Workflows',
          type: 'text',
          duration: '22 mins',
          order: 1,
          content: `### 1. What is a Git Branch?
In Git, a branch is simply a **lightweight 41-byte movable pointer** to a specific commit hash. Creating a branch is instantaneous (\`O(1)\`).

\`\`\`bash
# Create and switch to a new feature branch
git switch -c feature/course-catalog
# (Legacy equivalent: git checkout -b feature/course-catalog)

# Merge feature branch back into main
git switch main
git merge feature/course-catalog
\`\`\`

---

### 2. Fast-Forward vs 3-Way Merge Commits
- **Fast-Forward Merge**: If the target branch has received NO new commits since the feature branch diverged, Git simply moves the branch pointer forward without creating an extra merge commit.
- **3-Way Merge (True Merge)**: If both branches have new commits, Git creates a new **merge commit** with two parent commits.

---

### 3. Remote Tracking & Upstream Syncing
\`\`\`bash
# Add remote origin
git remote add origin https://github.com/org/learning-platform.git

# Push branch and set upstream tracking
git push -u origin feature/course-catalog

# Fetch and integrate remote updates
git fetch origin
git pull origin main # (Fetches and merges)
\`\`\``,
          notes: `• Use git switch and git restore (introduced in Git 2.23) for cleaner branch and file operations.
• git pull is a combination of git fetch followed by git merge.
• A branch is merely a reference to a commit object in the .git/refs/heads directory.`,
          questions: [
            {
              id: 'q-git-2-1-1',
              question: 'When does Git perform a Fast-Forward merge instead of creating a 3-way merge commit?',
              code: 'git merge feature-branch',
              type: 'conceptual',
              options: [],
              answer: 'When the target branch has no new commits since the feature branch was branched off from it, allowing Git to simply advance the pointer.',
              explanation: 'Because there is a direct linear history with no divergent commits on the target branch, no conflict resolution or new merge commit node is required.',
              category: 'Branching & Merging',
              order: 1,
            },
          ],
          tasks: [
            {
              id: 't-git-2-1-1',
              taskNumber: 1,
              title: 'Execute a Feature Branch & GitHub Pull Request Flow',
              level: 'Level 1',
              category: 'Branching',
              description: 'List the exact Git commands to create a feature branch, commit changes, push with upstream tracking, and switch back to main.',
              requirements: [
                'Create branch with git switch -c feature/auth',
                'Stage and commit changes',
                'Push to origin with git push -u origin feature/auth'
              ],
              example: 'git switch -c feature/auth\ngit add .\ngit commit -m "feat: login"\ngit push -u origin feature/auth',
              hints: ['-u sets the upstream remote branch for future git push and git pull commands.'],
              starterCode: `# Write the complete CLI flow\n`,
            },
          ],
        },
      ],
    },
    {
      title: 'Conflict Resolution, Rebasing & Undoing Changes',
      order: 3,
      description: 'Resolve merge conflicts step-by-step, maintain linear history with git rebase, and recover lost commits with git reflog.',
      lessons: [
        {
          title: 'Merge Conflicts, Interactive Rebase & Disaster Recovery',
          type: 'text',
          duration: '25 mins',
          order: 1,
          content: `### 1. Understanding & Resolving Merge Conflicts
When two branches modify the exact same lines of code in different ways, Git halts the merge and inserts conflict markers:

\`\`\`javascript
<<<<<<< HEAD (Current Branch / main)
const API_URL = "https://api.ngskillforge.com";
=======
const API_URL = process.env.VITE_API_URL || "http://localhost:5000";
>>>>>>> feature/env-config (Incoming Branch)
\`\`\`

**Resolution Steps:**
1. Manually edit the file to preserve the correct merged code and remove conflict marker lines (\`<<<<<<<\`, \`=======\`, \`>>>>>>>\`).
2. Stage the resolved file: \`git add <filename>\`.
3. Complete the merge: \`git commit\`.

---

### 2. Git Rebase vs Git Merge
- **\`git merge\`**: Preserves the complete non-linear historical branch graph and creates a merge commit.
- **\`git rebase\`**: Rewrites commit history by replaying your feature commits on top of the latest \`main\` base commit, creating a clean, perfectly linear commit history.

\`\`\`bash
# Interactive Rebase (Squashing last 3 messy commits into 1 clean commit)
git rebase -i HEAD~3
\`\`\`

---

### 3. Disaster Recovery with \`git reflog\`
\`git reflog\` logs every time HEAD moves (commits, checkouts, resets, rebases). Even if you accidentally run \`git reset --hard\`, your commits exist in the reflog for up to 90 days!

\`\`\`bash
# Find the lost commit SHA from reflog
git reflog

# Recover lost state
git reset --hard HEAD@{2}
\`\`\``,
          notes: `• Golden Rule of Rebasing: Never rebase commits that have been pushed to a shared public branch!
• git reset --soft moves HEAD without modifying staging or working files.
• git reset --hard discards all uncommitted working changes permanently.
• git reflog is your safety net for recovering "deleted" commits or broken merges.`,
          questions: [
            {
              id: 'q-git-3-1-1',
              question: 'What is the Golden Rule of Git Rebasing?',
              code: 'git rebase main',
              type: 'mcq',
              options: [
                'Never rebase commits that have been pushed to a shared public repository or branch used by others',
                'Never rebase on a local feature branch',
                'Rebasing is only allowed on Fridays',
                'You must always delete your repository after rebasing'
              ],
              answer: 'Never rebase commits that have been pushed to a shared public repository or branch used by others',
              explanation: 'Rebasing rewrites commit SHA hashes. If other developers have already based work on the old commits, rewriting history creates severe divergence and merge nightmares.',
              category: 'Rebasing',
              order: 1,
            },
          ],
          tasks: [
            {
              id: 't-git-3-1-1',
              taskNumber: 1,
              title: 'Recover from an Accidental Hard Reset Using Git Reflog',
              level: 'Level 2',
              category: 'Disaster Recovery',
              description: 'Document the step-by-step commands to locate a lost commit in git reflog and restore the branch back to that commit.',
              requirements: [
                'Inspect history using git reflog',
                'Restore branch pointer using git reset --hard HEAD@{n} or commit SHA'
              ],
              example: 'git reflog\ngit reset --hard abc1234',
              hints: ['git reflog tracks every HEAD movement including hard resets.'],
              starterCode: `# Write reflog recovery steps\n`,
            },
          ],
        },
      ],
    },
  ],
};
