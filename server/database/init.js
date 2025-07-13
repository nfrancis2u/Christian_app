const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'christian_social.db');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('📄 Connected to SQLite database');
  }
});

// Initialize database tables
async function initializeDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Users table
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        bio TEXT,
        avatar_url VARCHAR(255),
        church_name VARCHAR(100),
        denomination VARCHAR(50),
        location VARCHAR(100),
        spiritual_gifts TEXT,
        favorite_verse TEXT,
        prayer_language VARCHAR(20) DEFAULT 'english',
        is_verified BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Posts table
      db.run(`CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        image_url VARCHAR(255),
        post_type VARCHAR(20) DEFAULT 'general',
        scripture_reference VARCHAR(100),
        prayer_category VARCHAR(50),
        is_anonymous BOOLEAN DEFAULT FALSE,
        likes_count INTEGER DEFAULT 0,
        comments_count INTEGER DEFAULT 0,
        shares_count INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`);

      // Comments table
      db.run(`CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        parent_comment_id INTEGER,
        likes_count INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (parent_comment_id) REFERENCES comments(id) ON DELETE CASCADE
      )`);

      // Likes table
      db.run(`CREATE TABLE IF NOT EXISTS likes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        post_id INTEGER,
        comment_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
        FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE
      )`);

      // Prayers table
      db.run(`CREATE TABLE IF NOT EXISTS prayers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title VARCHAR(200) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(50),
        is_urgent BOOLEAN DEFAULT FALSE,
        is_anonymous BOOLEAN DEFAULT FALSE,
        is_answered BOOLEAN DEFAULT FALSE,
        prayer_count INTEGER DEFAULT 0,
        answered_testimony TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`);

      // Prayer responses table
      db.run(`CREATE TABLE IF NOT EXISTS prayer_responses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        prayer_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        response_type VARCHAR(20) DEFAULT 'prayed',
        message TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (prayer_id) REFERENCES prayers(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`);

      // Messages table
      db.run(`CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender_id INTEGER NOT NULL,
        receiver_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        message_type VARCHAR(20) DEFAULT 'text',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
      )`);

      // Groups table
      db.run(`CREATE TABLE IF NOT EXISTS groups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        creator_id INTEGER NOT NULL,
        image_url VARCHAR(255),
        group_type VARCHAR(20) DEFAULT 'bible_study',
        is_private BOOLEAN DEFAULT FALSE,
        member_count INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
      )`);

      // Group members table
      db.run(`CREATE TABLE IF NOT EXISTS group_members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        group_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        role VARCHAR(20) DEFAULT 'member',
        joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(group_id, user_id)
      )`);

      // Friendships table
      db.run(`CREATE TABLE IF NOT EXISTS friendships (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        requester_id INTEGER NOT NULL,
        addressee_id INTEGER NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (addressee_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(requester_id, addressee_id)
      )`);

      // Bible verses table
      db.run(`CREATE TABLE IF NOT EXISTS bible_verses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        book VARCHAR(50) NOT NULL,
        chapter INTEGER NOT NULL,
        verse INTEGER NOT NULL,
        text TEXT NOT NULL,
        version VARCHAR(20) DEFAULT 'NIV',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Devotionals table
      db.run(`CREATE TABLE IF NOT EXISTS devotionals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title VARCHAR(200) NOT NULL,
        content TEXT NOT NULL,
        author VARCHAR(100),
        scripture_reference VARCHAR(100),
        date DATE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Notifications table
      db.run(`CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(200) NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        related_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`);

      // Create indexes for better performance
      db.run('CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id)');
      db.run('CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at)');
      db.run('CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id)');
      db.run('CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id)');
      db.run('CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes(post_id)');
      db.run('CREATE INDEX IF NOT EXISTS idx_prayers_user_id ON prayers(user_id)');
      db.run('CREATE INDEX IF NOT EXISTS idx_prayers_category ON prayers(category)');
      db.run('CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id)');
      db.run('CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id)');
      db.run('CREATE INDEX IF NOT EXISTS idx_friendships_requester_id ON friendships(requester_id)');
      db.run('CREATE INDEX IF NOT EXISTS idx_friendships_addressee_id ON friendships(addressee_id)');

      // Insert some sample Bible verses
      const sampleVerses = [
        { book: 'John', chapter: 3, verse: 16, text: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.' },
        { book: 'Philippians', chapter: 4, verse: 13, text: 'I can do all this through him who gives me strength.' },
        { book: 'Romans', chapter: 8, verse: 28, text: 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.' },
        { book: 'Jeremiah', chapter: 29, verse: 11, text: 'For I know the plans I have for you," declares the Lord, "plans to prosper you and not to harm you, plans to give you hope and a future.' },
        { book: 'Psalm', chapter: 23, verse: 1, text: 'The Lord is my shepherd, I lack nothing.' },
        { book: 'Matthew', chapter: 28, verse: 19, text: 'Therefore go and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit.' },
        { book: 'Ephesians', chapter: 2, verse: 8, text: 'For it is by grace you have been saved, through faith—and this is not from yourselves, it is the gift of God.' },
        { book: 'Proverbs', chapter: 3, verse: 5, text: 'Trust in the Lord with all your heart and lean not on your own understanding.' }
      ];

      const insertVerse = db.prepare('INSERT OR IGNORE INTO bible_verses (book, chapter, verse, text, version) VALUES (?, ?, ?, ?, ?)');
      sampleVerses.forEach(verse => {
        insertVerse.run(verse.book, verse.chapter, verse.verse, verse.text, 'NIV');
      });
      insertVerse.finalize();

      // Insert sample devotional
      db.run(`INSERT OR IGNORE INTO devotionals (title, content, author, scripture_reference, date) VALUES (
        'Walking in Faith',
        'Faith is not just believing in God, but trusting Him completely with your life. When we face challenges, we can remember that God is always with us, guiding our steps and providing strength for the journey. Take time today to reflect on how God has been faithful in your life.',
        'Daily Devotional Team',
        'Hebrews 11:1',
        date('now')
      )`);

      console.log('✅ Database tables created successfully');
      resolve();
    });
  });
}

// Database utility functions
function getDB() {
  return db;
}

function closeDB() {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) {
        reject(err);
      } else {
        console.log('📄 Database connection closed');
        resolve();
      }
    });
  });
}

module.exports = {
  initializeDatabase,
  getDB,
  closeDB
};