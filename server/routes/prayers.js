const express = require('express');
const { getDB } = require('../database/init');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Get all prayer requests (with pagination)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const category = req.query.category || 'all';
    const isUrgent = req.query.urgent === 'true';
    
    const db = getDB();
    
    let whereClause = 'WHERE 1=1';
    const params = [];
    
    if (category !== 'all') {
      whereClause += ' AND p.category = ?';
      params.push(category);
    }
    
    if (isUrgent) {
      whereClause += ' AND p.is_urgent = 1';
    }
    
    const prayers = await new Promise((resolve, reject) => {
      db.all(`
        SELECT p.*, u.username, u.first_name, u.last_name, u.avatar_url, u.is_verified,
               COUNT(pr.id) as response_count
        FROM prayers p
        JOIN users u ON p.user_id = u.id
        LEFT JOIN prayer_responses pr ON p.id = pr.prayer_id
        ${whereClause}
        GROUP BY p.id
        ORDER BY p.is_urgent DESC, p.created_at DESC
        LIMIT ? OFFSET ?
      `, [...params, limit, offset], (err, prayers) => {
        if (err) reject(err);
        else resolve(prayers);
      });
    });

    const formattedPrayers = prayers.map(prayer => ({
      id: prayer.id,
      title: prayer.title,
      description: prayer.description,
      category: prayer.category,
      isUrgent: prayer.is_urgent,
      isAnonymous: prayer.is_anonymous,
      isAnswered: prayer.is_answered,
      prayerCount: prayer.prayer_count,
      responseCount: prayer.response_count,
      answeredTestimony: prayer.answered_testimony,
      createdAt: prayer.created_at,
      user: prayer.is_anonymous ? {
        id: null,
        username: 'Anonymous',
        firstName: 'Anonymous',
        lastName: 'User',
        avatarUrl: null,
        isVerified: false
      } : {
        id: prayer.user_id,
        username: prayer.username,
        firstName: prayer.first_name,
        lastName: prayer.last_name,
        avatarUrl: prayer.avatar_url,
        isVerified: prayer.is_verified
      }
    }));

    res.json({
      prayers: formattedPrayers,
      pagination: {
        currentPage: page,
        hasNext: prayers.length === limit,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get prayers error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new prayer request
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      isUrgent,
      isAnonymous
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    const db = getDB();
    
    const result = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO prayers (user_id, title, description, category, is_urgent, is_anonymous) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [req.user.id, title, description, category || 'general', isUrgent || false, isAnonymous || false],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });

    // Get the created prayer with user info
    const newPrayer = await new Promise((resolve, reject) => {
      db.get(`
        SELECT p.*, u.username, u.first_name, u.last_name, u.avatar_url, u.is_verified
        FROM prayers p
        JOIN users u ON p.user_id = u.id
        WHERE p.id = ?
      `, [result.id], (err, prayer) => {
        if (err) reject(err);
        else resolve(prayer);
      });
    });

    res.status(201).json({
      message: 'Prayer request created successfully',
      prayer: {
        id: newPrayer.id,
        title: newPrayer.title,
        description: newPrayer.description,
        category: newPrayer.category,
        isUrgent: newPrayer.is_urgent,
        isAnonymous: newPrayer.is_anonymous,
        isAnswered: newPrayer.is_answered,
        prayerCount: 0,
        responseCount: 0,
        answeredTestimony: null,
        createdAt: newPrayer.created_at,
        user: newPrayer.is_anonymous ? {
          id: null,
          username: 'Anonymous',
          firstName: 'Anonymous',
          lastName: 'User',
          avatarUrl: null,
          isVerified: false
        } : {
          id: newPrayer.user_id,
          username: newPrayer.username,
          firstName: newPrayer.first_name,
          lastName: newPrayer.last_name,
          avatarUrl: newPrayer.avatar_url,
          isVerified: newPrayer.is_verified
        }
      }
    });

  } catch (error) {
    console.error('Create prayer error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Respond to prayer request (pray for it)
router.post('/:id/pray', authenticateToken, async (req, res) => {
  try {
    const prayerId = req.params.id;
    const { message } = req.body;
    
    const db = getDB();
    
    // Check if user already prayed for this request
    const existingResponse = await new Promise((resolve, reject) => {
      db.get('SELECT id FROM prayer_responses WHERE user_id = ? AND prayer_id = ?', 
        [req.user.id, prayerId], (err, response) => {
          if (err) reject(err);
          else resolve(response);
        });
    });

    if (existingResponse) {
      return res.status(400).json({ message: 'You have already prayed for this request' });
    }

    // Add prayer response
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO prayer_responses (prayer_id, user_id, response_type, message) VALUES (?, ?, ?, ?)',
        [prayerId, req.user.id, 'prayed', message || null],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    // Update prayer count
    await new Promise((resolve, reject) => {
      db.run('UPDATE prayers SET prayer_count = prayer_count + 1 WHERE id = ?', 
        [prayerId], function(err) {
          if (err) reject(err);
          else resolve();
        });
    });

    res.json({ message: 'Prayer response recorded successfully' });

  } catch (error) {
    console.error('Pray for request error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get responses for a prayer request
router.get('/:id/responses', optionalAuth, async (req, res) => {
  try {
    const prayerId = req.params.id;
    const db = getDB();
    
    const responses = await new Promise((resolve, reject) => {
      db.all(`
        SELECT pr.*, u.username, u.first_name, u.last_name, u.avatar_url, u.is_verified
        FROM prayer_responses pr
        JOIN users u ON pr.user_id = u.id
        WHERE pr.prayer_id = ?
        ORDER BY pr.created_at DESC
      `, [prayerId], (err, responses) => {
        if (err) reject(err);
        else resolve(responses);
      });
    });

    const formattedResponses = responses.map(response => ({
      id: response.id,
      responseType: response.response_type,
      message: response.message,
      createdAt: response.created_at,
      user: {
        id: response.user_id,
        username: response.username,
        firstName: response.first_name,
        lastName: response.last_name,
        avatarUrl: response.avatar_url,
        isVerified: response.is_verified
      }
    }));

    res.json({ responses: formattedResponses });

  } catch (error) {
    console.error('Get prayer responses error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Mark prayer as answered (only by author)
router.put('/:id/answer', authenticateToken, async (req, res) => {
  try {
    const prayerId = req.params.id;
    const { testimony } = req.body;
    
    const db = getDB();
    
    // Check if user owns the prayer request
    const prayer = await new Promise((resolve, reject) => {
      db.get('SELECT user_id FROM prayers WHERE id = ?', [prayerId], (err, prayer) => {
        if (err) reject(err);
        else resolve(prayer);
      });
    });

    if (!prayer) {
      return res.status(404).json({ message: 'Prayer request not found' });
    }

    if (prayer.user_id !== req.user.id) {
      return res.status(403).json({ message: 'You can only mark your own prayers as answered' });
    }

    // Mark as answered
    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE prayers SET is_answered = 1, answered_testimony = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [testimony || null, prayerId],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    res.json({ message: 'Prayer marked as answered successfully' });

  } catch (error) {
    console.error('Mark prayer as answered error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get prayer categories
router.get('/categories', async (req, res) => {
  try {
    const categories = [
      { value: 'health', label: 'Health & Healing' },
      { value: 'family', label: 'Family & Relationships' },
      { value: 'finances', label: 'Finances & Provision' },
      { value: 'work', label: 'Work & Career' },
      { value: 'spiritual', label: 'Spiritual Growth' },
      { value: 'guidance', label: 'Guidance & Wisdom' },
      { value: 'salvation', label: 'Salvation' },
      { value: 'protection', label: 'Protection & Safety' },
      { value: 'church', label: 'Church & Ministry' },
      { value: 'world', label: 'World & Nations' },
      { value: 'other', label: 'Other' }
    ];

    res.json({ categories });

  } catch (error) {
    console.error('Get prayer categories error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete prayer request (only by author)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const prayerId = req.params.id;
    const userId = req.user.id;
    
    const db = getDB();
    
    // Check if user owns the prayer request
    const prayer = await new Promise((resolve, reject) => {
      db.get('SELECT user_id FROM prayers WHERE id = ?', [prayerId], (err, prayer) => {
        if (err) reject(err);
        else resolve(prayer);
      });
    });

    if (!prayer) {
      return res.status(404).json({ message: 'Prayer request not found' });
    }

    if (prayer.user_id !== userId) {
      return res.status(403).json({ message: 'You can only delete your own prayer requests' });
    }

    // Delete the prayer request (CASCADE will delete related responses)
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM prayers WHERE id = ?', [prayerId], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });

    res.json({ message: 'Prayer request deleted successfully' });

  } catch (error) {
    console.error('Delete prayer error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;