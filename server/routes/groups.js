const express = require('express');
const { getDB } = require('../database/init');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all groups
router.get('/', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const groupType = req.query.type || 'all';
    
    const db = getDB();
    
    let whereClause = 'WHERE g.is_private = 0';
    const params = [];
    
    if (groupType !== 'all') {
      whereClause += ' AND g.group_type = ?';
      params.push(groupType);
    }
    
    const groups = await new Promise((resolve, reject) => {
      db.all(`
        SELECT g.*, u.username as creator_username, u.first_name as creator_first_name, 
               u.last_name as creator_last_name, u.avatar_url as creator_avatar_url,
               gm.role as user_role
        FROM groups g
        JOIN users u ON g.creator_id = u.id
        LEFT JOIN group_members gm ON g.id = gm.group_id AND gm.user_id = ?
        ${whereClause}
        ORDER BY g.created_at DESC
        LIMIT ? OFFSET ?
      `, [req.user.id, ...params, limit, offset], (err, groups) => {
        if (err) reject(err);
        else resolve(groups);
      });
    });

    const formattedGroups = groups.map(group => ({
      id: group.id,
      name: group.name,
      description: group.description,
      imageUrl: group.image_url,
      groupType: group.group_type,
      isPrivate: group.is_private,
      memberCount: group.member_count,
      createdAt: group.created_at,
      creator: {
        id: group.creator_id,
        username: group.creator_username,
        firstName: group.creator_first_name,
        lastName: group.creator_last_name,
        avatarUrl: group.creator_avatar_url
      },
      userRole: group.user_role || null,
      isMember: group.user_role !== null
    }));

    res.json({
      groups: formattedGroups,
      pagination: {
        currentPage: page,
        hasNext: groups.length === limit,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user's groups
router.get('/my-groups', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const db = getDB();
    
    const groups = await new Promise((resolve, reject) => {
      db.all(`
        SELECT g.*, u.username as creator_username, u.first_name as creator_first_name, 
               u.last_name as creator_last_name, u.avatar_url as creator_avatar_url,
               gm.role as user_role, gm.joined_at
        FROM groups g
        JOIN users u ON g.creator_id = u.id
        JOIN group_members gm ON g.id = gm.group_id
        WHERE gm.user_id = ?
        ORDER BY gm.joined_at DESC
      `, [userId], (err, groups) => {
        if (err) reject(err);
        else resolve(groups);
      });
    });

    const formattedGroups = groups.map(group => ({
      id: group.id,
      name: group.name,
      description: group.description,
      imageUrl: group.image_url,
      groupType: group.group_type,
      isPrivate: group.is_private,
      memberCount: group.member_count,
      createdAt: group.created_at,
      joinedAt: group.joined_at,
      creator: {
        id: group.creator_id,
        username: group.creator_username,
        firstName: group.creator_first_name,
        lastName: group.creator_last_name,
        avatarUrl: group.creator_avatar_url
      },
      userRole: group.user_role,
      isMember: true
    }));

    res.json({ groups: formattedGroups });

  } catch (error) {
    console.error('Get user groups error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new group
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      name,
      description,
      imageUrl,
      groupType,
      isPrivate
    } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: 'Group name is required' });
    }

    const db = getDB();
    
    const result = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO groups (name, description, creator_id, image_url, group_type, is_private, member_count) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [name, description || null, req.user.id, imageUrl || null, groupType || 'bible_study', isPrivate || false, 1],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });

    // Add creator as admin member
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO group_members (group_id, user_id, role) VALUES (?, ?, ?)',
        [result.id, req.user.id, 'admin'],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    // Get the created group with creator info
    const newGroup = await new Promise((resolve, reject) => {
      db.get(`
        SELECT g.*, u.username as creator_username, u.first_name as creator_first_name, 
               u.last_name as creator_last_name, u.avatar_url as creator_avatar_url
        FROM groups g
        JOIN users u ON g.creator_id = u.id
        WHERE g.id = ?
      `, [result.id], (err, group) => {
        if (err) reject(err);
        else resolve(group);
      });
    });

    res.status(201).json({
      message: 'Group created successfully',
      group: {
        id: newGroup.id,
        name: newGroup.name,
        description: newGroup.description,
        imageUrl: newGroup.image_url,
        groupType: newGroup.group_type,
        isPrivate: newGroup.is_private,
        memberCount: newGroup.member_count,
        createdAt: newGroup.created_at,
        creator: {
          id: newGroup.creator_id,
          username: newGroup.creator_username,
          firstName: newGroup.creator_first_name,
          lastName: newGroup.creator_last_name,
          avatarUrl: newGroup.creator_avatar_url
        },
        userRole: 'admin',
        isMember: true
      }
    });

  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get group details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const groupId = req.params.id;
    const userId = req.user.id;
    
    const db = getDB();
    
    const group = await new Promise((resolve, reject) => {
      db.get(`
        SELECT g.*, u.username as creator_username, u.first_name as creator_first_name, 
               u.last_name as creator_last_name, u.avatar_url as creator_avatar_url,
               gm.role as user_role
        FROM groups g
        JOIN users u ON g.creator_id = u.id
        LEFT JOIN group_members gm ON g.id = gm.group_id AND gm.user_id = ?
        WHERE g.id = ?
      `, [userId, groupId], (err, group) => {
        if (err) reject(err);
        else resolve(group);
      });
    });

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user can access private group
    if (group.is_private && !group.user_role) {
      return res.status(403).json({ message: 'Access denied to private group' });
    }

    // Get group members
    const members = await new Promise((resolve, reject) => {
      db.all(`
        SELECT gm.*, u.username, u.first_name, u.last_name, u.avatar_url, u.is_verified
        FROM group_members gm
        JOIN users u ON gm.user_id = u.id
        WHERE gm.group_id = ?
        ORDER BY gm.role DESC, gm.joined_at ASC
      `, [groupId], (err, members) => {
        if (err) reject(err);
        else resolve(members);
      });
    });

    const formattedMembers = members.map(member => ({
      id: member.id,
      role: member.role,
      joinedAt: member.joined_at,
      user: {
        id: member.user_id,
        username: member.username,
        firstName: member.first_name,
        lastName: member.last_name,
        avatarUrl: member.avatar_url,
        isVerified: member.is_verified
      }
    }));

    const groupDetails = {
      id: group.id,
      name: group.name,
      description: group.description,
      imageUrl: group.image_url,
      groupType: group.group_type,
      isPrivate: group.is_private,
      memberCount: group.member_count,
      createdAt: group.created_at,
      creator: {
        id: group.creator_id,
        username: group.creator_username,
        firstName: group.creator_first_name,
        lastName: group.creator_last_name,
        avatarUrl: group.creator_avatar_url
      },
      userRole: group.user_role,
      isMember: group.user_role !== null,
      members: formattedMembers
    };

    res.json({ group: groupDetails });

  } catch (error) {
    console.error('Get group details error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Join group
router.post('/:id/join', authenticateToken, async (req, res) => {
  try {
    const groupId = req.params.id;
    const userId = req.user.id;
    
    const db = getDB();
    
    // Check if group exists and is not private
    const group = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM groups WHERE id = ?', [groupId], (err, group) => {
        if (err) reject(err);
        else resolve(group);
      });
    });

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (group.is_private) {
      return res.status(403).json({ message: 'Cannot join private group without invitation' });
    }

    // Check if user is already a member
    const existingMember = await new Promise((resolve, reject) => {
      db.get('SELECT id FROM group_members WHERE group_id = ? AND user_id = ?', 
        [groupId, userId], (err, member) => {
          if (err) reject(err);
          else resolve(member);
        });
    });

    if (existingMember) {
      return res.status(400).json({ message: 'You are already a member of this group' });
    }

    // Add user to group
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO group_members (group_id, user_id, role) VALUES (?, ?, ?)',
        [groupId, userId, 'member'],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    // Update member count
    await new Promise((resolve, reject) => {
      db.run('UPDATE groups SET member_count = member_count + 1 WHERE id = ?', 
        [groupId], function(err) {
          if (err) reject(err);
          else resolve();
        });
    });

    res.json({ message: 'Successfully joined group' });

  } catch (error) {
    console.error('Join group error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Leave group
router.post('/:id/leave', authenticateToken, async (req, res) => {
  try {
    const groupId = req.params.id;
    const userId = req.user.id;
    
    const db = getDB();
    
    // Check if user is a member
    const member = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM group_members WHERE group_id = ? AND user_id = ?', 
        [groupId, userId], (err, member) => {
          if (err) reject(err);
          else resolve(member);
        });
    });

    if (!member) {
      return res.status(404).json({ message: 'You are not a member of this group' });
    }

    // Check if user is the creator
    const group = await new Promise((resolve, reject) => {
      db.get('SELECT creator_id FROM groups WHERE id = ?', [groupId], (err, group) => {
        if (err) reject(err);
        else resolve(group);
      });
    });

    if (group.creator_id === userId) {
      return res.status(400).json({ message: 'Group creator cannot leave the group. Transfer ownership first.' });
    }

    // Remove user from group
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM group_members WHERE group_id = ? AND user_id = ?', 
        [groupId, userId], function(err) {
          if (err) reject(err);
          else resolve();
        });
    });

    // Update member count
    await new Promise((resolve, reject) => {
      db.run('UPDATE groups SET member_count = member_count - 1 WHERE id = ?', 
        [groupId], function(err) {
          if (err) reject(err);
          else resolve();
        });
    });

    res.json({ message: 'Successfully left group' });

  } catch (error) {
    console.error('Leave group error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get group types
router.get('/types', async (req, res) => {
  try {
    const groupTypes = [
      { value: 'bible_study', label: 'Bible Study' },
      { value: 'prayer_group', label: 'Prayer Group' },
      { value: 'youth_group', label: 'Youth Group' },
      { value: 'women_ministry', label: 'Women\'s Ministry' },
      { value: 'men_ministry', label: 'Men\'s Ministry' },
      { value: 'worship_team', label: 'Worship Team' },
      { value: 'missions', label: 'Missions' },
      { value: 'church_leadership', label: 'Church Leadership' },
      { value: 'small_group', label: 'Small Group' },
      { value: 'support_group', label: 'Support Group' },
      { value: 'other', label: 'Other' }
    ];

    res.json({ groupTypes });

  } catch (error) {
    console.error('Get group types error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete group (only by creator)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const groupId = req.params.id;
    const userId = req.user.id;
    
    const db = getDB();
    
    // Check if user is the creator
    const group = await new Promise((resolve, reject) => {
      db.get('SELECT creator_id FROM groups WHERE id = ?', [groupId], (err, group) => {
        if (err) reject(err);
        else resolve(group);
      });
    });

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (group.creator_id !== userId) {
      return res.status(403).json({ message: 'Only the group creator can delete the group' });
    }

    // Delete the group (CASCADE will delete group members)
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM groups WHERE id = ?', [groupId], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });

    res.json({ message: 'Group deleted successfully' });

  } catch (error) {
    console.error('Delete group error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;