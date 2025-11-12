import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft, FiEdit, FiTrash2, FiCheckCircle, 
  FiClock, FiMessageSquare, FiUser, FiLink
} from 'react-icons/fi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { issueService } from '../services/issueService';
import IssueFormModal from '../components/IssueFormModal';

function IssueDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    fetchIssue();
  }, [id]);

  const fetchIssue = async () => {
    try {
      const data = await issueService.getById(id);
      setIssue(data);
    } catch (error) {
      toast.error('Failed to fetch issue details');
      navigate('/issues');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async () => {
    if (!confirm('Mark this issue as resolved?')) return;
    
    try {
      await issueService.resolve(id);
      toast.success('Issue resolved successfully');
      fetchIssue();
    } catch (error) {
      toast.error('Failed to resolve issue');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this issue?')) return;
    
    try {
      await issueService.delete(id);
      toast.success('Issue deleted successfully');
      navigate('/issues');
    } catch (error) {
      toast.error('Failed to delete issue');
    }
  };

  const statusColors = {
    open: 'bg-red-100 text-red-700',
    in_progress: 'bg-yellow-100 text-yellow-700',
    resolved: 'bg-green-100 text-green-700',
  };

  const priorityLabels = {
    1: 'Low',
    2: 'Medium',
    3: 'High',
  };

  const priorityColors = {
    1: 'bg-gray-100 text-gray-700',
    2: 'bg-yellow-100 text-yellow-700',
    3: 'bg-red-100 text-red-700',
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!issue) return null;

  return (
    <div className="space-y-6 py-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/issues')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <FiArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{issue.title}</h1>
            <div className="flex items-center space-x-3 mt-2">
              <span className={`px-2 py-1 text-xs font-semibold rounded ${statusColors[issue.status]}`}>
                {issue.status ? issue.status.replace('_', ' ') : 'Unknown'}
              </span>
              <span className={`px-2 py-1 text-xs font-semibold rounded ${priorityColors[issue.priority]}`}>
                {priorityLabels[issue.priority]} Priority
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Created {format(new Date(issue.created_at), 'MMM dd, yyyy')}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {issue.status !== 'resolved' && (
            <button
              onClick={handleResolve}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <FiCheckCircle />
              <span>Resolve</span>
            </button>
          )}
          <button
            onClick={() => setEditModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <FiEdit />
            <span>Edit</span>
          </button>
          <button
            onClick={handleDelete}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
          >
            <FiTrash2 />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Issue Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Description</h2>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{issue.description}</p>
          </div>

		{/* Linked Feedback */}
		<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
		<div className="flex items-center justify-between mb-4">
			<h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
			Linked Feedback ({issue.linked_feedback?.length || 0})
			</h2>
			<button
			className="
				inline-flex items-center gap-1 text-sm font-medium
				text-purple-600 hover:text-purple-700
				dark:text-purple-400 dark:hover:text-purple-300
				rounded-md px-2 py-1 -mx-2
				focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/60
				focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900
				transition-colors
			"
			onClick={() => {
				// open link modal / navigate to selector
			}}
			>
			Link More
			</button>
		</div>

		{issue.linked_feedback && issue.linked_feedback.length > 0 ? (
			<div className="space-y-3">
			{issue.linked_feedback.map((feedback) => (
				<div
				key={feedback.id}
				className="
					p-4 rounded-lg
					bg-gray-50 dark:bg-gray-900/40
					border border-gray-200 dark:border-gray-700
					transition-colors
				"
				>
				<div className="flex items-start justify-between mb-2">
					<span
					className="
						px-2 py-1 rounded text-xs font-semibold
						bg-purple-100 text-purple-700
						dark:bg-purple-900/40 dark:text-purple-300
					"
					>
					{feedback.source}
					</span>
					<span className="text-xs text-gray-500 dark:text-gray-400">
					{format(new Date(feedback.created_at), 'MMM dd, HH:mm')}
					</span>
				</div>

				<p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
					{feedback.content}
				</p>
				<p className="text-xs text-gray-500 dark:text-gray-400">
					From: {feedback.user_email}
				</p>
				</div>
			))}
			</div>
		) : (
			<p className="text-sm text-gray-500 dark:text-gray-400">
			No feedback linked to this issue yet.
			</p>
		)}
		</div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Issue Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Issue Information</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Assigned to</p>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <FiUser className="text-purple-600" size={16} />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {issue.assigned_to_details?.username || 'Unassigned'}
                  </span>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Created by</p>
                <p className="text-sm font-medium mt-1">
                  {issue.created_by?.username || 'System'}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Last updated</p>
                <p className="text-sm font-medium mt-1">
                  {format(new Date(issue.updated_at || issue.created_at), 'MMM dd, yyyy HH:mm')}
                </p>
              </div>
            </div>
          </div>

			{/* Statistics */}
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
			<h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
				Impact
			</h3>

			<div className="space-y-3">
				<div className="flex items-center justify-between">
				<span className="text-sm text-gray-600 dark:text-gray-400">Affected Users</span>
				<span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
					{issue.linked_feedback?.length || 0}
				</span>
				</div>

				<div className="flex items-center justify-between">
				<span className="text-sm text-gray-600 dark:text-gray-400">Days Open</span>
				<span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
					{issue?.created_at
					? Math.max(
						0,
						Math.floor(
							(Date.now() - new Date(issue.created_at).getTime()) / 86400000
						)
						)
					: 0}
				</span>
				</div>
			</div>
			</div>

        </div>
      </div>

      {/* Edit Modal */}
      <IssueFormModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        editData={issue}
        onSuccess={() => {
          fetchIssue();
          setEditModalOpen(false);
        }}
      />
    </div>
  );
}

export default IssueDetail;