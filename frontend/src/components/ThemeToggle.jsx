import { FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../contexts/ThemeContext';

function ThemeToggle({ showLabel = false, size = 'default' }) {
  const { theme, toggleTheme, isDark } = useTheme();

  const sizes = {
    small: 'p-1.5',
    default: 'p-2',
    large: 'p-3',
  };

  const iconSizes = {
    small: 16,
    default: 20,
    large: 24,
  };

  const handleClick = () => {
    console.log('🖱️ ThemeToggle clicked'); // Debug log
    toggleTheme();
  };

  console.log('🎨 ThemeToggle render - Current theme:', theme, 'isDark:', isDark); // Debug log

  return (
    <button
      onClick={handleClick}
      className={`${sizes[size]} text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center space-x-2`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? (
        <>
          <FiSun size={iconSizes[size]} className="text-yellow-500" />
          {showLabel && <span className="text-sm font-medium">Light Mode</span>}
        </>
      ) : (
        <>
          <FiMoon size={iconSizes[size]} className="text-yellow-500" />
          {showLabel && <span className="text-sm font-medium">Dark Mode</span>}
        </>
      )}
    </button>
  );
}

export default ThemeToggle;