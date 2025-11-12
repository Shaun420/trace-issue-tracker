import { useEffect, useRef, useState } from 'react';
import { FiUser, FiSettings, FiLogOut } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function UserMenu() {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Close on outside click / Esc
  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (!menuRef.current || !btnRef.current) return;
      if (!menuRef.current.contains(e.target) && !btnRef.current.contains(e.target)) {
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

  const displayName =
    user?.first_name || user?.username || 'Admin';
  const role = user?.role ? user.role[0].toUpperCase() + user.role.slice(1) : 'Admin';

  return (
    <div className="relative">
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex items-center space-x-2 p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/60"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <div className="relative">
          <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center">
            <FiUser className="text-purple-600 dark:text-purple-400" size={16} />
          </div>
        </div>
        <span className="hidden sm:inline text-sm font-medium">{displayName}</span>
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          className="absolute right-0 mt-2 w-56 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg overflow-hidden z-50"
        >
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{displayName}</p>
            <p className="text-xs text-gray-600 dark:text-gray-300">{role}</p>
          </div>

          <div className="py-1">
            <button
              onClick={() => { setOpen(false); navigate('/settings?tab=profile'); }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
              role="menuitem"
            >
              <FiUser /> Profile
            </button>
            <button
              onClick={() => { setOpen(false); navigate('/settings'); }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
              role="menuitem"
            >
              <FiSettings /> Settings
            </button>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 py-1">
            <button
              onClick={() => { setOpen(false); logout(); }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              role="menuitem"
            >
              <FiLogOut /> Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}