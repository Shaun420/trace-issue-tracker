import { useState, useEffect } from 'react';
import { 
  FiX, FiMail, FiSlack, FiGithub, FiGlobe,
  FiSmile, FiFrown, FiMeh, FiTag, FiUser,
  FiMessageSquare, FiCalendar, FiLink
} from 'react-icons/fi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { feedbackService } from '../services/feedbackService';

function FeedbackFormModal({ isOpen, onClose, editData = null, onSuccess }) {
  const [formData, setFormData] = useState({
    source: 'email',
    content: '',
    user_email: '',
    sentiment: null,
    tags: [],
    priority: 'medium',
    created_at: new Date().toISOString(),
    metadata: {
      browser: '',
      os: '',
      url: '',
      additional_context: ''
    }
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [tagInput, setTagInput] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [linkedIssue, setLinkedIssue] = useState(null);
  const [availableIssues, setAvailableIssues] = useState([]);

  useEffect(() => {
    if (editData) {
      setFormData({
        source: editData.source || 'email',
        content: editData.content || '',
        user_email: editData.user_email || '',
        sentiment: editData.sentiment || null,
        tags: editData.tags || [],
        priority: editData.priority || 'medium',
        created_at: editData.created_at || new Date().toISOString(),
        metadata: editData.metadata || {
          browser: '',
          os: '',
          url: '',
          additional_context: ''
        }
      });
      setLinkedIssue(editData.linked_issue || null);
    } else {
      // Reset form for new feedback
      setFormData({
        source: 'email',
        content: '',
        user_email: '',
        sentiment: null,
        tags: [],
        priority: 'medium',
        created_at: new Date().toISOString(),
        metadata: {
          browser: '',
          os: '',
          url: '',
          additional_context: ''
        }
      });
      setLinkedIssue(null);
    }
    setErrors({});
  }, [editData, isOpen]);

  useEffect(() => {
    if (isOpen) {
      fetchAvailableIssues();
    }
  }, [isOpen]);

  const fetchAvailableIssues = async () => {
    try {
      const response = await api.get('/issues/?status=open');
      setAvailableIssues(response.data);
    } catch (error) {
      console.error('Failed to fetch issues');
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.content.trim()) {
      newErrors.content = 'Feedback content is required';
    }

    if (!formData.user_email.trim()) {
      newErrors.user_email = 'User email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.user_email)) {
      newErrors.user_email = 'Please enter a valid email address';
    }

    if (!formData.source) {
      newErrors.source = 'Source is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);

    try {
      const dataToSubmit = {
        ...formData,
        linked_issue_id: linkedIssue?.id || null
      };

      if (editData) {
        await feedbackService.update(editData.id, dataToSubmit);
        toast.success('Feedback updated successfully');
      } else {
        await feedbackService.create(dataToSubmit);
        toast.success('Feedback created successfully');
      }
      
      onSuccess();
      handleClose();
    } catch (error) {
      toast.error(editData ? 'Failed to update feedback' : 'Failed to create feedback');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      source: 'email',
      content: '',
      user_email: '',
      sentiment: null,
      tags: [],
      priority: 'medium',
      created_at: new Date().toISOString(),
      metadata: {
        browser: '',
        os: '',
        url: '',
        additional_context: ''
      }
    });
    setErrors({});
    setTagInput('');
    setShowAdvanced(false);
    setLinkedIssue(null);
    onClose();
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData({
          ...formData,
          tags: [...formData.tags, tagInput.trim()]
        });
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const sourceOptions = [
    { value: 'email', label: 'Email', icon: FiMail, color: 'text-blue-600' },
    { value: 'slack', label: 'Slack', icon: FiSlack, color: 'text-purple-600' },
    { value: 'github', label: 'GitHub', icon: FiGithub, color: 'text-gray-800' },
    { value: 'form', label: 'Web Form', icon: FiGlobe, color: 'text-green-600' },
  ];

  const sentimentOptions = [
    { value: 'positive', label: 'Positive', icon: FiSmile, color: 'text-green-600 bg-green-50' },
    { value: 'neutral', label: 'Neutral', icon: FiMeh, color: 'text-gray-600 bg-gray-50' },
    { value: 'negative', label: 'Negative', icon: FiFrown, color: 'text-red-600 bg-red-50' },
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-700' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'high', label: 'High', color: 'bg-red-100 text-red-700' },
    { value: 'critical', label: 'Critical', color: 'bg-red-600 text-white' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col dark:text-gray-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {editData ? 'Edit Feedback' : 'Create New Feedback'}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <form onSubmit={handleSubmit} className="space-y-6">
			{/* Source Selection */}
			<div>
			<label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
				Feedback Source
			</label>
			<div className="grid grid-cols-4 gap-3">
				{sourceOptions.map((source) => {
				const isActive = formData.source === source.value;
				return (
					<button
					key={source.value}
					type="button"
					aria-pressed={isActive}
					onClick={() => setFormData({ ...formData, source: source.value })}
					className={`
						group flex flex-col items-center justify-center rounded-md px-3 py-3 border-2 transition-all
						focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/60
						focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900
						${isActive
						? 'border-purple-500 bg-purple-50 text-purple-700 shadow-sm dark:border-purple-400 dark:bg-purple-900/30 dark:text-purple-300'
						: 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700'
						}
					`}
					>
					<source.icon
						size={24}
						className={`
						mb-2 transition-colors
						${isActive ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400'}
						`}
					/>
					<span className="text-sm font-medium">
						{source.label}
					</span>
					</button>
				);
				})}
			</div>
			</div>

            {/* User Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-inherit mb-2">
                User Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={formData.user_email}
                  onChange={(e) => setFormData({ ...formData, user_email: e.target.value })}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.user_email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="user@example.com"
                />
              </div>
              {errors.user_email && (
                <p className="mt-1 text-sm text-red-600">{errors.user_email}</p>
              )}
            </div>

            {/* Feedback Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-inherit mb-2">
                Feedback Content <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FiMessageSquare className="absolute left-3 top-3 text-gray-400" />
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                    errors.content ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  rows="5"
                  placeholder="Enter the feedback details..."
                />
              </div>
              {errors.content && (
                <p className="mt-1 text-sm text-red-600">{errors.content}</p>
              )}
              <p className="mt-1 text-sm text-gray-500 dark:text-inherit">
                {formData.content.length} characters
              </p>
            </div>

            {/* Sentiment and Priority */}
            <div className="grid grid-cols-2 gap-6">
              {/* Sentiment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-inherit mb-3">
                  Sentiment
                </label>
                <div className="flex gap-2">
                  {sentimentOptions.map((sentiment) => (
                    <button
                      key={sentiment.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, sentiment: sentiment.value })}
                      className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-lg border-2 transition-all ${
                        formData.sentiment === sentiment.value
                          ? `border-purple-500 ${sentiment.color}`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <sentiment.icon size={18} />
                      <span className="text-sm font-medium">{sentiment.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-inherit mb-3">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {priorityOptions.map((priority) => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-inherit mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center space-x-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                  >
                    <FiTag size={12} />
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-purple-900"
                    >
                      <FiX size={14} />
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Type a tag and press Enter"
              />
            </div>

            {/* Link to Issue */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-inherit mb-2">
                Link to Issue (Optional)
              </label>
              <select
                value={linkedIssue?.id || ''}
                onChange={(e) => {
                  const issue = availableIssues.find(i => i.id === parseInt(e.target.value));
                  setLinkedIssue(issue || null);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">No linked issue</option>
                {availableIssues.map((issue) => (
                  <option key={issue.id} value={issue.id}>
                    {issue.title} (#{issue.id})
                  </option>
                ))}
              </select>
              {linkedIssue && (
                <div className="mt-2 p-3 bg-purple-50 rounded-lg">
                  <p className="text-sm text-purple-700">
                    <FiLink className="inline mr-1" size={14} />
                    Linked to: <span className="font-medium">{linkedIssue.title}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Advanced Options */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                {showAdvanced ? 'Hide' : 'Show'} Advanced Options
              </button>

              {showAdvanced && (
                <div className="mt-4 space-y-4 p-4 bg-gray-50 rounded-lg">
                  {/* Date Override */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date Created
                    </label>
                    <div className="relative">
                      <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="datetime-local"
                        value={formData.created_at.slice(0, 16)}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          created_at: new Date(e.target.value).toISOString() 
                        })}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Browser
                      </label>
                      <input
                        type="text"
                        value={formData.metadata.browser}
                        onChange={(e) => setFormData({
                          ...formData,
                          metadata: { ...formData.metadata, browser: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="e.g., Chrome 120"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        OS
                      </label>
                      <input
                        type="text"
                        value={formData.metadata.os}
                        onChange={(e) => setFormData({
                          ...formData,
                          metadata: { ...formData.metadata, os: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="e.g., Windows 11"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Page URL
                    </label>
                    <input
                      type="url"
                      value={formData.metadata.url}
                      onChange={(e) => setFormData({
                        ...formData,
                        metadata: { ...formData.metadata, url: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="https://example.com/page"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Additional Context
                    </label>
                    <textarea
                      value={formData.metadata.additional_context}
                      onChange={(e) => setFormData({
                        ...formData,
                        metadata: { ...formData.metadata, additional_context: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      rows="2"
                      placeholder="Any additional context or notes..."
                    />
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="text-sm text-gray-500">
            {editData ? `Editing feedback #${editData.id}` : 'Creating new feedback'}
          </div>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <span className="flex items-center space-x-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>{editData ? 'Updating...' : 'Creating...'}</span>
                </span>
              ) : (
                <span>{editData ? 'Update Feedback' : 'Create Feedback'}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FeedbackFormModal;