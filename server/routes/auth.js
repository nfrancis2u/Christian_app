const express = require('express');
const bcrypt = require('bcryptjs');
const { getDB } = require('../database/init');
const { generateToken, authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      firstName,
      lastName,
      churchName,
      denomination,
      location
    } = req.body;

    // Validate required fields
    if (!username || !email || !password || !firstName || !lastName) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const db = getDB();
    
    // Check if user already exists
    const existingUser = await new Promise((resolve, reject) => {
      db.get('SELECT id FROM users WHERE username = ? OR email = ?', [username, email], (err, user) => {
        if (err) reject(err);
        else resolve(user);
      });
    });

    if (existingUser) {
      return res.status(409).json({ message: 'Username or email already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert new user
    const result = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO users (username, email, password_hash, first_name, last_name, church_name, denomination, location) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [username, email, passwordHash, firstName, lastName, churchName || null, denomination || null, location || null],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });

    // Get the created user
    const newUser = await new Promise((resolve, reject) => {
      db.get('SELECT id, username, email, first_name, last_name, church_name, denomination, location FROM users WHERE id = ?', 
        [result.id], (err, user) => {
          if (err) reject(err);
          else resolve(user);
        });
    });

    // Generate JWT token
    const token = generateToken(newUser);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        firstName: newUser.first_name,
        lastName: newUser.last_name,
        churchName: newUser.church_name,
        denomination: newUser.denomination,
        location: newUser.location
      },
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const db = getDB();
    
    // Find user by username or email
    const user = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE (username = ? OR email = ?) AND is_active = 1', 
        [username, username], (err, user) => {
          if (err) reject(err);
          else resolve(user);
        });
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        bio: user.bio,
        avatarUrl: user.avatar_url,
        churchName: user.church_name,
        denomination: user.denomination,
        location: user.location,
        spiritualGifts: user.spiritual_gifts,
        favoriteVerse: user.favorite_verse,
        isVerified: user.is_verified
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const db = getDB();
    
    const user = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE id = ? AND is_active = 1', [req.user.id], (err, user) => {
        if (err) reject(err);
        else resolve(user);
      });
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        bio: user.bio,
        avatarUrl: user.avatar_url,
        churchName: user.church_name,
        denomination: user.denomination,
        location: user.location,
        spiritualGifts: user.spiritual_gifts,
        favoriteVerse: user.favorite_verse,
        prayerLanguage: user.prayer_language,
        isVerified: user.is_verified,
        createdAt: user.created_at
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      bio,
      churchName,
      denomination,
      location,
      spiritualGifts,
      favoriteVerse,
      prayerLanguage
    } = req.body;

    const db = getDB();
    
    // Update user profile
    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE users SET 
         first_name = ?, last_name = ?, bio = ?, church_name = ?, 
         denomination = ?, location = ?, spiritual_gifts = ?, 
         favorite_verse = ?, prayer_language = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [firstName, lastName, bio, churchName, denomination, location, 
         spiritualGifts, favoriteVerse, prayerLanguage, req.user.id],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    // Get updated user
    const updatedUser = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE id = ?', [req.user.id], (err, user) => {
        if (err) reject(err);
        else resolve(user);
      });
    });

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        firstName: updatedUser.first_name,
        lastName: updatedUser.last_name,
        bio: updatedUser.bio,
        avatarUrl: updatedUser.avatar_url,
        churchName: updatedUser.church_name,
        denomination: updatedUser.denomination,
        location: updatedUser.location,
        spiritualGifts: updatedUser.spiritual_gifts,
        favoriteVerse: updatedUser.favorite_verse,
        prayerLanguage: updatedUser.prayer_language,
        isVerified: updatedUser.is_verified
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Change password
router.put('/password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    const db = getDB();
    
    // Get user's current password hash
    const user = await new Promise((resolve, reject) => {
      db.get('SELECT password_hash FROM users WHERE id = ?', [req.user.id], (err, user) => {
        if (err) reject(err);
        else resolve(user);
      });
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await new Promise((resolve, reject) => {
      db.run('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', 
        [newPasswordHash, req.user.id], function(err) {
          if (err) reject(err);
          else resolve();
        });
    });

    res.json({ message: 'Password updated successfully' });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;