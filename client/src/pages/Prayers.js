import React from 'react';
import { Heart } from 'lucide-react';

function Prayers() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <Heart className="w-6 h-6 text-purple-600 mr-2" />
              <h1 className="text-2xl font-bold text-gray-900">Prayer Requests</h1>
            </div>
            <p className="text-gray-600 mb-6">
              Share your prayer needs and lift up others in prayer.
            </p>
            
            <div className="prayer-card">
              <h3 className="text-lg font-semibold mb-2">Sample Prayer Request</h3>
              <p className="opacity-90 mb-4">
                Please pray for my family as we navigate a difficult season. We need God's wisdom and strength.
              </p>
              <div className="text-sm opacity-80">
                <span>15 people praying</span> • <span>Posted 2 hours ago</span>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <p className="text-gray-500">Full prayer functionality coming soon...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Prayers;