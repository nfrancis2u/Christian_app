import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Users, BookOpen, Pray, Shield, Globe, ArrowRight } from 'lucide-react';

function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-primary text-white p-2 rounded-lg">
                <Heart className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold text-gray-900">ChristianConnect</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-gray-600 hover:text-primary transition-colors">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Connect. Share. Grow.
              <span className="text-primary"> In Faith.</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Join a community of believers where you can share your faith journey, 
              request prayers, study scripture together, and build meaningful Christian friendships.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="btn btn-primary btn-lg">
                Join Our Community
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link to="/login" className="btn btn-outline btn-lg">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need for Christian Fellowship
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform provides powerful tools to help you grow in faith and connect with believers worldwide.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Prayer Requests */}
            <div className="text-center p-6">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Pray className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Prayer Requests</h3>
              <p className="text-gray-600">
                Share your prayer needs and pray for others. Build a supportive community 
                where faith lifts each other up.
              </p>
            </div>

            {/* Bible Study Groups */}
            <div className="text-center p-6">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Bible Study Groups</h3>
              <p className="text-gray-600">
                Join or create Bible study groups, share insights, and grow in understanding 
                of God's Word together.
              </p>
            </div>

            {/* Christian Community */}
            <div className="text-center p-6">
              <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Christian Community</h3>
              <p className="text-gray-600">
                Connect with believers from around the world. Share testimonies, 
                encouragement, and build lasting friendships.
              </p>
            </div>

            {/* Scripture Sharing */}
            <div className="text-center p-6">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Scripture Sharing</h3>
              <p className="text-gray-600">
                Share your favorite Bible verses, daily devotionals, and inspirational 
                messages with the community.
              </p>
            </div>

            {/* Safe Environment */}
            <div className="text-center p-6">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Safe Environment</h3>
              <p className="text-gray-600">
                A moderated, respectful space where Christian values are upheld and 
                all members can feel safe to share.
              </p>
            </div>

            {/* Global Reach */}
            <div className="text-center p-6">
              <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Global Reach</h3>
              <p className="text-gray-600">
                Connect with Christians from different cultures and denominations, 
                experiencing the global body of Christ.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              What Our Community Says
            </h2>
            <p className="text-lg text-gray-600">
              Hear from believers who have found encouragement and growth in our community.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center mr-4">
                  <span className="font-semibold">S</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Sarah Johnson</h4>
                  <p className="text-sm text-gray-600">Youth Pastor</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "ChristianConnect has transformed how our youth group stays connected. 
                The prayer request feature especially has brought us closer together."
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="bg-secondary text-white rounded-full w-12 h-12 flex items-center justify-center mr-4">
                  <span className="font-semibold">M</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Michael Chen</h4>
                  <p className="text-sm text-gray-600">Bible Study Leader</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "The Bible study groups feature has made it so easy to organize and 
                share resources. Our group has grown significantly!"
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="bg-purple-500 text-white rounded-full w-12 h-12 flex items-center justify-center mr-4">
                  <span className="font-semibold">R</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Rebecca Martinez</h4>
                  <p className="text-sm text-gray-600">Missionary</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "Being able to connect with believers worldwide has been incredible. 
                The support and encouragement I've received is immeasurable."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Join Our Christian Community?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Start your journey of faith, fellowship, and spiritual growth today. 
            It's free and takes just a few minutes to get started.
          </p>
          <Link to="/register" className="btn bg-white text-primary hover:bg-gray-100 btn-lg">
            Create Your Account
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="bg-primary text-white p-2 rounded-lg">
                <Heart className="w-5 h-5" />
              </div>
              <span className="text-lg font-semibold">ChristianConnect</span>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Contact Us</a>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 ChristianConnect. Made with ❤️ for the body of Christ.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;