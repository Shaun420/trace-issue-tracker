import { useEffect, useState } from 'react';
import { FiX } from 'react-icons/fi';
import api from '../api/mockData';

function IssueFormModal({ isOpen, onClose, onSuccess, editData = null }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 1,
    status: 'open',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset/populate form when modal opens or editData changes
  useEffect(() => {
    if (!isOpen) return;
    setFormData({
      title: editData?.title || '',
      description: editData?.description || '',
      priority: Number(editData?.priority ?? 1),
      status: editData?.status || 'open',
    });
    setError('');
    setLoading(false);
  }, [isOpen, editData]);

  // Close on Esc
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!formData.title.trim()) return setError('Title is required.');
    if (!formData.description.trim()) return setError('Description is required.');

    try {
      setLoading(true);
      if (editData) {
        await api.put(`/issues/${editData.id}/`, formData);
      } else {
        await api.post('/issues/', formData);
      }
      onSuccess?.();
      onClose?.();
    } catch (err) {
      console.error('Error saving issue:', err);
      setError('Failed to save the issue. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
      aria-hidden="true"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="issue-form-title"
        className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md p-6 shadow-xl border border-gray-200 dark:border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2
            id="issue-form-title"
            className="text-2xl font-bold text-gray-900 dark:text-gray-100"
          >
            {editData ? 'Edit Issue' : 'Create New Issue'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/60"
            aria-label="Close modal"
          >
            <FiX size={20} className="text-gray-700 dark:text-gray-300" />
          </button>
        </div>

        {error && (
          <div className="mb-3 rounded-md border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-3 py-2 text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Short, clear summary"
              required
              disabled={loading}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows="4"
              placeholder="Provide context, steps to reproduce, expected vs actual behavior..."
              required
              disabled={loading}
            />
          </div>

          {/* Priority & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: Number(e.target.value) })
                }
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={loading}
              >
                <option value={1}>Low</option>
                <option value={2}>Medium</option>
                <option value={3}>High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={loading}
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/60"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="
                inline-flex items-center justify-center gap-2
                px-4 py-2 rounded-lg
                bg-purple-600 text-white hover:bg-purple-700 active:bg-purple-800
                disabled:opacity-60 disabled:pointer-events-none
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/60
              "
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z" />
                  </svg>
                  Saving…
                </span>
              ) : (
                <span>{editData ? 'Update' : 'Create'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default IssueFormModal;