/**
 * Seed Data: Artificial Intelligence & Machine Learning
 */
module.exports = {
  title: 'Artificial Intelligence & Machine Learning',
  modules: [
    {
      title: 'Introduction to AI, ML & Python Data Stack',
      order: 1,
      description: 'Understand the AI/ML landscape, types of learning, NumPy vectorized arrays, and Pandas DataFrames.',
      lessons: [
        {
          title: 'Machine Learning Paradigms & Python Foundations',
          type: 'text',
          duration: '22 mins',
          order: 1,
          content: `### 1. The 3 Primary Machine Learning Paradigms
- **Supervised Learning**: Training models on labeled data \`(X, y)\` to predict outcomes (Regression: continuous outputs; Classification: discrete categories).
- **Unsupervised Learning**: Finding hidden patterns, clusters, or representations in unlabeled data \`(X)\` (Clustering, Dimensionality Reduction).
- **Reinforcement Learning**: Agents learn optimal actions through trial-and-error rewards and penalties within an environment.

---

### 2. NumPy & Pandas Essentials
\`\`\`python
import numpy as np
import pandas as pd

# NumPy: Vectorized n-dimensional arrays
features = np.array([[1.2, 3.4], [5.6, 7.8], [9.0, 2.1]])
normalized = (features - np.mean(features, axis=0)) / np.std(features, axis=0)

# Pandas: Structured DataFrames
df = pd.DataFrame({
    'age': [22, 35, 48, 29],
    'study_hours': [15, 20, 10, 25],
    'passed': [1, 1, 0, 1]
})

print(df.describe())
print(df.groupby('passed')['study_hours'].mean())
\`\`\``,
          notes: `• Supervised learning requires labeled target variables (ground truth).
• Vectorization in NumPy executes mathematical operations in optimized C code without Python for-loops.
• Feature scaling (normalization/standardization) is essential for gradient descent algorithms.`,
          questions: [
            {
              id: 'q-aiml-1-1-1',
              question: 'Predicting the market price of a house based on square footage and bedroom count is an example of which task?',
              code: '',
              type: 'mcq',
              options: ['Supervised Regression', 'Supervised Classification', 'Unsupervised Clustering', 'Reinforcement Learning'],
              answer: 'Supervised Regression',
              explanation: 'House price is a continuous numerical value predicted from labeled historical data, making it a supervised regression task.',
              category: 'ML Fundamentals',
              order: 1,
            },
          ],
          tasks: [
            {
              id: 't-aiml-1-1-1',
              taskNumber: 1,
              title: 'Implement Min-Max Feature Scaling in Python/NumPy',
              level: 'Level 1',
              category: 'Data Preprocessing',
              description: 'Write a Python function that scales an input NumPy array to values between 0 and 1 using the formula: (X - X_min) / (X_max - X_min).',
              requirements: [
                'Compute min and max across features along axis=0',
                'Apply vectorized formula (X - X_min) / (X_max - X_min)',
                'Return normalized array'
              ],
              example: 'def min_max_scale(X): return (X - X.min(axis=0)) / (X.max(axis=0) - X.min(axis=0))',
              hints: ['Use np.min(X, axis=0) and np.max(X, axis=0).'],
              starterCode: `import numpy as np\n\ndef min_max_scale(X):\n    # Implement scaling\n    pass\n`,
            },
          ],
        },
      ],
    },
    {
      title: 'Supervised Learning: Regression & Classification',
      order: 2,
      description: 'Master Linear Regression, Logistic Regression, Loss Functions, Gradient Descent, Decision Trees, and Random Forests.',
      lessons: [
        {
          title: 'Linear & Logistic Regression with Gradient Descent',
          type: 'text',
          duration: '25 mins',
          order: 1,
          content: `### 1. Linear Regression & Mean Squared Error (MSE)
Linear regression models the relationship between dependent variable \`y\` and independent features \`X\` via weights \`w\` and bias \`b\`:
\`\`\`
ŷ = w · X + b
MSE Loss = (1 / 2m) * Σ(ŷ - y)²
\`\`\`

---

### 2. Logistic Regression & Binary Cross-Entropy
Logistic regression maps continuous linear outputs to probabilities between 0 and 1 using the **Sigmoid Activation Function**:

\`\`\`
σ(z) = 1 / (1 + e^(-z))
\`\`\`

\`\`\`python
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report

# Split dataset 80% train, 20% test
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train Classifier
model = LogisticRegression()
model.fit(X_train, y_train)

# Predict & Evaluate
predictions = model.predict(X_test)
print('Accuracy:', accuracy_score(y_test, predictions))
\`\`\``,
          notes: `• Mean Squared Error (MSE) is used for Regression; Binary Cross-Entropy is used for Classification.
• Gradient Descent iteratively updates model weights in the direction of steepest descent (-∇Loss).
• Always evaluate models on an unseen test set to measure generalization ability.`,
          questions: [
            {
              id: 'q-aiml-2-1-1',
              question: 'What is the range of output values produced by the Sigmoid activation function?',
              code: 'def sigmoid(z):\n    return 1 / (1 + np.exp(-z))',
              type: 'mcq',
              options: ['(0, 1)', '[-1, 1]', '[0, ∞)', '(-∞, ∞)'],
              answer: '(0, 1)',
              explanation: 'The sigmoid function squashes any real-valued number into a smooth probability value strictly bounded between 0 and 1.',
              category: 'Classification',
              order: 1,
            },
          ],
          tasks: [
            {
              id: 't-aiml-2-1-1',
              taskNumber: 1,
              title: 'Implement the Sigmoid Activation & Binary Cross-Entropy Loss',
              level: 'Level 2',
              category: 'Algorithms',
              description: 'Write Python functions to compute the Sigmoid activation and calculate Binary Cross Entropy loss given true labels y and predictions y_hat.',
              requirements: [
                'Compute sigmoid: 1 / (1 + np.exp(-z))',
                'Calculate BCE Loss: -np.mean(y * np.log(y_hat + 1e-15) + (1 - y) * np.log(1 - y_hat + 1e-15))'
              ],
              example: 'def bce_loss(y, y_hat): ...',
              hints: ['Add a small epsilon (1e-15) inside log to prevent log(0) undefined errors.'],
              starterCode: `import numpy as np\n\ndef sigmoid(z):\n    pass\n\ndef binary_cross_entropy(y_true, y_pred):\n    pass\n`,
            },
          ],
        },
      ],
    },
    {
      title: 'Neural Networks & Deep Learning Foundations',
      order: 3,
      description: 'Understand Multilayer Perceptrons, activation functions (ReLU, Softmax), forward propagation, and backpropagation.',
      lessons: [
        {
          title: 'Artificial Neurons, Activation Functions & Backpropagation',
          type: 'text',
          duration: '26 mins',
          order: 1,
          content: `### 1. Artificial Neural Network Architecture
A Multilayer Perceptron (MLP) consists of an **Input Layer**, one or more **Hidden Layers**, and an **Output Layer**. Each connection carries a trainable **weight**, and each neuron applies an **activation function**.

\`\`\`python
import torch
import torch.nn as nn

class ClassifierMLP(nn.Module):
    def __init__(self, input_dim, hidden_dim, output_dim):
        super(ClassifierMLP, self).__init__()
        self.network = nn.Sequential(
            nn.Linear(input_dim, hidden_dim),
            nn.ReLU(),                         # Non-linear activation
            nn.Linear(hidden_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, output_dim)  # Output logits
        )

    def forward(self, x):
        return self.network(x)
\`\`\`

---

### 2. Common Activation Functions
| Activation | Formula | Best Use Case |
| :--- | :--- | :--- |
| **ReLU** | \`max(0, z)\` | Standard choice for hidden layers (prevents vanishing gradient) |
| **Sigmoid** | \`1 / (1 + e^-z)\` | Binary classification output layer |
| **Softmax** | \`e^z_i / Σ e^z_j\` | Multi-class classification output probabilities (sums to 1.0) |`,
          notes: `• Non-linear activation functions allow neural networks to learn complex non-linear boundaries.
• Backpropagation uses the calculus Chain Rule to compute gradients of the loss with respect to all weights.
• Optimizers like Adam adaptively tune learning rates per parameter for faster convergence.`,
          questions: [
            {
              id: 'q-aiml-3-1-1',
              question: 'Why is ReLU (Rectified Linear Unit) widely preferred over Sigmoid in deep hidden layers?',
              code: 'ReLU(z) = max(0, z)',
              type: 'conceptual',
              options: [],
              answer: 'ReLU avoids the vanishing gradient problem for positive inputs because its derivative is a constant 1, enabling deep neural networks to train efficiently.',
              explanation: 'Sigmoid gradients saturate near 0 for large positive or negative inputs, causing gradient vanishing as error propagates back through many layers.',
              category: 'Deep Learning',
              order: 1,
            },
          ],
          tasks: [
            {
              id: 't-aiml-3-1-1',
              taskNumber: 1,
              title: 'Build a 2-Layer Neural Network Forward Pass in NumPy',
              level: 'Level 2',
              category: 'Deep Learning',
              description: 'Implement a forward pass through a 2-layer neural network using matrix multiplication, bias addition, ReLU activation, and Softmax output.',
              requirements: [
                'Compute hidden = np.maximum(0, np.dot(X, W1) + b1)',
                'Compute logits = np.dot(hidden, W2) + b2',
                'Apply numerically stable Softmax: exp(logits - max) / sum(exp(logits - max))'
              ],
              example: 'def forward_pass(X, W1, b1, W2, b2): ...',
              hints: ['Subtract np.max(logits, axis=-1, keepdims=True) before exp for numerical stability.'],
              starterCode: `import numpy as np\n\ndef relu(x):\n    return np.maximum(0, x)\n\ndef softmax(x):\n    # Implement stable softmax\n    pass\n\ndef forward_pass(X, W1, b1, W2, b2):\n    pass\n`,
            },
          ],
        },
      ],
    },
    {
      title: 'Generative AI, LLMs & Prompt Engineering',
      order: 4,
      description: 'Explore Transformer architecture, Self-Attention, Tokenization, LLM Fine-Tuning, Prompt Engineering, and RAG.',
      lessons: [
        {
          title: 'Transformers, Self-Attention & RAG Architecture',
          type: 'text',
          duration: '26 mins',
          order: 1,
          content: `### 1. The Transformer & Self-Attention Mechanism
Introduced in *Attention Is All You Need* (2017), the Transformer architecture processes entire sequences simultaneously (unlike sequential RNNs/LSTMs) using **Scaled Dot-Product Attention**:

\`\`\`
Attention(Q, K, V) = softmax( (Q · K^T) / √d_k ) · V
\`\`\`
- **Query (Q)**: What the current token is looking for.
- **Key (K)**: What each token in the sequence represents.
- **Value (V)**: The actual content information passed forward.

---

### 2. Retrieval-Augmented Generation (RAG)
RAG grounds Large Language Models with private, up-to-date documentation:
1. **Ingest & Chunk**: Split internal documents into semantic chunks.
2. **Embedding**: Convert chunks into high-dimensional vector embeddings.
3. **Vector Database**: Store embeddings in vector stores (Pinecone, Chroma, Atlas Vector Search).
4. **Retrieve & Augment**: Perform cosine similarity search for user query, inject top relevant chunks into system prompt.`,
          notes: `• Transformers process tokens in parallel, enabling massive GPU scaling and multi-billion parameter LLMs.
• Self-attention dynamically assigns contextual weights between all words in a sentence.
• RAG eliminates hallucinations by grounding the LLM responses on verified retrieved knowledge documents.`,
          questions: [
            {
              id: 'q-aiml-4-1-1',
              question: 'In a RAG (Retrieval-Augmented Generation) pipeline, what is the purpose of a vector database?',
              code: '',
              type: 'mcq',
              options: [
                'To index and perform fast cosine similarity searches on document vector embeddings',
                'To replace the LLM neural network',
                'To compile Python code into WebAssembly',
                'To render HTML templates on the client'
              ],
              answer: 'To index and perform fast cosine similarity searches on document vector embeddings',
              explanation: 'Vector databases store semantic embeddings of text chunks and retrieve the most contextually relevant documents to augment LLM prompts.',
              category: 'Generative AI',
              order: 1,
            },
          ],
          tasks: [
            {
              id: 't-aiml-4-1-1',
              taskNumber: 1,
              title: 'Implement Cosine Similarity for Semantic Search',
              level: 'Level 2',
              category: 'Generative AI',
              description: 'Write a Python function computing the cosine similarity between a query embedding vector and a matrix of document embeddings.',
              requirements: [
                'Compute dot product: dot(doc_matrix, query_vec)',
                'Compute L2 norms: norm(doc_matrix) * norm(query_vec)',
                'Return normalized cosine similarity array between -1.0 and 1.0'
              ],
              example: 'def cosine_similarity(query, docs): return np.dot(docs, query) / (np.linalg.norm(docs, axis=1) * np.linalg.norm(query))',
              hints: ['Use np.linalg.norm() for Euclidean norm calculation.'],
              starterCode: `import numpy as np\n\ndef cosine_similarity(query_vector, document_matrix):\n    # Implement cosine similarity\n    pass\n`,
            },
          ],
        },
      ],
    },
  ],
};
