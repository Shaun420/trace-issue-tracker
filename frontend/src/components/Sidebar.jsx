import { NavLink } from 'react-router-dom';
import { 
  FiHome, 
  FiInbox, 
  FiCheckSquare, 
  FiBell, 
  FiSettings 
} from 'react-icons/fi';

function Sidebar() {
  const menuItems = [
    { path: '/', icon: FiHome, label: 'Dashboard' },
    { path: '/feedback', icon: FiInbox, label: 'Feedback Inbox' },
    { path: '/issues', icon: FiCheckSquare, label: 'Issues' },
    { path: '/notifications', icon: FiBell, label: 'Notifications' },
    { path: '/settings', icon: FiSettings, label: 'Settings' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 pt-20 transition-colors">
      <nav className="p-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                isActive
                  ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`
            }
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;