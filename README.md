# ChristianConnect - Christian Social Media Platform

A full-stack social media platform designed specifically for Christian communities. Connect with believers worldwide, share prayer requests, study scripture together, and build meaningful Christian friendships.

## 🙏 Features

### 📱 **Core Social Features**
- **User Authentication**: Secure registration and login system
- **Profile Management**: Customizable profiles with church information, denomination, and spiritual gifts
- **Posts & Timeline**: Share testimonies, encouragement, and faith-based content
- **Comments & Likes**: Engage with community posts
- **Private Messaging**: Direct communication between users
- **Friend System**: Connect with other believers

### 🕊️ **Christian-Specific Features**
- **Prayer Requests**: Share prayer needs and pray for others
- **Bible Study Groups**: Create and join Bible study communities
- **Scripture Sharing**: Share favorite Bible verses and devotionals
- **Daily Devotionals**: Access inspirational content daily
- **Verse of the Day**: Get daily Bible verses for reflection
- **Prayer Response Tracking**: See who's praying for your requests
- **Anonymous Prayer Options**: Share sensitive prayer requests anonymously

### 💬 **Real-time Features**
- **Live Messaging**: Real-time private messaging with WebSocket support
- **Prayer Notifications**: Get notified when someone posts urgent prayer requests
- **Online Status**: See who's currently online in your community
- **Real-time Updates**: Live updates for new posts and comments

### 🛡️ **Safety & Moderation**
- **Safe Environment**: Christian values-focused moderation
- **Report System**: Report inappropriate content
- **Privacy Controls**: Control who can see your posts and information
- **Verified Accounts**: Verification system for church leaders and public figures

## 🚀 Technology Stack

### Backend
- **Node.js** with **Express.js** - Server framework
- **Socket.io** - Real-time communication
- **SQLite** - Database (easily upgradeable to PostgreSQL)
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Helmet** - Security middleware
- **Rate Limiting** - API protection

### Frontend
- **React 18** - Modern React with hooks
- **React Router** - Navigation
- **React Query** - Data fetching and caching
- **Socket.io Client** - Real-time communication
- **Axios** - HTTP client
- **React Hook Form** - Form management
- **Lucide React** - Beautiful icons
- **React Toastify** - Notifications

### Database Schema
- **Users** - User profiles and authentication
- **Posts** - Community posts and content
- **Comments** - Post interactions
- **Prayers** - Prayer requests and responses
- **Messages** - Private messaging
- **Groups** - Bible study and community groups
- **Bible Verses** - Scripture database
- **Devotionals** - Daily inspirational content
- **Friendships** - User connections

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/christian-social-media.git
cd christian-social-media
```

### 2. Install Dependencies
```bash
# Install server dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# JWT Secret (Change this in production!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Database Configuration
DATABASE_URL=./server/database/christian_social.db

# Upload Configuration
UPLOAD_DIR=./server/uploads
MAX_FILE_SIZE=10485760
```

### 4. Database Setup
The SQLite database will be automatically created when you first run the server. It includes:
- All necessary tables
- Sample Bible verses
- Sample devotional content
- Proper indexes for performance

### 5. Start the Application

#### Development Mode
```bash
# Start both server and client in development mode
npm run dev

# Or start them separately:
# Terminal 1 - Start server
npm run server

# Terminal 2 - Start client
npm run client
```

#### Production Mode
```bash
# Build the client
npm run build

# Start the server
npm start
```

### 6. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api (available endpoints)

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/password` - Change password

### Posts
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create new post
- `POST /api/posts/:id/like` - Like/unlike post
- `GET /api/posts/:id/comments` - Get post comments
- `POST /api/posts/:id/comments` - Add comment
- `DELETE /api/posts/:id` - Delete post

### Prayer Requests
- `GET /api/prayers` - Get prayer requests
- `POST /api/prayers` - Create prayer request
- `POST /api/prayers/:id/pray` - Respond to prayer
- `GET /api/prayers/:id/responses` - Get prayer responses
- `PUT /api/prayers/:id/answer` - Mark prayer as answered

### Messages
- `GET /api/messages/conversations` - Get user conversations
- `GET /api/messages/with/:userId` - Get messages with user
- `POST /api/messages/send` - Send message
- `GET /api/messages/unread-count` - Get unread count

### Groups
- `GET /api/groups` - Get all groups
- `POST /api/groups` - Create group
- `GET /api/groups/:id` - Get group details
- `POST /api/groups/:id/join` - Join group
- `POST /api/groups/:id/leave` - Leave group

### Users
- `GET /api/users/search` - Search users
- `GET /api/users/:id` - Get user profile
- `POST /api/users/:id/friend-request` - Send friend request
- `GET /api/users/friend-requests/received` - Get friend requests
- `GET /api/users/friends` - Get friends list

### Bible Verses
- `GET /api/verses/verse-of-the-day` - Get daily verse
- `GET /api/verses/search` - Search verses
- `GET /api/verses/devotional/today` - Get today's devotional
- `GET /api/verses/inspiration` - Get inspirational verses

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt for secure password storage
- **Rate Limiting** - API protection against abuse
- **Input Validation** - Comprehensive input sanitization
- **CORS Protection** - Proper cross-origin resource sharing
- **Security Headers** - Helmet.js for security headers
- **SQL Injection Prevention** - Parameterized queries

## 📱 Mobile Responsive

The application is fully responsive and works great on:
- Desktop computers
- Tablets
- Mobile phones
- Different screen sizes and orientations

## 🎨 Christian Design Elements

- **Beautiful gradients** for spiritual content
- **Inspirational color schemes** 
- **Faith-focused iconography**
- **Peaceful and calming UI**
- **Accessible design** for all users

## 🚀 Deployment

### Heroku Deployment
1. Create a Heroku app
2. Set environment variables in Heroku dashboard
3. Connect your GitHub repository
4. Deploy the application

### Railway Deployment
1. Connect your GitHub repository to Railway
2. Set environment variables
3. Deploy with automatic builds

### Docker Deployment
```bash
# Build and run with Docker
docker build -t christian-social-media .
docker run -p 5000:5000 christian-social-media
```

## 🤝 Contributing

We welcome contributions from the Christian developer community! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Development Guidelines
- Follow Christian values in all contributions
- Write clean, documented code
- Test your changes thoroughly
- Be respectful in all interactions

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Support

If you find this project helpful, please consider:
- ⭐ Starring the repository
- 🐛 Reporting bugs
- 💡 Suggesting new features
- 🙏 Praying for the project and its users

## 📧 Contact

For questions, suggestions, or support:
- **Email**: support@christianconnect.app
- **GitHub Issues**: [Create an issue](https://github.com/yourusername/christian-social-media/issues)
- **Community**: Join our Discord server for developers

---

*"And let us consider how we may spur one another on toward love and good deeds, not giving up meeting together, as some are in the habit of doing, but encouraging one another—and all the more as you see the Day approaching." - Hebrews 10:24-25*

**Made with ❤️ for the body of Christ**