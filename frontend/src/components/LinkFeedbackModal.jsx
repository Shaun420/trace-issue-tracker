import { useState, useEffect } from 'react';
import { FiX, FiCheck } from 'react-icons/fi';
import api from '../api/mockData';

function LinkFeedbackModal({ isOpen, onClose, feedbackId }) {
  const [issues, setIssues] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchIssues();
    }
  }, [isOpen]);

  const fetchIssues = async () => {
    try {
      const response = await api.get('/issues/');
      setIssues(response.data);
    } catch (error) {
      console.error('Error fetching issues:', error);
    }
  };

  const handleLink = async () => {
    if (!selectedIssue) return;
    
    setLoading(true);
    try {
      await api.post(`/feedback/${feedbackId}/link_to_issue/`, {
        issue_id: selectedIssue
      });
      onClose();
    } catch (error) {
      console.error('Error linking feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Link Feedback to Issue</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {issues.map((issue) => (
            <div
              key={issue.id}
              onClick={() => setSelectedIssue(issue.id)}
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                selectedIssue === issue.id
                  ? 'border-purple-500 dark:border-purple-200 bg-purple-50 hover:bg-purple-300 dark:hover:bg-purple-700'
                  : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{issue.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{issue.description}</p>
                  <div className="flex items-center space-x-3 mt-2">
                    <span className="text-xs text-gray-500">
                      {issue.feedback_count} linked feedback
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      issue.status === 'open' ? 'bg-red-100 text-red-700' :
                      issue.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {issue.status}
                    </span>
                  </div>
                </div>
                {selectedIssue === issue.id && (
                  <FiCheck className="text-purple-600" size={20} />
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleLink}
            disabled={!selectedIssue || loading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? 'Linking...' : 'Link to Issue'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default LinkFeedbackModal;