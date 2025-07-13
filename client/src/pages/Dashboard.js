import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Heart, Users, MessageCircle, Plus, Calendar, Clock } from 'lucide-react';

function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Welcome Message */}
            <div className="bg-white rounded-lg shadow-sm p-6 border">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to ChristianConnect</h1>
              <p className="text-gray-600">
                Connect with believers, share your faith journey, and grow in community.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6 border">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link
                  to="/posts"
                  className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <MessageCircle className="w-8 h-8 text-blue-600 mb-2" />
                  <span className="text-sm font-medium text-blue-900">Share Post</span>
                </Link>
                
                <Link
                  to="/prayers"
                  className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <Heart className="w-8 h-8 text-purple-600 mb-2" />
                  <span className="text-sm font-medium text-purple-900">Prayer Request</span>
                </Link>
                
                <Link
                  to="/groups"
                  className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <Users className="w-8 h-8 text-green-600 mb-2" />
                  <span className="text-sm font-medium text-green-900">Join Group</span>
                </Link>
                
                <Link
                  to="/verses"
                  className="flex flex-col items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                >
                  <BookOpen className="w-8 h-8 text-orange-600 mb-2" />
                  <span className="text-sm font-medium text-orange-900">Read Scripture</span>
                </Link>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm p-6 border">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {/* Sample Activity Items */}
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">Sarah Johnson</span> shared a testimony about God's faithfulness
                    </p>
                    <p className="text-xs text-gray-500 flex items-center mt-1">
                      <Clock className="w-3 h-3 mr-1" />
                      2 hours ago
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Heart className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">Michael Chen</span> requested prayer for healing
                    </p>
                    <p className="text-xs text-gray-500 flex items-center mt-1">
                      <Clock className="w-3 h-3 mr-1" />
                      4 hours ago
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">Bible Study Group</span> started a discussion on Romans 8
                    </p>
                    <p className="text-xs text-gray-500 flex items-center mt-1">
                      <Clock className="w-3 h-3 mr-1" />
                      1 day ago
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Verse of the Day */}
            <div className="verse-card">
              <div className="flex items-center mb-4">
                <BookOpen className="w-6 h-6 mr-2" />
                <h3 className="text-lg font-semibold">Verse of the Day</h3>
              </div>
              <blockquote className="text-lg mb-4 italic">
                "For I know the plans I have for you," declares the Lord, "plans to prosper you and not to harm you, plans to give you hope and a future."
              </blockquote>
              <cite className="text-sm opacity-90">- Jeremiah 29:11</cite>
            </div>

            {/* Prayer Requests */}
            <div className="bg-white rounded-lg shadow-sm p-6 border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Prayer Requests</h3>
                <Link to="/prayers" className="text-sm text-primary hover:text-blue-600">
                  View All
                </Link>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-red-900">🔥 Urgent</span>
                    <span className="text-xs text-red-700">12 praying</span>
                  </div>
                  <p className="text-sm text-red-800">Pray for John's surgery tomorrow</p>
                </div>
                
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-blue-900">Family</span>
                    <span className="text-xs text-blue-700">8 praying</span>
                  </div>
                  <p className="text-sm text-blue-800">Wisdom for parenting decisions</p>
                </div>
                
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-green-900">Praise</span>
                    <span className="text-xs text-green-700">15 praying</span>
                  </div>
                  <p className="text-sm text-green-800">Thank God for new job opportunity!</p>
                </div>
              </div>
            </div>

            {/* Daily Devotional */}
            <div className="devotional-card">
              <div className="flex items-center mb-4">
                <Calendar className="w-6 h-6 mr-2" />
                <h3 className="text-lg font-semibold">Today's Devotional</h3>
              </div>
              <h4 className="text-xl font-semibold mb-3">Walking in Faith</h4>
              <p className="text-sm opacity-90 mb-4">
                Faith is not just believing in God, but trusting Him completely with your life. When we face challenges, we can remember that God is always with us...
              </p>
              <Link
                to="/verses"
                className="inline-flex items-center text-sm font-medium bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-2 rounded-lg transition-all"
              >
                Read More
                <Plus className="w-4 h-4 ml-1" />
              </Link>
            </div>

            {/* Community Stats */}
            <div className="bg-white rounded-lg shadow-sm p-6 border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Community</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Members</span>
                  <span className="text-sm font-semibold text-gray-900">2,547</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Online Now</span>
                  <span className="text-sm font-semibold text-green-600">124</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Prayers Today</span>
                  <span className="text-sm font-semibold text-purple-600">89</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Groups</span>
                  <span className="text-sm font-semibold text-blue-600">45</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;