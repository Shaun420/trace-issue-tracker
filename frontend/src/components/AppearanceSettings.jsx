import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { 
  FiMoon, FiSun, FiMonitor, FiCheck, FiInfo, FiMessageSquare
} from 'react-icons/fi';

// Appearance Settings Component
export function AppearanceSettings() {
  const { theme, setLightTheme, setDarkTheme } = useTheme();
  const [systemTheme, setSystemTheme] = useState(false);

  useEffect(() => {
    // Check if using system preference
    const savedTheme = localStorage.getItem('theme');
    setSystemTheme(!savedTheme);
  }, []);

  const handleThemeChange = (newTheme) => {
    if (newTheme === 'light') {
      setLightTheme();
      setSystemTheme(false);
    } else if (newTheme === 'dark') {
      setDarkTheme();
      setSystemTheme(false);
    } else if (newTheme === 'system') {
      // Use system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        setDarkTheme();
      } else {
        setLightTheme();
      }
      setSystemTheme(true);
      localStorage.removeItem('theme'); // Remove saved preference to use system
    }
  };

  const themeOptions = [
    {
      value: 'light',
      label: 'Light',
      icon: FiSun,
      description: 'Clean and bright interface',
      gradient: 'from-yellow-400 to-orange-400'
    },
    {
      value: 'dark',
      label: 'Dark',
      icon: FiMoon,
      description: 'Easy on the eyes in low light',
      gradient: 'from-indigo-600 to-purple-600'
    },
    {
      value: 'system',
      label: 'System',
      icon: FiMonitor,
      description: 'Automatically match your system preference',
      gradient: 'from-blue-500 to-cyan-500'
    },
  ];

  const currentSelection = systemTheme ? 'system' : theme;

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
        Appearance
      </h2>
      
      <div className="space-y-8">
        {/* Theme Selection */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">
            Theme Preference
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {themeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleThemeChange(option.value)}
                className={`relative p-6 border-2 rounded-xl transition-all text-left overflow-hidden group ${
                  currentSelection === option.value
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-lg scale-105'
                    : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-md'
                }`}
              >
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${option.gradient} opacity-0 group-hover:opacity-5 transition-opacity`}></div>
                
                {/* Content */}
                <div className="relative z-10">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={`p-3 rounded-lg ${
                      currentSelection === option.value
                        ? 'bg-purple-100 dark:bg-purple-900/40'
                        : 'bg-gray-100 dark:bg-gray-800'
                    }`}>
                      <option.icon 
                        className={`${
                          currentSelection === option.value
                            ? 'text-purple-600 dark:text-purple-400'
                            : 'text-gray-600 dark:text-gray-400'
                        }`} 
                        size={24} 
                      />
                    </div>
                    <div className="flex-1">
                      <span className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                        {option.label}
                      </span>
                      {currentSelection === option.value && (
                        <FiCheck className="inline ml-2 text-purple-600 dark:text-purple-400" size={20} />
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {option.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Current Theme Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <FiInfo className="text-blue-600 dark:text-blue-400 mt-0.5" size={20} />
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Current Theme: <span className="capitalize">{currentSelection}</span>
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                {systemTheme 
                  ? 'Your theme will automatically switch based on your system settings.'
                  : `You're currently using ${theme} mode.`
                }
              </p>
            </div>
          </div>
        </div>

        {/* Live Preview */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">
            Preview
          </h3>
          <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            {/* Preview Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                  Sample Interface
                </h4>
                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-semibold rounded-full">
                  Active
                </span>
              </div>
            </div>
            
            {/* Preview Content */}
            <div className="bg-white dark:bg-gray-800 p-6 space-y-4">
              <p className="text-gray-900 dark:text-gray-100">
                This is how text will appear in the selected theme.
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Secondary text maintains good contrast and readability.
              </p>
              
              <div className="flex space-x-3 pt-2">
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  Primary Button
                </button>
                <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  Secondary Button
                </button>
              </div>

              {/* Sample Card */}
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Sample Card
                  </span>
                  <FiMessageSquare className="text-gray-400 dark:text-gray-500" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Cards and containers adapt to your chosen theme automatically.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Options */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">
            Display Options
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  Reduce Motion
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Minimize animations and transitions
                </p>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-1" />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  High Contrast
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Increase color contrast for better visibility
                </p>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-1" />
              </button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
          >
            <FiCheck size={18} />
            <span>Save Preferences</span>
          </button>
        </div>
      </div>
    </div>
  );
}