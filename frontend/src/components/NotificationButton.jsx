import { useEffect, useRef, useState, useMemo } from 'react';
import { FiBell, FiCheck, FiChevronRight } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/mockData'; // switch to '../api/axiosInstance' for real API

const KEYS = {
  inbox: 'notifications:lastSeenAt',
  admin: 'adminfeed:lastSeenAt',
};

export default function NotificationButton() {
  const { user } = useAuth() || {};
  const currentEmail = (user?.email || 'admin@trace.com').toLowerCase(); // fallback for demo
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('admin'); // 'admin' | 'inbox'
  const [inbox, setInbox] = useState([]);
  const [adminFeed, setAdminFeed] = useState([]);
  const [unreadInbox, setUnreadInbox] = useState(0);
  const [unreadAdmin, setUnreadAdmin] = useState(0);
  const [loading, setLoading] = useState(false);
  const btnRef = useRef(null);
  const panelRef = useRef(null);
  const navigate = useNavigate();

  const totalBadge = useMemo(() => unreadAdmin + unreadInbox, [unreadAdmin, unreadInbox]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (!panelRef.current || !btnRef.current) return;
      if (!panelRef.current.contains(e.target) && !btnRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  async function fetchData() {
    try {
      setLoading(true);
      const [notifRes, issuesRes, feedbackRes] = await Promise.all([
        api.get('/notifications/'),
        api.get('/issues/'),
        api.get('/feedback/'),
      ]);

      // INBOX: notifications sent to current user
      const allNotif = Array.isArray(notifRes.data) ? notifRes.data : [];
      const inboxList = allNotif
        .filter(n => (n.recipient_email || '').toLowerCase() === currentEmail)
        .sort((a, b) => new Date(b.sent_at) - new Date(a.sent_at))
        .slice(0, 8);

      // ADMIN FEED (derived from mock issues + feedback)
      const issues = Array.isArray(issuesRes.data) ? issuesRes.data : [];
      const feedback = Array.isArray(feedbackRes.data) ? feedbackRes.data : [];

      const resolved = issues
        .filter(i => i.status === 'resolved')
        .map(i => ({
          id: `res-${i.id}`,
          type: 'issue_resolved',
          subject: `Issue resolved: ${i.title}`,
          message: `${i.feedback_count || 0} linked feedback`,
          time: new Date(i.updated_at || i.created_at || Date.now()).toISOString(),
          color: '#10B981',
        }));

      const highPriority = issues
        .filter(i => (i.priority >= 3) && i.status !== 'resolved')
        .map(i => ({
          id: `hp-${i.id}`,
          type: 'high_priority',
          subject: `High priority ${i.status.replace('_', ' ')}: ${i.title}`,
          message: `${i.feedback_count || 0} users affected`,
          time: new Date(i.updated_at || i.created_at || Date.now()).toISOString(),
          color: '#EF4444',
        }));

      const recentFeedback = [...feedback]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5)
        .map(f => ({
          id: `fb-${f.id}`,
          type: 'new_feedback',
          subject: `New feedback from ${f.user_email}`,
          message: (f.content || '').slice(0, 90),
          time: new Date(f.created_at || Date.now()).toISOString(),
          color: '#8B5CF6',
        }));

      const adminList = [...resolved, ...highPriority, ...recentFeedback]
        .sort((a, b) => new Date(b.time) - new Date(a.time))
        .slice(0, 10);

      setInbox(inboxList);
      setAdminFeed(adminList);

      // unread calculations
      const lastSeenInbox = Number(localStorage.getItem(KEYS.inbox) || 0);
      const lastSeenAdmin = Number(localStorage.getItem(KEYS.admin) || 0);
      setUnreadInbox(inboxList.filter(n => new Date(n.sent_at).getTime() > lastSeenInbox).length);
      setUnreadAdmin(adminList.filter(n => new Date(n.time).getTime() > lastSeenAdmin).length);
    } finally {
      setLoading(false);
    }
  }

  function markAllRead(which) {
    const key = which === 'admin' ? KEYS.admin : KEYS.inbox;
    localStorage.setItem(key, String(Date.now()));
    if (which === 'admin') setUnreadAdmin(0);
    else setUnreadInbox(0);
  }

  return (
    <div className="relative">
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen(v => !v)}
        className="relative p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/60"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Notifications"
        title="Notifications"
      >
        <FiBell size={20} />
        {totalBadge > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] leading-[18px] text-center">
            {totalBadge > 99 ? '99+' : totalBadge}
          </span>
        )}
      </button>

      {open && (
        <div
          ref={panelRef}
          role="menu"
          className="absolute right-0 mt-2 w-[22rem] rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg overflow-hidden z-50"
        >
          {/* Header with tabs */}
          <div className="px-4 pt-3 pb-2 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <TabButton
                  active={tab === 'admin'}
                  onClick={() => setTab('admin')}
                  label="Admin"
                  badge={unreadAdmin}
                />
                <TabButton
                  active={tab === 'inbox'}
                  onClick={() => setTab('inbox')}
                  label="Inbox"
                  badge={unreadInbox}
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={fetchData}
                  className="text-xs text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                >
                  Refresh
                </button>
                <button
                  onClick={() => markAllRead(tab)}
                  className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 hover:underline"
                >
                  <FiCheck size={12} /> Mark all read
                </button>
              </div>
            </div>
          </div>

          {/* List */}
          <ul className="max-h-80 overflow-auto divide-y divide-gray-200 dark:divide-gray-700">
            {loading && (
              <li className="px-4 py-6 text-sm text-gray-600 dark:text-gray-300">Loading…</li>
            )}
            {!loading && tab === 'admin' && adminFeed.length === 0 && (
              <li className="px-4 py-6 text-sm text-gray-600 dark:text-gray-300">No admin activity</li>
            )}
            {!loading && tab === 'inbox' && inbox.length === 0 && (
              <li className="px-4 py-6 text-sm text-gray-600 dark:text-gray-300">No notifications</li>
            )}

            {!loading && tab === 'admin' && adminFeed.map((n) => (
              <li key={n.id} className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors">
                <div className="flex items-start gap-3">
                  <span
                    className="mt-1 inline-block w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: n.color }}
                    aria-hidden
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {n.subject}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">{n.message}</p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(n.time).toLocaleString()}
                    </p>
                  </div>
                </div>
              </li>
            ))}

            {!loading && tab === 'inbox' && inbox.map((n) => (
              <li key={n.id} className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors">
                <div className="flex items-start gap-3">
                  <span
                    className="mt-1 inline-block w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: n.channel === 'slack' ? '#7C3AED' : '#2563EB' }}
                    aria-hidden
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {n.subject || n.issue?.title || 'Notification'}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">{n.message}</p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(n.sent_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <button
            onClick={() => {
              setOpen(false);
              navigate(tab === 'admin' ? '/issues' : '/notifications');
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            View {tab === 'admin' ? 'issues' : 'all notifications'} <FiChevronRight />
          </button>
        </div>
      )}
    </div>
  );
}

function TabButton({ active, onClick, label, badge }) {
  return (
    <button
      onClick={onClick}
      className={`
        relative px-3 py-1.5 text-xs font-medium rounded-md transition-colors
        ${active
          ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm'
          : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
        }
      `}
    >
      {label}
      {badge > 0 && (
        <span className="ml-1 inline-flex min-w-[16px] h-[16px] px-1 rounded-full bg-red-500 text-white text-[10px] leading-[16px] items-center justify-center">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </button>
  );
}