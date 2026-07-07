const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_FILE = path.join(process.cwd(), 'database.db');
const db = new Database(DB_FILE);

const contentPath = path.join(process.cwd(), 'cursor_article.html');
const content = fs.readFileSync(contentPath, 'utf8');

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

try {
  insertStmt.run(
    'cursor_ai_review',
    'Cursor AI: The Definitive Technical Evaluation of the Frontier AI Code Editor',
    'cursor-ai-definitive-technical-evaluation-frontier-code-editor',
    'Engineering',
    'An exhaustive, developer-first investigation into Cursor, the AI-native fork of VS Code. We evaluate its multi-file Composer, Tab autocompletion, real-time index synchronization, actual monthly costs, and real-world pros and cons.',
    content,
    'Anik Admin',
    'Senior Tech Evaluator',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop',
    'Jul 06, 2026',
    'Published',
    1, // IsFeatured = 1 (Featured)
    '/src/assets/images/cursor_ai_editor_review_1783400089698.jpg',
    JSON.stringify(['Cursor', 'AI', 'IDE', 'Programming', 'DevTools']),
    1842,
    '12 min read',
    'Cursor AI Editor: Detailed Technical Review, Pricing, Pros & Cons | LLM Review Pro',
    'Read our comprehensive deep-dive review of Cursor, the fork of VS Code. We cover core AI features, pricing models, developer insights, and full pros and cons.',
    new Date().toISOString()
  );
  console.log("Successfully inserted/updated the Cursor AI Review article in the SQLite database!");
} catch (e) {
  console.error("Failed to insert the Cursor AI Review article:", e);
}
db.close();
