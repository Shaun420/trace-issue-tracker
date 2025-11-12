import { useState, useEffect } from "react";
import {
  FiMail,
  FiSlack,
  FiBell,
  FiCheckCircle,
  FiClock,
  FiSend,
  FiFilter,
  FiRefreshCw,
  FiMessageSquare,
  FiAlertCircle,
  FiInfo,
  FiX,
  FiEdit2,
  FiTrash2,
  FiUsers,
  FiCheck,
  FiChevronDown,
} from "react-icons/fi";
import { format, formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";
import api from "../api/mockData";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, sent, pending, failed
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    sent: 0,
    pending: 0,
    failed: 0,
    openRate: 0,
  });

  useEffect(() => {
    fetchNotifications();
    fetchStats();
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get("/notifications/", {
        params: { status: filter !== "all" ? filter : undefined },
      });
      setNotifications(response.data);
    } catch (error) {
      toast.error("Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get("/notifications/stats/");
      setStats(response.data);
    } catch (error) {
      console.error("Failed to fetch stats");
    }
  };

  const handleResend = async (notificationId) => {
    try {
      await api.post(`/notifications/${notificationId}/resend/`);
      toast.success("Notification resent successfully");
      fetchNotifications();
    } catch (error) {
      toast.error("Failed to resend notification");
    }
  };

  const handleBulkResend = async () => {
    if (selectedNotifications.length === 0) {
      toast.error("Please select notifications to resend");
      return;
    }

    try {
      await api.post("/notifications/bulk_resend/", {
        notification_ids: selectedNotifications,
      });
      toast.success(`${selectedNotifications.length} notifications resent`);
      setSelectedNotifications([]);
      fetchNotifications();
    } catch (error) {
      toast.error("Failed to resend notifications");
    }
  };

  const handleDelete = async (notificationId) => {
    if (!confirm("Are you sure you want to delete this notification?")) return;

    try {
      await api.delete(`/notifications/${notificationId}/`);
      toast.success("Notification deleted");
      fetchNotifications();
    } catch (error) {
      toast.error("Failed to delete notification");
    }
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === notifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(notifications.map((n) => n.id));
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "sent":
        return <FiCheckCircle className="text-green-500" />;
      case "pending":
        return <FiClock className="text-yellow-500" />;
      case "failed":
        return <FiAlertCircle className="text-red-500" />;
      default:
        return <FiInfo className="text-gray-500" />;
    }
  };

  const getChannelIcon = (channel) => {
    switch (channel) {
      case "email":
        return <FiMail className="text-blue-500" />;
      case "slack":
        return <FiSlack className="text-purple-500" />;
      default:
        return <FiBell className="text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6 pt-16">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Notifications
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and track user notifications
          </p>
        </div>
        <button
          onClick={() => setShowComposeModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <FiSend />
          <span>Compose Notification</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <StatsCard
          icon={FiBell}
          label="Total Sent"
          value={stats.total}
          color="purple"
        />
        <StatsCard
          icon={FiCheckCircle}
          label="Delivered"
          value={stats.sent}
          color="green"
        />
        <StatsCard
          icon={FiClock}
          label="Pending"
          value={stats.pending}
          color="yellow"
        />
        <StatsCard
          icon={FiAlertCircle}
          label="Failed"
          value={stats.failed}
          color="red"
        />
        <StatsCard
          icon={FiUsers}
          label="Open Rate"
          value={`${stats.openRate}%`}
          color="blue"
        />
      </div>

      {/* Filters and Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2
			  focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="all">All Notifications</option>
              <option value="sent">Sent</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>

			{selectedNotifications.length > 0 && (
			<div className="flex items-center gap-3">
				<span className="text-sm text-gray-600 dark:text-gray-300">
				{selectedNotifications.length} selected
				</span>
				<button
				onClick={handleBulkResend}
				type="button"
				className="
					inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-semibold
					shadow-sm transition-colors
					bg-purple-600 text-white hover:bg-purple-700 active:bg-purple-800
					dark:bg-purple-500 dark:hover:bg-purple-400 dark:active:bg-purple-500
					focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/60
					disabled:opacity-50 disabled:pointer-events-none
				"
				disabled={selectedNotifications.length === 0}
				title="Resend selected"
				>
				<FiRefreshCw size={14} />
				<span>Resend</span>
				</button>
			</div>
			)}
          </div>

          <button
            onClick={fetchNotifications}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg dark:text-inherit dark:hover:text-gray-800"
          >
            <FiRefreshCw />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {notifications.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={
                          selectedNotifications.length ===
                            notifications.length && notifications.length > 0
                        }
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Channel
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Recipient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Issue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Message
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {notifications.map((notification) => (
                    <NotificationRow
                      key={notification.id}
                      notification={notification}
                      isSelected={selectedNotifications.includes(
                        notification.id
                      )}
                      onSelect={() => {
                        setSelectedNotifications((prev) =>
                          prev.includes(notification.id)
                            ? prev.filter((id) => id !== notification.id)
                            : [...prev, notification.id]
                        );
                      }}
                      onResend={handleResend}
                      onDelete={handleDelete}
                      getStatusIcon={getStatusIcon}
                      getChannelIcon={getChannelIcon}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <FiBell className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500">No notifications found</p>
            </div>
          )}
        </div>
      )}

      {/* Compose Modal */}
      {showComposeModal && (
        <ComposeNotificationModal
          onClose={() => setShowComposeModal(false)}
          onSuccess={() => {
            fetchNotifications();
            fetchStats();
            setShowComposeModal(false);
          }}
        />
      )}
    </div>
  );
}

// Stats Card Component
function StatsCard({ icon: Icon, label, value, color }) {
  const colorClasses = {
    purple: "bg-purple-50 text-purple-600",
    green: "bg-green-50 text-green-600",
    yellow: "bg-yellow-50 text-yellow-600",
    red: "bg-red-50 text-red-600",
    blue: "bg-blue-50 text-blue-600",
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon size={20} />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        {value}
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{label}</p>
    </div>
  );
}

// Notification Row Component
function NotificationRow({
  notification,
  isSelected,
  onSelect,
  onResend,
  onDelete,
  getStatusIcon,
  getChannelIcon,
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
        <td className="px-6 py-4">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
          />
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center space-x-2">
            {getStatusIcon(notification.status)}
            <span className="text-sm capitalize">{notification.status}</span>
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center space-x-2">
            {getChannelIcon(notification.channel || "email")}
            <span className="text-sm capitalize">
              {notification.channel || "email"}
            </span>
          </div>
        </td>
        <td className="px-6 py-4">
          <p className="text-sm text-gray-900 dark:text-gray-100">
            {notification.recipient_email}
          </p>
        </td>
        <td className="px-6 py-4">
          <p className="text-sm text-gray-900 dark:text-inherit">
            {notification.issue?.title || "General Update"}
          </p>
        </td>
        <td className="px-6 py-4 max-w-xs">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm text-gray-700 hover:text-gray-900 dark:text-inherit text-left"
          >
            {expanded ? (
              notification.message
            ) : (
              <span className="line-clamp-2">{notification.message}</span>
            )}
          </button>
        </td>
        <td className="px-6 py-4">
          <p className="text-sm text-gray-600 dark:text-inherit">
            {formatDistanceToNow(new Date(notification.sent_at), {
              addSuffix: true,
            })}
          </p>
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center space-x-2">
            {notification.status === "failed" && (
              <button
                onClick={() => onResend(notification.id)}
                className="text-gray-600 hover:text-purple-600 dark:text-inherit"
                title="Resend"
              >
                <FiRefreshCw size={16} />
              </button>
            )}
            <button
              onClick={() => onDelete(notification.id)}
              className="text-gray-600 dark:text-inherit hover:text-red-600"
              title="Delete"
            >
              <FiTrash2 size={16} />
            </button>
          </div>
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan="8" className="px-6 py-4 bg-gray-50">
            <div className="text-sm text-gray-700">
              <p className="font-medium mb-2">Full Message:</p>
              <p className="whitespace-pre-wrap">{notification.message}</p>
              {notification.error && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                  <p className="font-medium text-red-700">Error:</p>
                  <p className="text-red-600">{notification.error}</p>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// Compose Notification Modal
function ComposeNotificationModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    recipients: "",
    subject: "",
    message: "",
    channel: "email",
    issueId: null,
    sendToAllAffected: false,
  });
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      const response = await api.get("/issues/");
      setIssues(response.data);
    } catch (error) {
      console.error("Failed to fetch issues");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (formData.sendToAllAffected && formData.issueId) {
        await api.post("/notifications/send_to_affected/", {
          issue_id: formData.issueId,
          subject: formData.subject,
          message: formData.message,
          channel: formData.channel,
        });
      } else {
        const recipientList = formData.recipients
          .split(",")
          .map((email) => email.trim())
          .filter(Boolean);
        await api.post("/notifications/send/", {
          recipients: recipientList,
          subject: formData.subject,
          message: formData.message,
          channel: formData.channel,
          issue_id: formData.issueId,
        });
      }

      toast.success("Notification sent successfully");
      onSuccess();
    } catch (error) {
      toast.error("Failed to send notification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto transition-colors">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Compose Notification
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/60"
              aria-label="Close"
            >
              <FiX size={20} className="text-gray-700 dark:text-gray-300" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Channel Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Channel
              </label>
              <div className="flex gap-4">
                <label className="flex items-center text-gray-800 dark:text-gray-200">
                  <input
                    type="radio"
                    value="email"
                    checked={formData.channel === "email"}
                    onChange={(e) =>
                      setFormData({ ...formData, channel: e.target.value })
                    }
                    className="mr-2 accent-purple-600 dark:accent-purple-500"
                  />
                  <FiMail className="mr-1" />
                  Email
                </label>
                <label className="flex items-center text-gray-800 dark:text-gray-200">
                  <input
                    type="radio"
                    value="slack"
                    checked={formData.channel === "slack"}
                    onChange={(e) =>
                      setFormData({ ...formData, channel: e.target.value })
                    }
                    className="mr-2 accent-purple-600 dark:accent-purple-500"
                  />
                  <FiSlack className="mr-1" />
                  Slack
                </label>
              </div>
            </div>

            {/* Issue Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Related Issue (Optional)
              </label>
              <select
                value={formData.issueId || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    issueId: e.target.value || null,
                  })
                }
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">None</option>
                {issues.map((issue) => (
                  <option key={issue.id} value={issue.id}>
                    {issue.title} ({issue.feedback_count} users)
                  </option>
                ))}
              </select>
            </div>

            {/* Send to affected users */}
            {formData.issueId && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="sendToAllAffected"
                  checked={formData.sendToAllAffected}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sendToAllAffected: e.target.checked,
                    })
                  }
                  className="mr-2 accent-purple-600 dark:accent-purple-500"
                />
                <label
                  htmlFor="sendToAllAffected"
                  className="text-sm text-gray-700 dark:text-gray-300"
                >
                  Send to all users who reported this issue
                </label>
              </div>
            )}

            {/* Recipients */}
            {!formData.sendToAllAffected && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Recipients (comma-separated emails)
                </label>
                <textarea
                  value={formData.recipients}
                  onChange={(e) =>
                    setFormData({ ...formData, recipients: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows="2"
                  placeholder="user1@example.com, user2@example.com"
                  required={!formData.sendToAllAffected}
                />
              </div>
            )}

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Subject
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Message
              </label>
              <textarea
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows="6"
                required
              />
            </div>

            {/* Message Preview */}
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Preview:
              </p>
              <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-3">
                <p className="font-semibold text-sm mb-1 text-gray-900 dark:text-gray-100">
                  {formData.subject || "Subject Line"}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {formData.message || "Your message will appear here..."}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/60"
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
                  dark:bg-purple-500 dark:hover:bg-purple-400 dark:active:bg-purple-500
                  disabled:opacity-50 disabled:pointer-events-none
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/60
                "
              >
                {loading ? "Sending..." : "Send Notification"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Notifications;
