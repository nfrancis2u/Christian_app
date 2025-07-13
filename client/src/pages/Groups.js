import React from 'react';
import { Users } from 'lucide-react';

function Groups() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <Users className="w-6 h-6 text-green-600 mr-2" />
              <h1 className="text-2xl font-bold text-gray-900">Groups</h1>
            </div>
            <p className="text-gray-600 mb-6">
              Join Bible study groups and connect with believers in your area.
            </p>
            <div className="mt-8 text-center">
              <p className="text-gray-500">Groups functionality coming soon...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Groups;