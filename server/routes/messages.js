const express = require('express');
const { getDB } = require('../database/init');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get user's conversations
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const db = getDB();
    
    const conversations = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          CASE 
            WHEN m.sender_id = ? THEN m.receiver_id 
            ELSE m.sender_id 
          END as other_user_id,
          u.username, u.first_name, u.last_name, u.avatar_url, u.is_verified,
          m.content as last_message,
          m.created_at as last_message_time,
          m.sender_id as last_message_sender_id,
          COUNT(CASE WHEN m.receiver_id = ? AND m.is_read = 0 THEN 1 END) as unread_count
        FROM messages m
        JOIN users u ON (
          CASE 
            WHEN m.sender_id = ? THEN u.id = m.receiver_id
            ELSE u.id = m.sender_id
          END
        )
        WHERE m.sender_id = ? OR m.receiver_id = ?
        GROUP BY other_user_id
        HAVING m.created_at = MAX(m.created_at)
        ORDER BY m.created_at DESC
      `, [userId, userId, userId, userId, userId], (err, conversations) => {
        if (err) reject(err);
        else resolve(conversations);
      });
    });

    const formattedConversations = conversations.map(conv => ({
      userId: conv.other_user_id,
      user: {
        id: conv.other_user_id,
        username: conv.username,
        firstName: conv.first_name,
        lastName: conv.last_name,
        avatarUrl: conv.avatar_url,
        isVerified: conv.is_verified
      },
      lastMessage: conv.last_message,
      lastMessageTime: conv.last_message_time,
      isLastMessageFromMe: conv.last_message_sender_id === userId,
      unreadCount: conv.unread_count
    }));

    res.json({ conversations: formattedConversations });

  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get messages with a specific user
router.get('/with/:userId', authenticateToken, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const otherUserId = req.params.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    
    const db = getDB();
    
    const messages = await new Promise((resolve, reject) => {
      db.all(`
        SELECT m.*, 
               s.username as sender_username, s.first_name as sender_first_name, 
               s.last_name as sender_last_name, s.avatar_url as sender_avatar_url,
               r.username as receiver_username, r.first_name as receiver_first_name, 
               r.last_name as receiver_last_name, r.avatar_url as receiver_avatar_url
        FROM messages m
        JOIN users s ON m.sender_id = s.id
        JOIN users r ON m.receiver_id = r.id
        WHERE (m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?)
        ORDER BY m.created_at DESC
        LIMIT ? OFFSET ?
      `, [currentUserId, otherUserId, otherUserId, currentUserId, limit, offset], (err, messages) => {
        if (err) reject(err);
        else resolve(messages);
      });
    });

    // Mark messages as read
    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE messages SET is_read = 1 WHERE sender_id = ? AND receiver_id = ? AND is_read = 0',
        [otherUserId, currentUserId],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    const formattedMessages = messages.reverse().map(msg => ({
      id: msg.id,
      content: msg.content,
      messageType: msg.message_type,
      isRead: msg.is_read,
      createdAt: msg.created_at,
      sender: {
        id: msg.sender_id,
        username: msg.sender_username,
        firstName: msg.sender_first_name,
        lastName: msg.sender_last_name,
        avatarUrl: msg.sender_avatar_url
      },
      receiver: {
        id: msg.receiver_id,
        username: msg.receiver_username,
        firstName: msg.receiver_first_name,
        lastName: msg.receiver_last_name,
        avatarUrl: msg.receiver_avatar_url
      },
      isFromMe: msg.sender_id === currentUserId
    }));

    res.json({ 
      messages: formattedMessages,
      pagination: {
        currentPage: page,
        hasNext: messages.length === limit,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Send a message
router.post('/send', authenticateToken, async (req, res) => {
  try {
    const { receiverId, content, messageType } = req.body;
    const senderId = req.user.id;

    if (!receiverId || !content) {
      return res.status(400).json({ message: 'Receiver ID and content are required' });
    }

    if (senderId === parseInt(receiverId)) {
      return res.status(400).json({ message: 'Cannot send message to yourself' });
    }

    const db = getDB();
    
    // Check if receiver exists
    const receiver = await new Promise((resolve, reject) => {
      db.get('SELECT id, username, first_name, last_name FROM users WHERE id = ? AND is_active = 1', 
        [receiverId], (err, user) => {
          if (err) reject(err);
          else resolve(user);
        });
    });

    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    // Insert message
    const result = await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO messages (sender_id, receiver_id, content, message_type) VALUES (?, ?, ?, ?)',
        [senderId, receiverId, content, messageType || 'text'],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });

    // Get the created message with user info
    const newMessage = await new Promise((resolve, reject) => {
      db.get(`
        SELECT m.*, 
               s.username as sender_username, s.first_name as sender_first_name, 
               s.last_name as sender_last_name, s.avatar_url as sender_avatar_url
        FROM messages m
        JOIN users s ON m.sender_id = s.id
        WHERE m.id = ?
      `, [result.id], (err, message) => {
        if (err) reject(err);
        else resolve(message);
      });
    });

    res.status(201).json({
      message: 'Message sent successfully',
      messageData: {
        id: newMessage.id,
        content: newMessage.content,
        messageType: newMessage.message_type,
        isRead: false,
        createdAt: newMessage.created_at,
        sender: {
          id: newMessage.sender_id,
          username: newMessage.sender_username,
          firstName: newMessage.sender_first_name,
          lastName: newMessage.sender_last_name,
          avatarUrl: newMessage.sender_avatar_url
        },
        receiver: {
          id: receiver.id,
          username: receiver.username,
          firstName: receiver.first_name,
          lastName: receiver.last_name
        },
        isFromMe: true
      }
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Mark message as read
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const messageId = req.params.id;
    const userId = req.user.id;
    
    const db = getDB();
    
    // Update message as read (only if user is the receiver)
    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE messages SET is_read = 1 WHERE id = ? AND receiver_id = ?',
        [messageId, userId],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    res.json({ message: 'Message marked as read' });

  } catch (error) {
    console.error('Mark message as read error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get unread message count
router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const db = getDB();
    
    const result = await new Promise((resolve, reject) => {
      db.get(
        'SELECT COUNT(*) as unread_count FROM messages WHERE receiver_id = ? AND is_read = 0',
        [userId],
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });

    res.json({ unreadCount: result.unread_count });

  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete message (only by sender)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const messageId = req.params.id;
    const userId = req.user.id;
    
    const db = getDB();
    
    // Check if user owns the message
    const message = await new Promise((resolve, reject) => {
      db.get('SELECT sender_id FROM messages WHERE id = ?', [messageId], (err, message) => {
        if (err) reject(err);
        else resolve(message);
      });
    });

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.sender_id !== userId) {
      return res.status(403).json({ message: 'You can only delete your own messages' });
    }

    // Delete the message
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM messages WHERE id = ?', [messageId], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });

    res.json({ message: 'Message deleted successfully' });

  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;