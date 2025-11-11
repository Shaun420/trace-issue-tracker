import { FiUser, FiTag, FiClock } from 'react-icons/fi';

function FeedbackCard({ feedback, onLink }) {
  const sentimentColors = {
    positive: 'bg-green-100 text-green-800',
    negative: 'bg-red-100 text-red-800',
    neutral: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-2">
          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded">
            {feedback.source}
          </span>
          {feedback.sentiment && (
            <span className={`px-2 py-1 text-xs font-semibold rounded ${sentimentColors[feedback.sentiment] || sentimentColors.neutral}`}>
              {feedback.sentiment}
            </span>
          )}
        </div>
        <button
          onClick={() => onLink(feedback.id)}
          className="text-purple-600 hover:text-purple-700 text-sm font-medium"
        >
          Link to Issue
        </button>
      </div>

      <p className="text-gray-800 mb-3 line-clamp-3">{feedback.content}</p>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1">
            <FiUser size={14} />
            <span>{feedback.user_email}</span>
          </span>
          <span className="flex items-center space-x-1">
            <FiClock size={14} />
            <span>{new Date(feedback.created_at).toLocaleDateString()}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

export default FeedbackCard;