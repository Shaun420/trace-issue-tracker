import { useState, useEffect } from 'react';
import { FiFilter, FiDownload, FiSearch, FiLink, FiTrash2, FiEdit } from 'react-icons/fi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { feedbackService } from '../services/feedbackService';
import LinkFeedbackModal from '../components/LinkFeedbackModal';
import FeedbackFormModal from '../components/FeedbackFormModal';

function FeedbackInbox() {
  const [feedbackList, setFeedbackList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSource, setFilterSource] = useState('all');
  const [filterSentiment, setFilterSentiment] = useState('all');
  const [selectedFeedback, setSelectedFeedback] = useState([]);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState(null);

  useEffect(() => {
    fetchFeedback();
  }, []);

  useEffect(() => {
    filterFeedback();
  }, [feedbackList, searchTerm, filterSource, filterSentiment]);

  const fetchFeedback = async () => {
    try {
      const data = await feedbackService.getAll();
      setFeedbackList(data);
    } catch (error) {
      toast.error('Failed to fetch feedback');
    } finally {
      setLoading(false);
    }
  };

  const filterFeedback = () => {
    let filtered = [...feedbackList];

    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.user_email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterSource !== 'all') {
      filtered = filtered.filter(item => item.source === filterSource);
    }

    if (filterSentiment !== 'all') {
      filtered = filtered.filter(item => item.sentiment === filterSentiment);
    }

    setFilteredList(filtered);
  };

  const handleSelectFeedback = (id) => {
    setSelectedFeedback(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedFeedback.length === filteredList.length) {
      setSelectedFeedback([]);
    } else {
      setSelectedFeedback(filteredList.map(item => item.id));
    }
  };

  const handleBulkLink = () => {
    if (selectedFeedback.length === 0) {
      toast.error('Please select feedback items to link');
      return;
    }
    setLinkModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this feedback?')) return;
    
    try {
      await feedbackService.delete(id);
      toast.success('Feedback deleted successfully');
      fetchFeedback();
    } catch (error) {
      toast.error('Failed to delete feedback');
    }
  };

  const handleEdit = (feedback) => {
    setEditingFeedback(feedback);
    setFormModalOpen(true);
  };

  const handleExport = () => {
    const csv = [
      ['Source', 'Email', 'Content', 'Sentiment', 'Date'],
      ...filteredList.map(item => [
        item.source,
        item.user_email,
        item.content,
        item.sentiment || '',
        format(new Date(item.created_at), 'yyyy-MM-dd HH:mm')
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `feedback-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const sentimentColors = {
    positive: 'bg-green-100 text-green-800',
    negative: 'bg-red-100 text-red-800',
    neutral: 'bg-gray-100 text-gray-800',
  };

  const sourceColors = {
    email: 'bg-blue-100 text-blue-800',
    slack: 'bg-purple-100 text-purple-800',
    form: 'bg-yellow-100 text-yellow-800',
    github: 'bg-gray-100 text-gray-800',
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-16">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Feedback Inbox</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{filteredList.length} feedback items</p>
        </div>
        <div className="flex items-center space-x-3">
          {selectedFeedback.length > 0 && (
            <>
              <span className="text-sm text-gray-600">
                {selectedFeedback.length} selected
              </span>
              <button 
                onClick={handleBulkLink}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <FiLink />
                <span>Link to Issue</span>
              </button>
            </>
          )}
          <button 
            onClick={handleExport}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <FiDownload />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search feedback..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none
			  focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          
          <select 
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none
			focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="all">All Sources</option>
            <option value="email">Email</option>
            <option value="slack">Slack</option>
            <option value="form">Web Form</option>
            <option value="github">GitHub</option>
          </select>

          <select 
            value={filterSentiment}
            onChange={(e) => setFilterSentiment(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none
			focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="all">All Sentiments</option>
            <option value="positive">Positive</option>
            <option value="negative">Negative</option>
            <option value="neutral">Neutral</option>
          </select>

			<button
			type="button"
			onClick={() => {
				setSearchTerm('');
				setFilterSource('all');
				setFilterSentiment('all');
				setSelectedFeedback([]);
			}}
			className="
				inline-flex items-center justify-center gap-2
				rounded-md px-4 py-2 text-sm font-semibold
				shadow-sm transition-colors
				bg-gray-400 text-white hover:bg-gray-500 active:bg-gray-600
				dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200 dark:active:bg-gray-300
				focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/60
				focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900
				disabled:opacity-50 disabled:pointer-events-none
			"
			>
			Clear Filters
			</button>
        </div>
      </div>

      {/* Feedback Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedFeedback.length === filteredList.length && filteredList.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Source
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Content
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Sentiment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredList.map((feedback) => (
              <tr key={feedback.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedFeedback.includes(feedback.id)}
                    onChange={() => handleSelectFeedback(feedback.id)}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded ${sourceColors[feedback.source]}`}>
                    {feedback.source}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-gray-900 dark:text-gray-100">{feedback.user_email}</p>
                </td>
                <td className="px-6 py-4 max-w-md">
                  <p className="text-sm text-gray-800 dark:text-gray-100 truncate">{feedback.content}</p>
                </td>
                <td className="px-6 py-4">
                  {feedback.sentiment && (
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${sentimentColors[feedback.sentiment]}`}>
                      {feedback.sentiment}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-gray-600 dark:text-inherit">
                    {format(new Date(feedback.created_at), 'MMM dd, HH:mm')}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(feedback)}
                      className="text-gray-600 dark:text-inherit hover:text-purple-600"
                    >
                      <FiEdit size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedFeedback([feedback.id]);
                        setLinkModalOpen(true);
                      }}
                      className="text-gray-600 dark:text-inherit hover:text-purple-600"
                    >
                      <FiLink size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(feedback.id)}
                      className="text-gray-600 dark:text-inherit hover:text-red-600"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredList.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No feedback found</p>
          </div>
        )}
      </div>

      {/* Modals */}
      <LinkFeedbackModal
        isOpen={linkModalOpen}
        onClose={() => {
          setLinkModalOpen(false);
          setSelectedFeedback([]);
        }}
        feedbackIds={selectedFeedback}
        onSuccess={() => {
          fetchFeedback();
          setSelectedFeedback([]);
        }}
      />

      <FeedbackFormModal
        isOpen={formModalOpen}
        onClose={() => {
          setFormModalOpen(false);
          setEditingFeedback(null);
        }}
        editData={editingFeedback}
        onSuccess={() => {
          fetchFeedback();
          setEditingFeedback(null);
        }}
      />
    </div>
  );
}

export default FeedbackInbox;