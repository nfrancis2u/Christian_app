import React from 'react';
import { User, MapPin, Church, Calendar, Heart } from 'lucide-react';

function Profile() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-primary text-white rounded-full flex items-center justify-center">
                <User className="w-12 h-12" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">John Doe</h1>
                <p className="text-gray-600">@johndoe</p>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                  <span className="flex items-center">
                    <Church className="w-4 h-4 mr-1" />
                    Grace Community Church
                  </span>
                  <span className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    Austin, TX
                  </span>
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Joined Dec 2023
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-gray-700">
                Passionate about sharing God's love and growing in faith with fellow believers. 
                Love leading worship and studying scripture together.
              </p>
            </div>
          </div>

          {/* Profile Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">Recent Posts</h2>
                <div className="space-y-4">
                  <div className="border-b pb-4">
                    <p className="text-gray-700 mb-2">
                      Grateful for God's faithfulness in my life. He truly works all things for good! 🙏
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Heart className="w-4 h-4 mr-1" />
                        24 likes
                      </span>
                      <span>2 hours ago</span>
                    </div>
                  </div>
                  <div className="border-b pb-4">
                    <p className="text-gray-700 mb-2">
                      "Trust in the Lord with all your heart and lean not on your own understanding." - Proverbs 3:5
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Heart className="w-4 h-4 mr-1" />
                        18 likes
                      </span>
                      <span>1 day ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">About</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-500">Denomination:</span>
                    <p className="text-gray-900">Baptist</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Favorite Verse:</span>
                    <p className="text-gray-900">Philippians 4:13</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Spiritual Gifts:</span>
                    <p className="text-gray-900">Teaching, Worship</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;