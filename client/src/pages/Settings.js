import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';

function Settings() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <SettingsIcon className="w-6 h-6 text-gray-600 mr-2" />
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            </div>
            <p className="text-gray-600 mb-6">
              Manage your account preferences and privacy settings.
            </p>
            <div className="mt-8 text-center">
              <p className="text-gray-500">Settings functionality coming soon...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;