import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FiHome, FiArrowLeft, FiSearch, FiInbox, 
  FiCheckSquare, FiBell, FiSettings, FiHelpCircle,
  FiMessageSquare, FiAlertCircle, FiCompass
} from 'react-icons/fi';

function NotFound() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [timeLeft, setTimeLeft] = useState(10);
  const [autoRedirect, setAutoRedirect] = useState(false);

  // Popular pages for quick navigation
  const popularPages = [
    { 
      path: '/', 
      name: 'Dashboard', 
      icon: FiHome, 
      description: 'Return to main dashboard',
      color: 'bg-purple-100 text-purple-600'
    },
    { 
      path: '/feedback', 
      name: 'Feedback Inbox', 
      icon: FiInbox, 
      description: 'View user feedback',
      color: 'bg-blue-100 text-blue-600'
    },
    { 
      path: '/issues', 
      name: 'Issues', 
      icon: FiCheckSquare, 
      description: 'Manage product issues',
      color: 'bg-green-100 text-green-600'
    },
    { 
      path: '/notifications', 
      name: 'Notifications', 
      icon: FiBell, 
      description: 'Check notifications',
      color: 'bg-yellow-100 text-yellow-600'
    },
  ];

  // Auto-redirect countdown (optional)
  useEffect(() => {
    if (autoRedirect && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (autoRedirect && timeLeft === 0) {
      navigate('/');
    }
  }, [timeLeft, autoRedirect, navigate]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Implement search logic or redirect to search results
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  // Fun 404 messages
  const errorMessages = [
    "Oops! This page got lost in the feedback loop.",
    "404: This issue hasn't been created yet.",
    "Looks like this page needs to be traced back.",
    "This page is currently unresolved.",
    "We couldn't find what you're looking for."
  ];

  const randomMessage = errorMessages[Math.floor(Math.random() * errorMessages.length)];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900
	dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        {/* Main Content */}
        <div className="text-center mb-12">
          {/* 404 Illustration */}
          <div className="relative mb-8">
            <div className="text-[150px] font-bold text-gray-100 select-none">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white rounded-full p-6 shadow-xl">
                <FiCompass className="text-purple-600 animate-pulse" size={48} />
              </div>
            </div>
          </div>

          {/* Error Message */}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            Page Not Found
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            {randomMessage}
          </p>

          {/* Search Bar */}
          <div className="max-w-md mx-auto mb-8">
            <form onSubmit={handleSearch} className="relative">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for pages, feedback, or issues..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                Search
              </button>
            </form>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center space-x-4 mb-12">
            <button
              onClick={handleGoBack}
              className="flex items-center space-x-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            >
              <FiArrowLeft size={18} />
              <span>Go Back</span>
            </button>
            <Link
              to="/"
              className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
            >
              <FiHome size={18} />
              <span>Go to Dashboard</span>
            </Link>
          </div>
        </div>

        {/* Popular Pages Grid */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-inherit mb-6">
            Popular Pages
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {popularPages.map((page) => (
              <Link
                key={page.path}
                to={page.path}
                className="group flex items-start space-x-4 p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all"
              >
                <div className={`p-3 rounded-lg ${page.color} group-hover:scale-110 transition-transform`}>
                  <page.icon size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-inherit group-hover:text-purple-600 transition-colors">
                    {page.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {page.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Additional Help Section */}
        <div className="mt-8 bg-purple-50 rounded-xl border border-purple-200 p-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <FiHelpCircle className="text-purple-600" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-purple-900 mb-2">
                Need Help?
              </h3>
              <p className="text-purple-700 text-sm mb-3">
                If you believe this is an error or you need assistance, please contact our support team.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="mailto:support@trace.com"
                  className="inline-flex items-center space-x-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  <FiMessageSquare size={16} />
                  <span>Contact Support</span>
                </a>
                <Link
                  to="/help"
                  className="inline-flex items-center space-x-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  <FiHelpCircle size={16} />
                  <span>Help Center</span>
                </Link>
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center space-x-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  <FiAlertCircle size={16} />
                  <span>Report Issue</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Auto-redirect Option */}
        <div className="mt-8 text-center">
          <button
            onClick={() => setAutoRedirect(!autoRedirect)}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            {autoRedirect ? (
              <span>
                Redirecting to dashboard in {timeLeft} seconds... 
                <span className="text-purple-600 ml-1 underline">Cancel</span>
              </span>
            ) : (
              <span>
                Auto-redirect to dashboard
              </span>
            )}
          </button>
        </div>

        {/* Error Details (for developers) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <details className="cursor-pointer">
              <summary className="text-sm font-medium text-gray-700">
                Developer Info
              </summary>
              <div className="mt-2 text-xs text-gray-600 font-mono">
                <p>Path: {window.location.pathname}</p>
                <p>Search: {window.location.search}</p>
                <p>Hash: {window.location.hash}</p>
                <p>Timestamp: {new Date().toISOString()}</p>
              </div>
            </details>
          </div>
        )}
      </div>

      {/* Decorative Elements */}
      <div className="fixed top-10 left-10 opacity-10 pointer-events-none">
        <svg width="404" height="404" viewBox="0 0 404 404">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" className="text-purple-600" />
        </svg>
      </div>

      {/* Floating Animation Elements */}
      <div className="fixed top-20 right-20 animate-bounce opacity-20 pointer-events-none">
        <FiMessageSquare className="text-purple-600" size={64} />
      </div>
      <div className="fixed bottom-20 left-20 animate-pulse opacity-20 pointer-events-none">
        <FiCheckSquare className="text-purple-600" size={48} />
      </div>
      <div className="fixed bottom-40 right-40 animate-bounce opacity-20 pointer-events-none" style={{ animationDelay: '0.5s' }}>
        <FiInbox className="text-purple-600" size={56} />
      </div>
    </div>
  );
}

// Alternative Minimal Version
export function NotFoundMinimal() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-purple-100 rounded-full mb-4">
            <FiAlertCircle className="text-purple-600" size={48} />
          </div>
          <h1 className="text-6xl font-bold text-gray-900 dark:text-inherit mb-2">404</h1>
          <p className="text-xl text-gray-600">Page not found</p>
        </div>
        
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Go Back
          </button>
          <Link
            to="/"
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFound;