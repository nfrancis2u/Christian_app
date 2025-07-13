const express = require('express');
const { getDB } = require('../database/init');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Search users
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const query = req.query.q;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    if (!query || query.length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' });
    }

    const db = getDB();
    
    const users = await new Promise((resolve, reject) => {
      db.all(`
        SELECT u.id, u.username, u.first_name, u.last_name, u.avatar_url, u.church_name, 
               u.denomination, u.location, u.is_verified,
               f.status as friendship_status
        FROM users u
        LEFT JOIN friendships f ON (
          (f.requester_id = ? AND f.addressee_id = u.id) OR
          (f.addressee_id = ? AND f.requester_id = u.id)
        )
        WHERE u.id != ? AND u.is_active = 1 AND (
          u.username LIKE ? OR 
          u.first_name LIKE ? OR 
          u.last_name LIKE ? OR
          u.church_name LIKE ?
        )
        ORDER BY u.username ASC
        LIMIT ? OFFSET ?
      `, [req.user.id, req.user.id, req.user.id, `%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`, limit, offset], 
      (err, users) => {
        if (err) reject(err);
        else resolve(users);
      });
    });

    const formattedUsers = users.map(user => ({
      id: user.id,
      username: user.username,
      firstName: user.first_name,
      lastName: user.last_name,
      avatarUrl: user.avatar_url,
      churchName: user.church_name,
      denomination: user.denomination,
      location: user.location,
      isVerified: user.is_verified,
      friendshipStatus: user.friendship_status
    }));

    res.json({ 
      users: formattedUsers,
      pagination: {
        currentPage: page,
        hasNext: users.length === limit,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user profile by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.id;
    const currentUserId = req.user.id;
    
    const db = getDB();
    
    const user = await new Promise((resolve, reject) => {
      db.get(`
        SELECT u.*, f.status as friendship_status,
               CASE 
                 WHEN f.requester_id = ? THEN 'sent'
                 WHEN f.addressee_id = ? THEN 'received'
                 ELSE NULL
               END as friendship_direction
        FROM users u
        LEFT JOIN friendships f ON (
          (f.requester_id = ? AND f.addressee_id = u.id) OR
          (f.addressee_id = ? AND f.requester_id = u.id)
        )
        WHERE u.id = ? AND u.is_active = 1
      `, [currentUserId, currentUserId, currentUserId, currentUserId, userId], (err, user) => {
        if (err) reject(err);
        else resolve(user);
      });
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's recent posts
    const recentPosts = await new Promise((resolve, reject) => {
      db.all(`
        SELECT p.*, COUNT(l.id) as like_count, COUNT(c.id) as comment_count
        FROM posts p
        LEFT JOIN likes l ON p.id = l.post_id
        LEFT JOIN comments c ON p.id = c.post_id
        WHERE p.user_id = ? AND (p.is_anonymous = 0 OR p.user_id = ?)
        GROUP BY p.id
        ORDER BY p.created_at DESC
        LIMIT 5
      `, [userId, currentUserId], (err, posts) => {
        if (err) reject(err);
        else resolve(posts);
      });
    });

    // Get user's prayer requests
    const recentPrayers = await new Promise((resolve, reject) => {
      db.all(`
        SELECT p.id, p.title, p.category, p.is_urgent, p.prayer_count, p.created_at
        FROM prayers p
        WHERE p.user_id = ? AND (p.is_anonymous = 0 OR p.user_id = ?)
        ORDER BY p.created_at DESC
        LIMIT 3
      `, [userId, currentUserId], (err, prayers) => {
        if (err) reject(err);
        else resolve(prayers);
      });
    });

    const userProfile = {
      id: user.id,
      username: user.username,
      firstName: user.first_name,
      lastName: user.last_name,
      bio: user.bio,
      avatarUrl: user.avatar_url,
      churchName: user.church_name,
      denomination: user.denomination,
      location: user.location,
      spiritualGifts: user.spiritual_gifts,
      favoriteVerse: user.favorite_verse,
      isVerified: user.is_verified,
      createdAt: user.created_at,
      friendshipStatus: user.friendship_status,
      friendshipDirection: user.friendship_direction,
      recentPosts: recentPosts.map(post => ({
        id: post.id,
        content: post.content.substring(0, 100) + (post.content.length > 100 ? '...' : ''),
        postType: post.post_type,
        likesCount: post.like_count,
        commentsCount: post.comment_count,
        createdAt: post.created_at
      })),
      recentPrayers: recentPrayers.map(prayer => ({
        id: prayer.id,
        title: prayer.title,
        category: prayer.category,
        isUrgent: prayer.is_urgent,
        prayerCount: prayer.prayer_count,
        createdAt: prayer.created_at
      }))
    };

    res.json({ user: userProfile });

  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Send friend request
router.post('/:id/friend-request', authenticateToken, async (req, res) => {
  try {
    const addresseeId = req.params.id;
    const requesterId = req.user.id;
    
    if (requesterId === parseInt(addresseeId)) {
      return res.status(400).json({ message: 'Cannot send friend request to yourself' });
    }

    const db = getDB();
    
    // Check if addressee exists
    const addressee = await new Promise((resolve, reject) => {
      db.get('SELECT id FROM users WHERE id = ? AND is_active = 1', [addresseeId], (err, user) => {
        if (err) reject(err);
        else resolve(user);
      });
    });

    if (!addressee) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if friendship already exists
    const existingFriendship = await new Promise((resolve, reject) => {
      db.get(`
        SELECT * FROM friendships 
        WHERE (requester_id = ? AND addressee_id = ?) OR (requester_id = ? AND addressee_id = ?)
      `, [requesterId, addresseeId, addresseeId, requesterId], (err, friendship) => {
        if (err) reject(err);
        else resolve(friendship);
      });
    });

    if (existingFriendship) {
      return res.status(400).json({ message: 'Friend request already exists or you are already friends' });
    }

    // Create friend request
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO friendships (requester_id, addressee_id, status) VALUES (?, ?, ?)',
        [requesterId, addresseeId, 'pending'],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    res.json({ message: 'Friend request sent successfully' });

  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Respond to friend request
router.put('/friend-request/:id/:action', authenticateToken, async (req, res) => {
  try {
    const friendshipId = req.params.id;
    const action = req.params.action; // 'accept' or 'reject'
    const userId = req.user.id;
    
    if (!['accept', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action. Use accept or reject' });
    }

    const db = getDB();
    
    // Check if friendship exists and user is the addressee
    const friendship = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM friendships WHERE id = ? AND addressee_id = ? AND status = ?',
        [friendshipId, userId, 'pending'],
        (err, friendship) => {
          if (err) reject(err);
          else resolve(friendship);
        }
      );
    });

    if (!friendship) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    if (action === 'accept') {
      // Accept the friend request
      await new Promise((resolve, reject) => {
        db.run(
          'UPDATE friendships SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          ['accepted', friendshipId],
          function(err) {
            if (err) reject(err);
            else resolve();
          }
        );
      });
      
      res.json({ message: 'Friend request accepted' });
    } else {
      // Reject the friend request
      await new Promise((resolve, reject) => {
        db.run('DELETE FROM friendships WHERE id = ?', [friendshipId], function(err) {
          if (err) reject(err);
          else resolve();
        });
      });
      
      res.json({ message: 'Friend request rejected' });
    }

  } catch (error) {
    console.error('Respond to friend request error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get friend requests (received)
router.get('/friend-requests/received', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const db = getDB();
    
    const requests = await new Promise((resolve, reject) => {
      db.all(`
        SELECT f.id, f.created_at, u.id as user_id, u.username, u.first_name, u.last_name, 
               u.avatar_url, u.church_name, u.is_verified
        FROM friendships f
        JOIN users u ON f.requester_id = u.id
        WHERE f.addressee_id = ? AND f.status = 'pending'
        ORDER BY f.created_at DESC
      `, [userId], (err, requests) => {
        if (err) reject(err);
        else resolve(requests);
      });
    });

    const formattedRequests = requests.map(request => ({
      id: request.id,
      createdAt: request.created_at,
      user: {
        id: request.user_id,
        username: request.username,
        firstName: request.first_name,
        lastName: request.last_name,
        avatarUrl: request.avatar_url,
        churchName: request.church_name,
        isVerified: request.is_verified
      }
    }));

    res.json({ requests: formattedRequests });

  } catch (error) {
    console.error('Get friend requests error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get friends list
router.get('/friends', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const db = getDB();
    
    const friends = await new Promise((resolve, reject) => {
      db.all(`
        SELECT u.id, u.username, u.first_name, u.last_name, u.avatar_url, 
               u.church_name, u.location, u.is_verified, f.created_at as friendship_date
        FROM friendships f
        JOIN users u ON (
          CASE 
            WHEN f.requester_id = ? THEN u.id = f.addressee_id
            ELSE u.id = f.requester_id
          END
        )
        WHERE (f.requester_id = ? OR f.addressee_id = ?) AND f.status = 'accepted'
        ORDER BY u.first_name ASC
      `, [userId, userId, userId], (err, friends) => {
        if (err) reject(err);
        else resolve(friends);
      });
    });

    const formattedFriends = friends.map(friend => ({
      id: friend.id,
      username: friend.username,
      firstName: friend.first_name,
      lastName: friend.last_name,
      avatarUrl: friend.avatar_url,
      churchName: friend.church_name,
      location: friend.location,
      isVerified: friend.is_verified,
      friendshipDate: friend.friendship_date
    }));

    res.json({ friends: formattedFriends });

  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Remove friend
router.delete('/friends/:id', authenticateToken, async (req, res) => {
  try {
    const friendId = req.params.id;
    const userId = req.user.id;
    
    const db = getDB();
    
    // Delete friendship
    await new Promise((resolve, reject) => {
      db.run(
        'DELETE FROM friendships WHERE ((requester_id = ? AND addressee_id = ?) OR (requester_id = ? AND addressee_id = ?)) AND status = ?',
        [userId, friendId, friendId, userId, 'accepted'],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    res.json({ message: 'Friend removed successfully' });

  } catch (error) {
    console.error('Remove friend error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;