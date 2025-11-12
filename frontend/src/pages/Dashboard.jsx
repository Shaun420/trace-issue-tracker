import { useState, useEffect } from 'react';
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { format, subDays } from 'date-fns';
import { 
  FiTrendingUp, FiMessageSquare, FiCheckCircle, 
  FiClock, FiUsers, FiAlertCircle 
} from 'react-icons/fi';
import { feedbackService } from '../services/feedbackService';
import { issueService } from '../services/issueService';

function Dashboard() {
  const [stats, setStats] = useState({
    totalFeedback: 0,
    openIssues: 0,
    resolvedIssues: 0,
    avgResolutionTime: 0,
    activeUsers: 0,
    criticalIssues: 0,
  });
  const [feedbackTrend, setFeedbackTrend] = useState([]);
  const [issuesByStatus, setIssuesByStatus] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  const PieTooltip = ({ active, payload }) => {
	if (!active || !payload?.length) return null;
	const item = payload[0]; // { name, value, payload: { color } }

	return (
		<div className="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 shadow-lg">
		<div className="flex items-center gap-2">
			<span
			className="inline-block w-2.5 h-2.5 rounded-full"
			style={{ backgroundColor: item.payload?.color || '#8884d8' }}
			/>
			<span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
			{item.name}
			</span>
		</div>
		<div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
			{item.value}
		</div>
		</div>
	);
	};

  const fetchDashboardData = async () => {
    try {
      // Fetch stats
      const statsData = await issueService.getStats();
      setStats(statsData);

      // Generate mock trend data (replace with real API)
      const trend = Array.from({ length: 7 }, (_, i) => ({
        date: format(subDays(new Date(), 6 - i), 'MMM dd'),
        feedback: Math.floor(Math.random() * 50) + 10,
        issues: Math.floor(Math.random() * 20) + 5,
      }));
      setFeedbackTrend(trend);

      // Mock status distribution
      setIssuesByStatus([
        { name: 'Open', value: 35, color: '#ef4444' },
        { name: 'In Progress', value: 25, color: '#f59e0b' },
        { name: 'Resolved', value: 40, color: '#10b981' },
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { 
      icon: FiMessageSquare, 
      label: 'Total Feedback', 
      value: stats.totalFeedback, 
      change: '+12%',
      color: 'purple' 
    },
    { 
      icon: FiClock, 
      label: 'Open Issues', 
      value: stats.openIssues, 
      change: '-5%',
      color: 'yellow' 
    },
    { 
      icon: FiCheckCircle, 
      label: 'Resolved', 
      value: stats.resolvedIssues, 
      change: '+18%',
      color: 'green' 
    },
    { 
      icon: FiUsers, 
      label: 'Active Users', 
      value: stats.activeUsers, 
      change: '+8%',
      color: 'blue' 
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-16">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome back! Here's what's happening with your product.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 bg-${stat.color}-50 rounded-lg`}>
                <stat.icon className={`text-${stat.color}-600`} size={24} />
              </div>
              <span className={`text-sm font-semibold ${
                stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Weekly Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={feedbackTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="feedback" 
                stackId="1"
                stroke="#8b5cf6" 
                fill="#8b5cf6" 
                fillOpacity={0.6}
              />
              <Area 
                type="monotone" 
                dataKey="issues" 
                stackId="1"
                stroke="#ec4899" 
                fill="#ec4899" 
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

		{/* Pie Chart */}
		<div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
		<h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
			Issues by Status
		</h2>

		<ResponsiveContainer width="100%" height={300}>
			<PieChart>
			<Pie
				data={issuesByStatus}
				cx="50%"
				cy="50%"
				innerRadius={60}
				outerRadius={100}
				paddingAngle={5}
				dataKey="value"
			>
				{issuesByStatus.map((entry, index) => (
				<Cell key={`cell-${index}`} fill={entry.color} />
				))}
			</Pie>

			{/* Dark-mode aware tooltip */}
			<Tooltip content={<PieTooltip />} wrapperStyle={{ outline: 'none' }} />
			</PieChart>
		</ResponsiveContainer>

		<div className="flex justify-center flex-wrap gap-4 mt-4">
			{issuesByStatus.map((status) => (
			<div key={status.name} className="flex items-center gap-2">
				<div
				className="w-3 h-3 rounded-full"
				style={{ backgroundColor: status.color }}
				/>
				<span className="text-sm text-gray-700 dark:text-gray-300">
				{status.name}
				</span>
			</div>
			))}
		</div>
		</div>

      </div>

      {/* Activity Feed & Top Issues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityFeed />
        <TopIssues />
      </div>
    </div>
  );
}

function ActivityFeed() {
  const activities = [
    { type: 'feedback', message: 'New feedback from john@example.com', time: '5 min ago', icon: FiMessageSquare },
    { type: 'issue', message: 'Issue #23 marked as resolved', time: '15 min ago', icon: FiCheckCircle },
    { type: 'alert', message: 'Critical issue reported by 5 users', time: '1 hour ago', icon: FiAlertCircle },
    { type: 'user', message: '3 new users joined this week', time: '2 hours ago', icon: FiUsers },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent Activity</h2>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-start space-x-3">
            <div className={`p-2 rounded-lg ${
              activity.type === 'feedback' ? 'bg-purple-50 text-purple-600' :
              activity.type === 'issue' ? 'bg-green-50 text-green-600' :
              activity.type === 'alert' ? 'bg-red-50 text-red-600' :
              'bg-blue-50 text-blue-600'
            }`}>
              <activity.icon size={16} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-800 dark:text-gray-200">{activity.message}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TopIssues() {
  const issues = [
    { id: 1, title: 'Login page not responsive', users: 23, priority: 'high' },
    { id: 2, title: 'Dashboard loading slowly', users: 18, priority: 'medium' },
    { id: 3, title: 'Export feature broken', users: 15, priority: 'high' },
    { id: 4, title: 'Search not returning results', users: 12, priority: 'low' },
  ];

  const priorityStyles = {
    high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    low: 'bg-gray-100 text-gray-700 dark:bg-gray-900/40 dark:text-gray-300',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
        Top Issues by User Impact
      </h2>

      <div className="space-y-3">
        {issues.map((issue) => (
          <div
            key={issue.id}
            role="button"
            tabIndex={0}
            className="flex items-center justify-between p-3 rounded-lg cursor-pointer
                       hover:bg-gray-50 dark:hover:bg-gray-700
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/60
                       focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900
                       transition-colors"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                // handle activate
              }
            }}
            onClick={() => {
              // handle navigate/activate
            }}
          >
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {issue.title}
              </p>
              <div className="flex items-center space-x-3 mt-1">
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {issue.users} users affected
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${priorityStyles[issue.priority]}`}
                >
                  {issue.priority.charAt(0).toUpperCase() + issue.priority.slice(1)}
                </span>
              </div>
            </div>

            <FiTrendingUp className="text-gray-400 dark:text-gray-500" size={16} />
          </div>
        ))}
      </div>
    </div>
  );
}
export default Dashboard;