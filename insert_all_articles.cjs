const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_FILE = path.join(process.cwd(), 'database.db');
const db = new Database(DB_FILE);

// Define the articles with their metadata
const articles = [
  {
    id: 'augment_code_enterprise',
    title: 'Augment Code: The Comprehensive Enterprise Context & Multi-Repo AI Evaluation',
    slug: 'augment-code-comprehensive-enterprise-context-multi-repo-ai-evaluation',
    category: 'Engineering',
    summary: 'A deep investigation into Augment Code, an AI-native workspace designed for complex multi-repository architectures. We analyze its semantic background compiler, pricing models, and real-world pros and cons.',
    fileName: 'augment_article.html',
    author: 'Anik Admin',
    authorRole: 'Senior Tech Evaluator',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop',
    publishedDate: 'Jul 06, 2026',
    status: 'Published',
    isFeatured: 0,
    featuredImage: '/src/assets/images/augment_code_ai_1783400527016.jpg',
    tags: ['Augment', 'Enterprise', 'Multi-Repo', 'Programming', 'AI'],
    views: 1245,
    readingTime: '9 min read',
    seoTitle: 'Augment Code Review: Enterprise Multi-Repo Code Intelligence | LLM Review Pro',
    seoDescription: 'Read our comprehensive deep-dive evaluation of Augment Code. We evaluate its background semantic index, Slack integration, pricing structures, pros, and cons.'
  },
  {
    id: 'kiro_code_agents',
    title: 'Kiro Code Review: Analyzing the Next-Generation Autonomous Developer Agent',
    slug: 'kiro-code-review-analyzing-next-generation-autonomous-developer-agent',
    category: 'Productivity',
    summary: 'An analytical deep-dive into Kiro Code (kiro.dev), the autonomous software engineering agent. We review its sandboxed local testing loop, Git integrations, pricing structures, and realistic limits.',
    fileName: 'kiro_article.html',
    author: 'Anik Admin',
    authorRole: 'Senior Tech Evaluator',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop',
    publishedDate: 'Jul 06, 2026',
    status: 'Published',
    isFeatured: 0,
    featuredImage: '/src/assets/images/cursor_composer_map_1783400114669.jpg',
    tags: ['Kiro', 'Agents', 'Git', 'Automation', 'DevOps'],
    views: 932,
    readingTime: '8 min read',
    seoTitle: 'Kiro Code Review: Autonomous Software Engineering Agent | LLM Review Pro',
    seoDescription: 'Read our exhaustive technical evaluation of Kiro Code (kiro.dev), the git-authoritative development agent that plans, codes, and runs unit tests automatically.'
  },
  {
    id: 'claude_code_cli',
    title: 'Claude Code: Detailed Technical Exploration of Anthropic’s Terminal Agent',
    slug: 'claude-code-detailed-technical-exploration-anthropics-terminal-agent',
    category: 'Engineering',
    summary: 'A direct investigation into Claude Code, Anthropic’s terminal-native coding agent powered by Claude 3.7 Sonnet. We analyze its direct command-line orchestration, tool execution, and real cost metrics.',
    fileName: 'claude_code_article.html',
    author: 'Anik Admin',
    authorRole: 'Senior Tech Evaluator',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop',
    publishedDate: 'Jul 06, 2026',
    status: 'Published',
    isFeatured: 0,
    featuredImage: '/src/assets/images/claude_code_cli_1783400541999.jpg',
    tags: ['Claude', 'Anthropic', 'CLI', 'Terminal', 'Programming'],
    views: 1410,
    readingTime: '10 min read',
    seoTitle: 'Claude Code Review: Anthropic’s Terminal AI Agent | LLM Review Pro',
    seoDescription: 'Read our detailed evaluation of Claude Code, Anthropic’s terminal-native tool. We cover Claude 3.7 Sonnet capabilities, CLI command executions, pricing, and pros and cons.'
  },
  {
    id: 'windsurf_cascade_editor',
    title: 'Windsurf Code Editor: A Deep Dive into Codeium’s AI Flow & Cascade Agent',
    slug: 'windsurf-code-editor-deep-dive-codeiums-ai-flow-cascade-agent',
    category: 'Productivity',
    summary: 'A thorough investigation of Windsurf, the VS Code fork built by Codeium. We inspect its sidebar assistant Cascade, write mode, autocomplete models, pricing structures, pros, and cons.',
    fileName: 'windsurf_article.html',
    author: 'Anik Admin',
    authorRole: 'Senior Tech Evaluator',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop',
    publishedDate: 'Jul 06, 2026',
    status: 'Published',
    isFeatured: 0,
    featuredImage: '/src/assets/images/windsurf_cascade_1783400556947.jpg',
    tags: ['Windsurf', 'Codeium', 'Cascade', 'IDE', 'Programming'],
    views: 1654,
    readingTime: '9 min read',
    seoTitle: 'Windsurf Code Editor Review: Codeium Cascade AI Flow | LLM Review Pro',
    seoDescription: 'Read our in-depth evaluation of Windsurf, the custom VS Code fork by Codeium. We analyze the Cascade agent, visual collaborative edits, autocomplete, and pricing.'
  },
  {
    id: 'google_ai_studio_build',
    title: 'Google AI Studio Build: Is This the Future of Cloud-Native Prototyping?',
    slug: 'google-ai-studio-build-future-cloud-native-prototyping',
    category: 'Engineering',
    summary: 'Our technical evaluation of Google AI Studio Build (ai.studio/build), the cloud-native workspace powering zero-setup development. We analyze its container execution, database integrations, and limits.',
    fileName: 'google_ai_studio_article.html',
    author: 'Anik Admin',
    authorRole: 'Senior Tech Evaluator',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop',
    publishedDate: 'Jul 06, 2026',
    status: 'Published',
    isFeatured: 0,
    featuredImage: '/src/assets/images/google_ai_studio_workspace_1783400570211.jpg',
    tags: ['Google', 'AI Studio', 'Cloud Run', 'Vite', 'Full-Stack'],
    views: 2015,
    readingTime: '11 min read',
    seoTitle: 'Google AI Studio Build Review: Cloud-Native Workspace | LLM Review Pro',
    seoDescription: 'Read our comprehensive review of Google AI Studio Build (ai.studio/build). We evaluate full-stack Cloud Run containers, Firebase integrations, database setups, and pros and cons.'
  }
];

const insertStmt = db.prepare(`
  INSERT INTO articles (
    id, title, slug, category, summary, content, author, authorRole, 
    authorAvatar, publishedDate, status, isFeatured, featuredImage, 
    tags, views, readingTime, seoTitle, seoDescription, createdAt
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(id) DO UPDATE SET
    title=excluded.title,
    slug=excluded.slug,
    summary=excluded.summary,
    content=excluded.content,
    isFeatured=excluded.isFeatured,
    featuredImage=excluded.featuredImage,
    tags=excluded.tags,
    views=excluded.views,
    readingTime=excluded.readingTime,
    seoTitle=excluded.seoTitle,
    seoDescription=excluded.seoDescription
`);

console.log("Starting article insertion/update operations...");

let successCount = 0;
let failCount = 0;

articles.forEach((art) => {
  const contentPath = path.join(process.cwd(), art.fileName);
  if (!fs.existsSync(contentPath)) {
    console.error(`File not found: ${contentPath}`);
    failCount++;
    return;
  }
  
  const content = fs.readFileSync(contentPath, 'utf8');
  
  try {
    insertStmt.run(
      art.id,
      art.title,
      art.slug,
      art.category,
      art.summary,
      content,
      art.author,
      art.authorRole,
      art.authorAvatar,
      art.publishedDate,
      art.status,
      art.isFeatured,
      art.featuredImage,
      JSON.stringify(art.tags),
      art.views,
      art.readingTime,
      art.seoTitle,
      art.seoDescription,
      new Date().toISOString()
    );
    console.log(`✓ Successfully processed article: ${art.id}`);
    successCount++;
  } catch (err) {
    console.error(`✗ Failed to insert article ${art.id}:`, err);
    failCount++;
  }
});

console.log(`Finished processing. Successes: ${successCount}, Failures: ${failCount}`);
db.close();
