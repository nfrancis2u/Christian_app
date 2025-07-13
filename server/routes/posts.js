const express = require('express');
const { getDB } = require('../database/init');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Get all posts (with pagination)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const postType = req.query.type || 'all';
    
    const db = getDB();
    
    let whereClause = '';
    const params = [];
    
    if (postType !== 'all') {
      whereClause = 'WHERE p.post_type = ?';
      params.push(postType);
    }
    
    const posts = await new Promise((resolve, reject) => {
      db.all(`
        SELECT p.*, u.username, u.first_name, u.last_name, u.avatar_url, u.is_verified,
               COUNT(l.id) as like_count,
               COUNT(c.id) as comment_count,
               ${req.user ? `MAX(CASE WHEN l.user_id = ? THEN 1 ELSE 0 END) as user_liked` : '0 as user_liked'}
        FROM posts p
        JOIN users u ON p.user_id = u.id
        LEFT JOIN likes l ON p.id = l.post_id
        LEFT JOIN comments c ON p.id = c.post_id
        ${whereClause}
        GROUP BY p.id
        ORDER BY p.created_at DESC
        LIMIT ? OFFSET ?
      `, req.user ? [req.user.id, ...params, limit, offset] : [...params, limit, offset], (err, posts) => {
        if (err) reject(err);
        else resolve(posts);
      });
    });

    const formattedPosts = posts.map(post => ({
      id: post.id,
      content: post.content,
      imageUrl: post.image_url,
      postType: post.post_type,
      scriptureReference: post.scripture_reference,
      prayerCategory: post.prayer_category,
      isAnonymous: post.is_anonymous,
      likesCount: post.like_count,
      commentsCount: post.comment_count,
      userLiked: post.user_liked === 1,
      createdAt: post.created_at,
      user: post.is_anonymous ? {
        id: null,
        username: 'Anonymous',
        firstName: 'Anonymous',
        lastName: 'User',
        avatarUrl: null,
        isVerified: false
      } : {
        id: post.user_id,
        username: post.username,
        firstName: post.first_name,
        lastName: post.last_name,
        avatarUrl: post.avatar_url,
        isVerified: post.is_verified
      }
    }));

    res.json({
      posts: formattedPosts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(posts.length / limit),
        hasNext: posts.length === limit,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new post
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      content,
      imageUrl,
      postType,
      scriptureReference,
      prayerCategory,
      isAnonymous
    } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Post content is required' });
    }

    const db = getDB();
    
    const result = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO posts (user_id, content, image_url, post_type, scripture_reference, prayer_category, is_anonymous) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [req.user.id, content, imageUrl || null, postType || 'general', scriptureReference || null, 
         prayerCategory || null, isAnonymous || false],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });

    // Get the created post with user info
    const newPost = await new Promise((resolve, reject) => {
      db.get(`
        SELECT p.*, u.username, u.first_name, u.last_name, u.avatar_url, u.is_verified
        FROM posts p
        JOIN users u ON p.user_id = u.id
        WHERE p.id = ?
      `, [result.id], (err, post) => {
        if (err) reject(err);
        else resolve(post);
      });
    });

    res.status(201).json({
      message: 'Post created successfully',
      post: {
        id: newPost.id,
        content: newPost.content,
        imageUrl: newPost.image_url,
        postType: newPost.post_type,
        scriptureReference: newPost.scripture_reference,
        prayerCategory: newPost.prayer_category,
        isAnonymous: newPost.is_anonymous,
        likesCount: 0,
        commentsCount: 0,
        userLiked: false,
        createdAt: newPost.created_at,
        user: newPost.is_anonymous ? {
          id: null,
          username: 'Anonymous',
          firstName: 'Anonymous',
          lastName: 'User',
          avatarUrl: null,
          isVerified: false
        } : {
          id: newPost.user_id,
          username: newPost.username,
          firstName: newPost.first_name,
          lastName: newPost.last_name,
          avatarUrl: newPost.avatar_url,
          isVerified: newPost.is_verified
        }
      }
    });

  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Like/Unlike post
router.post('/:id/like', authenticateToken, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;
    
    const db = getDB();
    
    // Check if user already liked this post
    const existingLike = await new Promise((resolve, reject) => {
      db.get('SELECT id FROM likes WHERE user_id = ? AND post_id = ?', [userId, postId], (err, like) => {
        if (err) reject(err);
        else resolve(like);
      });
    });

    if (existingLike) {
      // Unlike the post
      await new Promise((resolve, reject) => {
        db.run('DELETE FROM likes WHERE user_id = ? AND post_id = ?', [userId, postId], function(err) {
          if (err) reject(err);
          else resolve();
        });
      });
      
      // Update post likes count
      await new Promise((resolve, reject) => {
        db.run('UPDATE posts SET likes_count = likes_count - 1 WHERE id = ?', [postId], function(err) {
          if (err) reject(err);
          else resolve();
        });
      });
      
      res.json({ message: 'Post unliked successfully', liked: false });
    } else {
      // Like the post
      await new Promise((resolve, reject) => {
        db.run('INSERT INTO likes (user_id, post_id) VALUES (?, ?)', [userId, postId], function(err) {
          if (err) reject(err);
          else resolve();
        });
      });
      
      // Update post likes count
      await new Promise((resolve, reject) => {
        db.run('UPDATE posts SET likes_count = likes_count + 1 WHERE id = ?', [postId], function(err) {
          if (err) reject(err);
          else resolve();
        });
      });
      
      res.json({ message: 'Post liked successfully', liked: true });
    }

  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get comments for a post
router.get('/:id/comments', optionalAuth, async (req, res) => {
  try {
    const postId = req.params.id;
    const db = getDB();
    
    const comments = await new Promise((resolve, reject) => {
      db.all(`
        SELECT c.*, u.username, u.first_name, u.last_name, u.avatar_url, u.is_verified,
               COUNT(l.id) as like_count,
               ${req.user ? `MAX(CASE WHEN l.user_id = ? THEN 1 ELSE 0 END) as user_liked` : '0 as user_liked'}
        FROM comments c
        JOIN users u ON c.user_id = u.id
        LEFT JOIN likes l ON c.id = l.comment_id
        WHERE c.post_id = ?
        GROUP BY c.id
        ORDER BY c.created_at ASC
      `, req.user ? [req.user.id, postId] : [postId], (err, comments) => {
        if (err) reject(err);
        else resolve(comments);
      });
    });

    const formattedComments = comments.map(comment => ({
      id: comment.id,
      content: comment.content,
      likesCount: comment.like_count,
      userLiked: comment.user_liked === 1,
      createdAt: comment.created_at,
      user: {
        id: comment.user_id,
        username: comment.username,
        firstName: comment.first_name,
        lastName: comment.last_name,
        avatarUrl: comment.avatar_url,
        isVerified: comment.is_verified
      }
    }));

    res.json({ comments: formattedComments });

  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Add comment to post
router.post('/:id/comments', authenticateToken, async (req, res) => {
  try {
    const postId = req.params.id;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    const db = getDB();
    
    const result = await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)',
        [postId, req.user.id, content],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });

    // Update post comments count
    await new Promise((resolve, reject) => {
      db.run('UPDATE posts SET comments_count = comments_count + 1 WHERE id = ?', [postId], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });

    // Get the created comment with user info
    const newComment = await new Promise((resolve, reject) => {
      db.get(`
        SELECT c.*, u.username, u.first_name, u.last_name, u.avatar_url, u.is_verified
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.id = ?
      `, [result.id], (err, comment) => {
        if (err) reject(err);
        else resolve(comment);
      });
    });

    res.status(201).json({
      message: 'Comment added successfully',
      comment: {
        id: newComment.id,
        content: newComment.content,
        likesCount: 0,
        userLiked: false,
        createdAt: newComment.created_at,
        user: {
          id: newComment.user_id,
          username: newComment.username,
          firstName: newComment.first_name,
          lastName: newComment.last_name,
          avatarUrl: newComment.avatar_url,
          isVerified: newComment.is_verified
        }
      }
    });

  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete post (only by author)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;
    
    const db = getDB();
    
    // Check if user owns the post
    const post = await new Promise((resolve, reject) => {
      db.get('SELECT user_id FROM posts WHERE id = ?', [postId], (err, post) => {
        if (err) reject(err);
        else resolve(post);
      });
    });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.user_id !== userId) {
      return res.status(403).json({ message: 'You can only delete your own posts' });
    }

    // Delete the post (CASCADE will delete related likes and comments)
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM posts WHERE id = ?', [postId], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });

    res.json({ message: 'Post deleted successfully' });

  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;