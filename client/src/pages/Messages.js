import React from 'react';
import { MessageCircle } from 'lucide-react';

function Messages() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <MessageCircle className="w-6 h-6 text-blue-600 mr-2" />
              <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
            </div>
            <p className="text-gray-600 mb-6">
              Connect with fellow believers through private messages.
            </p>
            <div className="mt-8 text-center">
              <p className="text-gray-500">Messaging functionality coming soon...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Messages;