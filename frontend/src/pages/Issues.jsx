import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiUsers, FiMessageSquare } from 'react-icons/fi';
import api from '../api/mockData';
import IssueFormModal from '../components/IssueFormModal';

function Issues() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [editIssue, setEditIssue] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      const response = await api.get('/issues/');
	  console.log("data:",response.data);
      setIssues(response.data);
    } catch (error) {
      console.error('Error fetching issues:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    open: 'bg-red-100 text-red-700',
    in_progress: 'bg-yellow-100 text-yellow-700',
    resolved: 'bg-green-100 text-green-700',
  };

  const brandHover = 'hover:bg-purple-200/50 dark:hover:bg-purple-500/50 transition-colors';
  const priorityColors = {
    1: 'border-l-4 border-gray-400',
    2: 'border-l-4 border-yellow-400',
    3: 'border-l-4 border-red-400',
  };

  // Light/dark row backgrounds by priority (very light tints)
	const priorityRowBg = {
	low:    `bg-gray-50 dark:bg-gray-900/30 ${brandHover}`,
	1:      `bg-gray-50 dark:bg-gray-900/30 ${brandHover}`,

	medium: `bg-amber-50 dark:bg-amber-900/20 ${brandHover}`,
	2:      `bg-amber-50 dark:bg-amber-900/20 ${brandHover}`,

	high:   `bg-red-50 dark:bg-red-900/20 ${brandHover}`,
	3:      `bg-red-50 dark:bg-red-900/20 ${brandHover}`,
	};
  return (
    <div class="dark:text-gray-100">
	  <div className="pt-16 flex justify-between items-center mb-6">
		<h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Issues</h1>
		<button
			type="button"
			onClick={() => {
			setEditIssue(null);      // ensure we're creating, not editing
			setShowIssueModal(true); // open modal
			}}
			className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/60"
		>
			<FiPlus />
			<span>New Issue</span>
		</button>
	  </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Issue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Feedback
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Assigned
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {issues.map((issue) => (
                <tr
                  key={issue.id}
                  onClick={() => navigate(`/issues/${issue.id}`)}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${priorityColors[issue.priority]} ${priorityRowBg[issue.priority]}`}
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{issue.title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-md">{issue.description}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs text-nowrap font-semibold rounded ${statusColors[issue.status]}`}>
                      {issue.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-100">
                      <FiMessageSquare size={16} />
                      <span>{issue.feedback_count || 0}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-semibold text-purple-600">
                          {issue.assigned_to ? issue.assigned_to.charAt(0).toUpperCase() : 'UA'}
                        </span>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
	  <IssueFormModal
		isOpen={showIssueModal}
		onClose={() => setShowIssueModal(false)}
		onSuccess={() => {
			// Re-fetch the list so the newly created issue appears
			setLoading(true);
			fetchIssues();
		}}
		editData={editIssue} // will be null for "New Issue"
		/>
    </div>
  );
}

export default Issues;