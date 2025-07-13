import React from 'react';
import { BookOpen } from 'lucide-react';

function Verses() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center mb-4">
              <BookOpen className="w-6 h-6 text-orange-600 mr-2" />
              <h1 className="text-2xl font-bold text-gray-900">Bible Verses</h1>
            </div>
            <p className="text-gray-600 mb-6">
              Discover, share, and meditate on God's Word with daily verses and devotionals.
            </p>
          </div>
          
          <div className="verse-card">
            <div className="flex items-center mb-4">
              <BookOpen className="w-6 h-6 mr-2" />
              <h3 className="text-lg font-semibold">Verse of the Day</h3>
            </div>
            <blockquote className="text-lg mb-4 italic">
              "For I know the plans I have for you," declares the Lord, "plans to prosper you and not to harm you, plans to give you hope and a future."
            </blockquote>
            <cite className="text-sm opacity-90">- Jeremiah 29:11 (NIV)</cite>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
            <div className="text-center">
              <p className="text-gray-500">Full Bible study functionality coming soon...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Verses;