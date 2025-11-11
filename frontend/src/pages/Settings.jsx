import { useState, useEffect } from 'react';
import { 
  FiUser, FiMail, FiBell, FiLink, FiUsers, FiKey, 
  FiShield, FiDatabase, FiSlack, FiGithub, FiSave,
  FiCheck, FiX, FiEdit2, FiTrash2, FiPlus, FiCopy,
  FiMoon,
  FiToggleLeft, FiToggleRight, FiDownload, FiUpload,
  FiAlertCircle, FiInfo, FiExternalLink, FiRefreshCw
} from 'react-icons/fi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/mockData';
import { AppearanceSettings } from "../components/AppearanceSettings";

function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const { user, logout } = useAuth();

  const tabs = [
    { id: 'profile', label: 'Profile', icon: FiUser },
	{ id: 'appearance', label: 'Appearance', icon: FiMoon },
    { id: 'notifications', label: 'Notifications', icon: FiBell },
    { id: 'integrations', label: 'Integrations', icon: FiLink },
    { id: 'team', label: 'Team', icon: FiUsers },
    { id: 'api', label: 'API & Webhooks', icon: FiKey },
    { id: 'security', label: 'Security', icon: FiShield },
    { id: 'data', label: 'Data & Export', icon: FiDatabase },
  ];

  return (
    <div className="max-w-7xl mx-auto py-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-inherit">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and application preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:w-64">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-purple-50 text-purple-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <tab.icon size={20} />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {activeTab === 'profile' && <ProfileSettings user={user} />}
            {activeTab === 'notifications' && <NotificationSettings />}
			{activeTab === 'appearance' && <AppearanceSettings />}
            {activeTab === 'integrations' && <IntegrationSettings />}
            {activeTab === 'team' && <TeamSettings />}
            {activeTab === 'api' && <ApiSettings />}
            {activeTab === 'security' && <SecuritySettings onLogout={logout} />}
            {activeTab === 'data' && <DataSettings />}
          </div>
        </div>
      </div>
    </div>
  );
}

// Profile Settings Component
function ProfileSettings({ user }) {
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    role: user?.role || 'support',
    bio: user?.bio || '',
    timezone: user?.timezone || 'UTC',
  });
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.put('/users/profile/', formData);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar Upload */}
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold text-purple-600">
                {formData.firstName?.[0] || formData.username?.[0] || 'U'}
              </span>
            </div>
            <button
              type="button"
              className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50"
            >
              <FiEdit2 size={14} />
            </button>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-inherit">{formData.username}</h3>
            <p className="text-sm text-gray-500 dark:text-inherit">{formData.email}</p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="admin">Admin</option>
              <option value="pm">Product Manager</option>
              <option value="dev">Developer</option>
              <option value="support">Support Agent</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timezone
            </label>
            <select
              value={formData.timezone}
              onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
              <option value="Europe/London">London</option>
              <option value="Europe/Paris">Paris</option>
              <option value="Asia/Tokyo">Tokyo</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bio
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            rows="3"
            placeholder="Tell us about yourself..."
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

// Notification Settings Component
function NotificationSettings() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    slackNotifications: false,
    newFeedback: true,
    issueResolved: true,
    issueAssigned: true,
    weeklyReport: false,
    dailyDigest: false,
  });

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    try {
      await api.put('/users/notification-preferences/', settings);
      toast.success('Notification preferences saved');
    } catch (error) {
      toast.error('Failed to save preferences');
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-6">Notification Preferences</h2>
      
      <div className="space-y-6">
        {/* Channels */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-inherit mb-4">Notification Channels</h3>
          <div className="space-y-3">
            <ToggleSwitch
              label="Email Notifications"
              description="Receive notifications via email"
              enabled={settings.emailNotifications}
              onChange={() => handleToggle('emailNotifications')}
              icon={FiMail}
            />
            <ToggleSwitch
              label="Slack Notifications"
              description="Receive notifications in Slack"
              enabled={settings.slackNotifications}
              onChange={() => handleToggle('slackNotifications')}
              icon={FiSlack}
            />
          </div>
        </div>

        {/* Events */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-inherit mb-4">Notification Events</h3>
          <div className="space-y-3">
            <ToggleSwitch
              label="New Feedback"
              description="When new feedback is received"
              enabled={settings.newFeedback}
              onChange={() => handleToggle('newFeedback')}
            />
            <ToggleSwitch
              label="Issue Resolved"
              description="When an issue you reported is resolved"
              enabled={settings.issueResolved}
              onChange={() => handleToggle('issueResolved')}
            />
            <ToggleSwitch
              label="Issue Assigned"
              description="When an issue is assigned to you"
              enabled={settings.issueAssigned}
              onChange={() => handleToggle('issueAssigned')}
            />
          </div>
        </div>

        {/* Reports */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-inherit mb-4">Reports & Digests</h3>
          <div className="space-y-3">
            <ToggleSwitch
              label="Weekly Report"
              description="Receive weekly summary every Monday"
              enabled={settings.weeklyReport}
              onChange={() => handleToggle('weeklyReport')}
            />
            <ToggleSwitch
              label="Daily Digest"
              description="Daily summary of activities"
              enabled={settings.dailyDigest}
              onChange={() => handleToggle('dailyDigest')}
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}

// Integration Settings Component
function IntegrationSettings() {
  const [integrations, setIntegrations] = useState([
    {
      id: 'slack',
      name: 'Slack',
      icon: FiSlack,
      description: 'Connect Slack to receive feedback and send notifications',
      connected: false,
      config: { webhook: '', channel: '' }
    },
    {
      id: 'github',
      name: 'GitHub',
      icon: FiGithub,
      description: 'Sync issues with GitHub Issues',
      connected: false,
      config: { token: '', repo: '' }
    },
    {
      id: 'email',
      name: 'Email',
      icon: FiMail,
      description: 'Configure email settings for notifications',
      connected: true,
      config: { smtp: 'smtp.gmail.com', port: 587 }
    },
  ]);

  const [configModal, setConfigModal] = useState(null);

  const handleConnect = (integrationId) => {
    setConfigModal(integrationId);
  };

  const handleDisconnect = async (integrationId) => {
    if (!confirm('Are you sure you want to disconnect this integration?')) return;
    
    setIntegrations(prev => prev.map(int => 
      int.id === integrationId ? { ...int, connected: false } : int
    ));
    toast.success('Integration disconnected');
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-6">Integrations</h2>
      
      <div className="space-y-4">
        {integrations.map((integration) => (
          <div key={integration.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <integration.icon size={24} className="text-gray-700" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-inherit">{integration.name}</h3>
                  <p className="text-sm text-gray-500">{integration.description}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {integration.connected ? (
                  <>
                    <span className="flex items-center space-x-1 text-green-600">
                      <FiCheck size={16} />
                      <span className="text-sm">Connected</span>
                    </span>
                    <button
                      onClick={() => handleDisconnect(integration.id)}
                      className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      Disconnect
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleConnect(integration.id)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Connect
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Integration Config Modal */}
      {configModal && (
        <IntegrationConfigModal
          integration={integrations.find(i => i.id === configModal)}
          onClose={() => setConfigModal(null)}
          onSave={(config) => {
            setIntegrations(prev => prev.map(int => 
              int.id === configModal 
                ? { ...int, connected: true, config } 
                : int
            ));
            setConfigModal(null);
            toast.success('Integration connected successfully');
          }}
        />
      )}
    </div>
  );
}

// Team Settings Component
function TeamSettings() {
  const [teamMembers, setTeamMembers] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin', status: 'active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'pm', status: 'active' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'dev', status: 'active' },
  ]);
  const [inviteModal, setInviteModal] = useState(false);

  const handleRemoveMember = async (memberId) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;
    
    setTeamMembers(prev => prev.filter(member => member.id !== memberId));
    toast.success('Team member removed');
  };

  const roleLabels = {
    admin: 'Admin',
    pm: 'Product Manager',
    dev: 'Developer',
    support: 'Support Agent',
  };

  const roleColors = {
    admin: 'bg-purple-100 text-purple-700',
    pm: 'bg-blue-100 text-blue-700',
    dev: 'bg-green-100 text-green-700',
    support: 'bg-gray-100 text-gray-700',
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Team Members</h2>
        <button
          onClick={() => setInviteModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <FiPlus />
          <span>Invite Member</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-gray-200">
            <tr>
              <th className="text-left pb-3 text-sm font-medium text-gray-700">Member</th>
              <th className="text-left pb-3 text-sm font-medium text-gray-700">Role</th>
              <th className="text-left pb-3 text-sm font-medium text-gray-700">Status</th>
              <th className="text-left pb-3 text-sm font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {teamMembers.map((member) => (
              <tr key={member.id}>
                <td className="py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-purple-600">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-inherit">{member.name}</p>
                      <p className="text-sm text-gray-500 dark:text-inherit">{member.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded ${roleColors[member.role]}`}>
                    {roleLabels[member.role]}
                  </span>
                </td>
                <td className="py-4">
                  <span className="flex items-center space-x-1 text-green-600">
                    <FiCheck size={16} />
                    <span className="text-sm">Active</span>
                  </span>
                </td>
                <td className="py-4">
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invite Modal */}
      {inviteModal && (
        <InviteMemberModal
          onClose={() => setInviteModal(false)}
          onInvite={(data) => {
            // Handle invite
            toast.success('Invitation sent');
            setInviteModal(false);
          }}
        />
      )}
    </div>
  );
}

// API Settings Component
function ApiSettings() {
  const [apiKeys, setApiKeys] = useState([
    { id: 1, name: 'Production API Key', key: 'sk_live_...abc123', created: '2024-01-15', lastUsed: '2024-01-20' },
    { id: 2, name: 'Development API Key', key: 'sk_test_...xyz789', created: '2024-01-10', lastUsed: '2024-01-19' },
  ]);
  const [webhooks, setWebhooks] = useState([
    { id: 1, url: 'https://example.com/webhook', events: ['feedback.created', 'issue.resolved'], active: true },
  ]);

  const handleCopyKey = (key) => {
    navigator.clipboard.writeText(key);
    toast.success('API key copied to clipboard');
  };

  const handleDeleteKey = (keyId) => {
    if (!confirm('Are you sure you want to delete this API key?')) return;
    setApiKeys(prev => prev.filter(k => k.id !== keyId));
    toast.success('API key deleted');
  };

  return (
    <div className="p-6">
      <div className="space-y-8">
        {/* API Keys */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">API Keys</h3>
            <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
              <FiPlus />
              <span>Generate New Key</span>
            </button>
          </div>

          <div className="space-y-3">
            {apiKeys.map((apiKey) => (
              <div key={apiKey.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-inherit">{apiKey.name}</p>
                    <p className="text-sm text-gray-500 dark:text-inherit font-mono">{apiKey.key}</p>
                    <p className="text-xs text-gray-400 dark:text-inherit mt-1">
                      Created {apiKey.created} • Last used {apiKey.lastUsed}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleCopyKey(apiKey.key)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                      <FiCopy size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteKey(apiKey.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Webhooks */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Webhooks</h3>
            <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
              <FiPlus />
              <span>Add Webhook</span>
            </button>
          </div>

          <div className="space-y-3">
            {webhooks.map((webhook) => (
              <div key={webhook.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-inherit">{webhook.url}</p>
                    <p className="text-sm text-gray-500">
                      Events: {webhook.events.join(', ')}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`flex items-center space-x-1 ${webhook.active ? 'text-green-600' : 'text-gray-400'}`}>
                      {webhook.active ? <FiCheck size={16} /> : <FiX size={16} />}
                      <span className="text-sm">{webhook.active ? 'Active' : 'Inactive'}</span>
                    </span>
                    <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                      <FiEdit2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Security Settings Component
function SecuritySettings({ onLogout }) {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessions, setSessions] = useState([
    { id: 1, device: 'Chrome on MacOS', location: 'San Francisco, CA', lastActive: '2 minutes ago', current: true },
    { id: 2, device: 'Safari on iPhone', location: 'San Francisco, CA', lastActive: '1 hour ago', current: false },
  ]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    // Handle password change
    toast.success('Password updated successfully');
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleRevokeSession = (sessionId) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    toast.success('Session revoked');
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-6">Security Settings</h2>
      
      <div className="space-y-8">
        {/* Change Password */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Change Password</h3>
          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Update Password
            </button>
          </form>
        </div>

        {/* Two-Factor Authentication */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Two-Factor Authentication</h3>
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-inherit">Enable 2FA</p>
              <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
            </div>
            <button
              onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                twoFactorEnabled ? 'bg-purple-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Active Sessions */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Active Sessions</h3>
          <div className="space-y-3">
            {sessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-inherit">
                    {session.device}
                    {session.current && (
                      <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                        Current
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-gray-500">
                    {session.location} • {session.lastActive}
                  </p>
                </div>
                {!session.current && (
                  <button
                    onClick={() => handleRevokeSession(session.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Revoke
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Danger Zone */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-red-600">Danger Zone</h3>
          <div className="border border-red-200 rounded-lg p-4 bg-red-50">
            <p className="text-sm text-gray-700 dark:text-inherit mb-4">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={onLogout}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Sign Out
              </button>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Data Settings Component
function DataSettings() {
  const handleExport = async (format) => {
    toast.success(`Exporting data as ${format}...`);
    // Handle export
  };

  const handleImport = async (file) => {
    toast.success('Import started...');
    // Handle import
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-6">Data Management</h2>
      
      <div className="space-y-8">
        {/* Export Data */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Export Data</h3>
          <p className="text-sm text-gray-600 mb-4">
            Download all your data including feedback, issues, and user information.
          </p>
          <div className="flex space-x-3">
            <button
              onClick={() => handleExport('CSV')}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <FiDownload />
              <span>Export as CSV</span>
            </button>
            <button
              onClick={() => handleExport('JSON')}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <FiDownload />
              <span>Export as JSON</span>
            </button>
          </div>
        </div>

        {/* Import Data */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Import Data</h3>
          <p className="text-sm text-gray-600 dark:text-inherit mb-4">
            Import feedback and issues from CSV or JSON files.
          </p>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <FiUpload className="mx-auto text-gray-400 dark:text-inherit mb-4" size={48} />
            <p className="text-gray-600 mb-2">Drop files here or click to upload</p>
            <input
              type="file"
              accept=".csv,.json"
              onChange={(e) => handleImport(e.target.files[0])}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="inline-block px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 cursor-pointer"
            >
              Choose File
            </label>
          </div>
        </div>

        {/* Data Retention */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Data Retention</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-inherit">Feedback Retention</p>
                <p className="text-sm text-gray-500">Automatically delete feedback older than</p>
              </div>
              <select className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option>Never</option>
                <option>6 months</option>
                <option>1 year</option>
                <option>2 years</option>
              </select>
            </div>
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-inherit">Resolved Issues</p>
                <p className="text-sm text-gray-500">Archive resolved issues after</p>
              </div>
              <select className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option>30 days</option>
                <option>90 days</option>
                <option>6 months</option>
                <option>Never</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Utility Components
function ToggleSwitch({ label, description, enabled, onChange, icon: Icon }) {
  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
      <div className="flex items-center space-x-3">
        {Icon && <Icon className="text-gray-400" size={20} />}
        <div>
          <p className="font-medium text-gray-900 dark:text-inherit">{label}</p>
          {description && <p className="text-sm text-gray-500">{description}</p>}
        </div>
      </div>
      <button
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? 'bg-purple-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

function IntegrationConfigModal({ integration, onClose, onSave }) {
  const [config, setConfig] = useState(integration.config);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(config);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <h3 className="text-xl font-semibold mb-4">Configure {integration.name}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          {integration.id === 'slack' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Webhook URL
                </label>
                <input
                  type="url"
                  value={config.webhook}
                  onChange={(e) => setConfig({ ...config, webhook: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Channel
                </label>
                <input
                  type="text"
                  value={config.channel}
                  onChange={(e) => setConfig({ ...config, channel: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="#general"
                  required
                />
              </div>
            </>
          )}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Connect
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function InviteMemberModal({ onClose, onInvite }) {
  const [formData, setFormData] = useState({
    email: '',
    role: 'support',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onInvite(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <h3 className="text-xl font-semibold mb-4">Invite Team Member</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="admin">Admin</option>
              <option value="pm">Product Manager</option>
              <option value="dev">Developer</option>
              <option value="support">Support Agent</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Send Invitation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Settings;