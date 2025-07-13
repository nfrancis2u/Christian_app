const express = require('express');
const { getDB } = require('../database/init');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Get random verse of the day
router.get('/verse-of-the-day', optionalAuth, async (req, res) => {
  try {
    const db = getDB();
    
    const verse = await new Promise((resolve, reject) => {
      db.get(`
        SELECT * FROM bible_verses 
        ORDER BY RANDOM() 
        LIMIT 1
      `, (err, verse) => {
        if (err) reject(err);
        else resolve(verse);
      });
    });

    if (!verse) {
      return res.status(404).json({ message: 'No verses found' });
    }

    res.json({
      verse: {
        id: verse.id,
        book: verse.book,
        chapter: verse.chapter,
        verse: verse.verse,
        text: verse.text,
        version: verse.version,
        reference: `${verse.book} ${verse.chapter}:${verse.verse}`
      }
    });

  } catch (error) {
    console.error('Get verse of the day error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Search Bible verses
router.get('/search', optionalAuth, async (req, res) => {
  try {
    const query = req.query.q;
    const book = req.query.book;
    const version = req.query.version || 'NIV';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    if (!query && !book) {
      return res.status(400).json({ message: 'Search query or book is required' });
    }

    const db = getDB();
    
    let whereClause = 'WHERE version = ?';
    const params = [version];

    if (query) {
      whereClause += ' AND text LIKE ?';
      params.push(`%${query}%`);
    }

    if (book) {
      whereClause += ' AND book = ?';
      params.push(book);
    }

    const verses = await new Promise((resolve, reject) => {
      db.all(`
        SELECT * FROM bible_verses 
        ${whereClause}
        ORDER BY book, chapter, verse
        LIMIT ? OFFSET ?
      `, [...params, limit, offset], (err, verses) => {
        if (err) reject(err);
        else resolve(verses);
      });
    });

    const formattedVerses = verses.map(verse => ({
      id: verse.id,
      book: verse.book,
      chapter: verse.chapter,
      verse: verse.verse,
      text: verse.text,
      version: verse.version,
      reference: `${verse.book} ${verse.chapter}:${verse.verse}`
    }));

    res.json({
      verses: formattedVerses,
      pagination: {
        currentPage: page,
        hasNext: verses.length === limit,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Search verses error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get Bible books
router.get('/books', async (req, res) => {
  try {
    const db = getDB();
    
    const books = await new Promise((resolve, reject) => {
      db.all(`
        SELECT DISTINCT book FROM bible_verses 
        ORDER BY book
      `, (err, books) => {
        if (err) reject(err);
        else resolve(books);
      });
    });

    const bookList = books.map(book => book.book);

    res.json({ books: bookList });

  } catch (error) {
    console.error('Get books error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get today's devotional
router.get('/devotional/today', optionalAuth, async (req, res) => {
  try {
    const db = getDB();
    
    const devotional = await new Promise((resolve, reject) => {
      db.get(`
        SELECT * FROM devotionals 
        WHERE date = date('now')
        ORDER BY created_at DESC
        LIMIT 1
      `, (err, devotional) => {
        if (err) reject(err);
        else resolve(devotional);
      });
    });

    if (!devotional) {
      // If no devotional for today, get a random one
      const randomDevotional = await new Promise((resolve, reject) => {
        db.get(`
          SELECT * FROM devotionals 
          ORDER BY RANDOM() 
          LIMIT 1
        `, (err, devotional) => {
          if (err) reject(err);
          else resolve(devotional);
        });
      });

      if (!randomDevotional) {
        return res.status(404).json({ message: 'No devotionals found' });
      }

      return res.json({
        devotional: {
          id: randomDevotional.id,
          title: randomDevotional.title,
          content: randomDevotional.content,
          author: randomDevotional.author,
          scriptureReference: randomDevotional.scripture_reference,
          date: randomDevotional.date,
          isToday: false
        }
      });
    }

    res.json({
      devotional: {
        id: devotional.id,
        title: devotional.title,
        content: devotional.content,
        author: devotional.author,
        scriptureReference: devotional.scripture_reference,
        date: devotional.date,
        isToday: true
      }
    });

  } catch (error) {
    console.error('Get today devotional error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all devotionals
router.get('/devotionals', optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const db = getDB();
    
    const devotionals = await new Promise((resolve, reject) => {
      db.all(`
        SELECT * FROM devotionals 
        ORDER BY date DESC, created_at DESC
        LIMIT ? OFFSET ?
      `, [limit, offset], (err, devotionals) => {
        if (err) reject(err);
        else resolve(devotionals);
      });
    });

    const formattedDevotionals = devotionals.map(devotional => ({
      id: devotional.id,
      title: devotional.title,
      content: devotional.content,
      author: devotional.author,
      scriptureReference: devotional.scripture_reference,
      date: devotional.date,
      createdAt: devotional.created_at
    }));

    res.json({
      devotionals: formattedDevotionals,
      pagination: {
        currentPage: page,
        hasNext: devotionals.length === limit,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get devotionals error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get devotional by ID
router.get('/devotionals/:id', optionalAuth, async (req, res) => {
  try {
    const devotionalId = req.params.id;
    const db = getDB();
    
    const devotional = await new Promise((resolve, reject) => {
      db.get(`
        SELECT * FROM devotionals WHERE id = ?
      `, [devotionalId], (err, devotional) => {
        if (err) reject(err);
        else resolve(devotional);
      });
    });

    if (!devotional) {
      return res.status(404).json({ message: 'Devotional not found' });
    }

    res.json({
      devotional: {
        id: devotional.id,
        title: devotional.title,
        content: devotional.content,
        author: devotional.author,
        scriptureReference: devotional.scripture_reference,
        date: devotional.date,
        createdAt: devotional.created_at
      }
    });

  } catch (error) {
    console.error('Get devotional error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new devotional (authenticated users only)
router.post('/devotionals', authenticateToken, async (req, res) => {
  try {
    const {
      title,
      content,
      author,
      scriptureReference,
      date
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const db = getDB();
    
    const result = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO devotionals (title, content, author, scripture_reference, date) 
         VALUES (?, ?, ?, ?, ?)`,
        [title, content, author || 'Anonymous', scriptureReference || null, date || new Date().toISOString().split('T')[0]],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });

    // Get the created devotional
    const newDevotional = await new Promise((resolve, reject) => {
      db.get(`
        SELECT * FROM devotionals WHERE id = ?
      `, [result.id], (err, devotional) => {
        if (err) reject(err);
        else resolve(devotional);
      });
    });

    res.status(201).json({
      message: 'Devotional created successfully',
      devotional: {
        id: newDevotional.id,
        title: newDevotional.title,
        content: newDevotional.content,
        author: newDevotional.author,
        scriptureReference: newDevotional.scripture_reference,
        date: newDevotional.date,
        createdAt: newDevotional.created_at
      }
    });

  } catch (error) {
    console.error('Create devotional error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get Bible versions
router.get('/versions', async (req, res) => {
  try {
    const versions = [
      { value: 'NIV', label: 'New International Version' },
      { value: 'KJV', label: 'King James Version' },
      { value: 'ESV', label: 'English Standard Version' },
      { value: 'NASB', label: 'New American Standard Bible' },
      { value: 'NLT', label: 'New Living Translation' },
      { value: 'NKJV', label: 'New King James Version' },
      { value: 'CSB', label: 'Christian Standard Bible' },
      { value: 'MSG', label: 'The Message' }
    ];

    res.json({ versions });

  } catch (error) {
    console.error('Get versions error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get inspirational quotes/verses
router.get('/inspiration', optionalAuth, async (req, res) => {
  try {
    const category = req.query.category || 'hope';
    const db = getDB();
    
    // Define keyword mappings for different categories
    const categoryKeywords = {
      hope: ['hope', 'future', 'plan', 'strength'],
      love: ['love', 'beloved', 'heart', 'compassion'],
      peace: ['peace', 'rest', 'calm', 'comfort'],
      faith: ['faith', 'believe', 'trust', 'confidence'],
      strength: ['strength', 'strong', 'power', 'mighty'],
      wisdom: ['wisdom', 'understanding', 'knowledge', 'discernment'],
      joy: ['joy', 'rejoice', 'gladness', 'happiness'],
      courage: ['courage', 'fear not', 'brave', 'bold']
    };

    const keywords = categoryKeywords[category] || categoryKeywords.hope;
    const keyword = keywords[Math.floor(Math.random() * keywords.length)];
    
    const verses = await new Promise((resolve, reject) => {
      db.all(`
        SELECT * FROM bible_verses 
        WHERE text LIKE ?
        ORDER BY RANDOM()
        LIMIT 5
      `, [`%${keyword}%`], (err, verses) => {
        if (err) reject(err);
        else resolve(verses);
      });
    });

    const formattedVerses = verses.map(verse => ({
      id: verse.id,
      book: verse.book,
      chapter: verse.chapter,
      verse: verse.verse,
      text: verse.text,
      version: verse.version,
      reference: `${verse.book} ${verse.chapter}:${verse.verse}`,
      category: category
    }));

    res.json({
      category: category,
      verses: formattedVerses
    });

  } catch (error) {
    console.error('Get inspiration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;