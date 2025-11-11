// Mock Data Store
const mockDatabase = {
  feedback: [
    {
      id: 1,
      source: 'email',
      content: 'The login button is not working properly on mobile devices. When I try to tap it, nothing happens and I cannot access my account.',
      user_email: 'sarah.chen@example.com',
      sentiment: 'negative',
      created_at: '2024-01-20T10:30:00Z',
      tags: ['bug', 'mobile', 'urgent', 'login'],
      priority: 'high',
      created_by: null,
      metadata: {
        browser: 'Safari Mobile',
        os: 'iOS 17.2',
        url: 'https://app.trace.com/login',
        additional_context: 'iPhone 14 Pro'
      }
    },
    {
      id: 2,
      source: 'slack',
      content: 'Love the new dashboard design! The charts are much cleaner and easier to understand. Great work team!',
      user_email: 'mike.johnson@example.com',
      sentiment: 'positive',
      created_at: '2024-01-20T11:15:00Z',
      tags: ['ui', 'feedback', 'dashboard'],
      priority: 'low',
      created_by: null,
      metadata: {}
    },
    {
      id: 3,
      source: 'github',
      content: 'Export feature throws 500 error when trying to export more than 1000 records. Stack trace attached in the issue.',
      user_email: 'dev.wilson@example.com',
      sentiment: 'negative',
      created_at: '2024-01-20T09:45:00Z',
      tags: ['bug', 'export', 'backend'],
      priority: 'critical',
      created_by: null,
      metadata: {
        browser: 'Chrome 120',
        os: 'macOS 14.2'
      }
    },
    {
      id: 4,
      source: 'form',
      content: 'Would be great to have dark mode support. My eyes hurt after long sessions.',
      user_email: 'alex.kumar@example.com',
      sentiment: 'neutral',
      created_at: '2024-01-19T16:20:00Z',
      tags: ['feature-request', 'ui', 'accessibility'],
      priority: 'medium',
      created_by: null,
      metadata: {}
    },
    {
      id: 5,
      source: 'email',
      content: 'The notification system is fantastic! Really helps me stay on top of user issues.',
      user_email: 'jenny.adams@example.com',
      sentiment: 'positive',
      created_at: '2024-01-19T14:30:00Z',
      tags: ['feedback', 'notifications'],
      priority: 'low',
      created_by: null,
      metadata: {}
    },
    {
      id: 6,
      source: 'slack',
      content: 'Search function not returning results for partial matches. Have to type exact keywords.',
      user_email: 'tom.harris@example.com',
      sentiment: 'negative',
      created_at: '2024-01-19T13:00:00Z',
      tags: ['bug', 'search', 'ux'],
      priority: 'high',
      created_by: null,
      metadata: {}
    },
    {
      id: 7,
      source: 'email',
      content: 'Can we integrate with Jira? Our team uses it extensively for project management.',
      user_email: 'product.manager@techcorp.com',
      sentiment: 'neutral',
      created_at: '2024-01-18T10:00:00Z',
      tags: ['integration', 'feature-request', 'jira'],
      priority: 'medium',
      created_by: null,
      metadata: {}
    },
    {
      id: 8,
      source: 'github',
      content: 'Memory leak detected in the feedback processing service. CPU usage spikes to 100% after running for 24 hours.',
      user_email: 'backend.dev@example.com',
      sentiment: 'negative',
      created_at: '2024-01-18T08:30:00Z',
      tags: ['bug', 'performance', 'critical', 'backend'],
      priority: 'critical',
      created_by: null,
      metadata: {
        browser: 'N/A',
        os: 'Ubuntu 22.04',
        additional_context: 'Server logs attached'
      }
    }
  ],

  issues: [
    {
      id: 1,
      title: 'Mobile Login Bug',
      description: 'Multiple users reporting that the login button is unresponsive on mobile devices, particularly on iOS Safari.',
      status: 'in_progress',
      priority: 3,
      feedback_count: 12,
      created_at: '2024-01-15T09:00:00Z',
      updated_at: '2024-01-20T14:00:00Z',
      assigned_to: 'john.doe',
      assigned_to_details: {
        id: 2,
        username: 'john.doe',
        email: 'john@trace.com',
        first_name: 'John',
        last_name: 'Doe',
        role: 'dev'
      },
      linked_feedback: [
        {
          id: 1,
          source: 'email',
          content: 'The login button is not working properly on mobile devices.',
          user_email: 'sarah.chen@example.com',
          sentiment: 'negative',
          created_at: '2024-01-20T10:30:00Z'
        }
      ]
    },
    {
      id: 2,
      title: 'Export Feature Error',
      description: 'System throws 500 error when exporting large datasets (>1000 records). This is affecting enterprise customers.',
      status: 'open',
      priority: 3,
      feedback_count: 8,
      created_at: '2024-01-18T11:00:00Z',
      updated_at: '2024-01-20T09:45:00Z',
      assigned_to: 'jane.smith',
      assigned_to_details: {
        id: 3,
        username: 'jane.smith',
        email: 'jane@trace.com',
        first_name: 'Jane',
        last_name: 'Smith',
        role: 'dev'
      },
      linked_feedback: [
        {
          id: 3,
          source: 'github',
          content: 'Export feature throws 500 error when trying to export more than 1000 records.',
          user_email: 'dev.wilson@example.com',
          sentiment: 'negative',
          created_at: '2024-01-20T09:45:00Z'
        }
      ]
    },
    {
      id: 3,
      title: 'Dashboard Performance Optimization',
      description: 'Dashboard loading slowly for users with large amounts of data. Need to implement pagination and caching.',
      status: 'open',
      priority: 2,
      feedback_count: 5,
      created_at: '2024-01-17T14:00:00Z',
      updated_at: '2024-01-19T10:00:00Z',
      assigned_to: null,
      assigned_to_details: null,
      linked_feedback: []
    },
    {
      id: 4,
      title: 'Dark Mode Implementation',
      description: 'Multiple requests for dark mode support. This would improve accessibility and user comfort.',
      status: 'open',
      priority: 1,
      feedback_count: 23,
      created_at: '2024-01-16T10:00:00Z',
      updated_at: '2024-01-19T16:20:00Z',
      assigned_to: 'ui.designer',
      assigned_to_details: {
        id: 4,
        username: 'ui.designer',
        email: 'design@trace.com',
        first_name: 'Alice',
        last_name: 'Designer',
        role: 'pm'
      },
      linked_feedback: [
        {
          id: 4,
          source: 'form',
          content: 'Would be great to have dark mode support.',
          user_email: 'alex.kumar@example.com',
          sentiment: 'neutral',
          created_at: '2024-01-19T16:20:00Z'
        }
      ]
    },
    {
      id: 5,
      title: 'Search Functionality Enhancement',
      description: 'Search should support partial matches and fuzzy search to improve user experience.',
      status: 'resolved',
      priority: 2,
      feedback_count: 15,
      created_at: '2024-01-10T09:00:00Z',
      updated_at: '2024-01-18T15:00:00Z',
      assigned_to: 'john.doe',
      assigned_to_details: {
        id: 2,
        username: 'john.doe',
        email: 'john@trace.com',
        first_name: 'John',
        last_name: 'Doe',
        role: 'dev'
      },
      linked_feedback: []
    },
    {
      id: 6,
      title: 'Memory Leak in Feedback Service',
      description: 'Critical performance issue causing server crashes after extended runtime.',
      status: 'in_progress',
      priority: 3,
      feedback_count: 3,
      created_at: '2024-01-18T08:30:00Z',
      updated_at: '2024-01-20T12:00:00Z',
      assigned_to: 'backend.lead',
      assigned_to_details: {
        id: 5,
        username: 'backend.lead',
        email: 'backend@trace.com',
        first_name: 'Bob',
        last_name: 'Backend',
        role: 'dev'
      },
      linked_feedback: [
        {
          id: 8,
          source: 'github',
          content: 'Memory leak detected in the feedback processing service.',
          user_email: 'backend.dev@example.com',
          sentiment: 'negative',
          created_at: '2024-01-18T08:30:00Z'
        }
      ]
    }
  ],

  notifications: [
    {
      id: 1,
      recipient_email: 'sarah.chen@example.com',
      subject: 'Your issue has been resolved',
      message: 'Good news! The mobile login issue you reported has been fixed. Please update your app to the latest version.',
      status: 'sent',
      channel: 'email',
      sent_at: '2024-01-20T15:00:00Z',
      issue: { id: 1, title: 'Mobile Login Bug' }
    },
    {
      id: 2,
      recipient_email: 'mike.johnson@example.com',
      subject: 'Thank you for your feedback',
      message: 'We appreciate your positive feedback about the dashboard. Your input helps us improve!',
      status: 'sent',
      channel: 'slack',
      sent_at: '2024-01-20T11:30:00Z',
      issue: null
    },
    {
      id: 3,
      recipient_email: 'dev.wilson@example.com',
      subject: 'Update on export issue',
      message: 'We are actively working on the export issue you reported. We will notify you once it is resolved.',
      status: 'pending',
      channel: 'email',
      sent_at: '2024-01-20T10:00:00Z',
      issue: { id: 2, title: 'Export Feature Error' }
    },
    {
      id: 4,
      recipient_email: 'alex.kumar@example.com',
      subject: 'Re: Dark mode request',
      message: 'Dark mode is on our roadmap! We expect to release it in Q2 2024.',
      status: 'failed',
      channel: 'email',
      sent_at: '2024-01-19T17:00:00Z',
      error: 'Invalid email address',
      issue: { id: 4, title: 'Dark Mode Implementation' }
    },
    {
      id: 5,
      recipient_email: 'jenny.adams@example.com',
      subject: 'Welcome to Trace!',
      message: 'Thank you for signing up for Trace. We are excited to have you on board!',
      status: 'sent',
      channel: 'email',
      sent_at: '2024-01-19T14:35:00Z',
      issue: null
    }
  ],

  users: {
    profile: {
      id: 1,
      username: 'admin',
      email: 'admin@trace.com',
      first_name: 'Admin',
      last_name: 'User',
      role: 'admin',
      bio: 'System administrator and product manager at Trace.',
      timezone: 'America/Los_Angeles',
      created_at: '2024-01-01T00:00:00Z'
    }
  },

  stats: {
    issues: {
      totalFeedback: 124,
      openIssues: 18,
      resolvedIssues: 45,
      avgResolutionTime: 3.2,
      activeUsers: 89,
      criticalIssues: 3
    },
    notifications: {
      total: 156,
      sent: 120,
      pending: 20,
      failed: 16,
      openRate: 68
    }
  }
};

// Helper function to simulate delay
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to generate ID
const generateId = () => Date.now() + Math.floor(Math.random() * 1000);

// Mock API implementation
const mockApi = {
  defaults: {
    headers: {
      common: {}
    }
  },

  // GET requests
// GET requests
get: async (url, config = {}) => {
  await delay();
  
  console.log('Mock API GET:', url, config);
  
  // Parse URL and params
  const params = config.params || {};
  
  // Clean URL - remove leading/trailing slashes and /api prefix
  let cleanUrl = url.replace(/^\/+|\/+$/g, '');
  cleanUrl = cleanUrl.replace(/^api\//, '');
  
  // ==================== FEEDBACK ENDPOINTS ====================
  
  // Get all feedback
  if (cleanUrl === 'feedback') {
    let feedback = [...mockDatabase.feedback];
    
    if (params.source) {
      feedback = feedback.filter(f => f.source === params.source);
    }
    if (params.unlinked === 'true') {
      feedback = feedback.filter(f => !f.linked_issue_id);
    }
    
    console.log('Mock API: Returning feedback list', feedback.length);
    return { data: feedback };
  }
  
  // Get single feedback - FIXED
  if (cleanUrl.startsWith('feedback/')) {
    const parts = cleanUrl.split('/');
    const id = parseInt(parts[1]);
    
    if (!isNaN(id)) {
      const feedback = mockDatabase.feedback.find(f => f.id === id);
      console.log('Mock API: Looking for feedback', id, 'Found:', feedback);
      return { data: feedback || null };
    }
  }
  
  // ==================== ISSUES ENDPOINTS ====================
  
  // Get issue stats - check this BEFORE single issue
  if (cleanUrl.includes('issues/stats')) {
    console.log('Mock API: Returning issue stats');
    return { data: mockDatabase.stats.issues };
  }
  
  // Get all issues
  if (cleanUrl === 'issues') {
    let issues = [...mockDatabase.issues];
    
    if (params.status) {
      issues = issues.filter(i => i.status === params.status);
    }
    
    console.log('Mock API: Returning issues list', issues.length);
    return { data: issues };
  }
  
  // Get single issue - FIXED
  if (cleanUrl.startsWith('issues/')) {
    const parts = cleanUrl.split('/');
    const id = parseInt(parts[1]);
    
    if (!isNaN(id)) {
      const issue = mockDatabase.issues.find(i => i.id === id);
      console.log('Mock API: Looking for issue', id, 'Found:', issue);
      return { data: issue || null };
    }
  }
  
  // ==================== NOTIFICATIONS ENDPOINTS ====================
  
  // Get notification stats - check BEFORE single notification
  if (cleanUrl.includes('notifications/stats')) {
    console.log('Mock API: Returning notification stats');
    return { data: mockDatabase.stats.notifications };
  }
  
  // Get all notifications
  if (cleanUrl === 'notifications') {
    let notifications = [...mockDatabase.notifications];
    
    if (params.status) {
      notifications = notifications.filter(n => n.status === params.status);
    }
    
    console.log('Mock API: Returning notifications list', notifications.length);
    return { data: notifications };
  }
  
  // Get single notification
  if (cleanUrl.startsWith('notifications/')) {
    const parts = cleanUrl.split('/');
    const id = parseInt(parts[1]);
    
    if (!isNaN(id)) {
      const notification = mockDatabase.notifications.find(n => n.id === id);
      console.log('Mock API: Looking for notification', id, 'Found:', notification);
      return { data: notification || null };
    }
  }
  
  // ==================== USER ENDPOINTS ====================
  
  // Get user profile
  if (cleanUrl === 'users/profile' || cleanUrl.includes('users/profile')) {
    console.log('Mock API: Returning user profile');
    return { data: mockDatabase.users.profile };
  }
  
  // Get notification preferences
  if (cleanUrl.includes('notification-preferences')) {
    console.log('Mock API: Returning notification preferences');
    return { data: { success: true } };
  }
  
  // ==================== DEFAULT ====================
  
  console.warn('Mock API: No matching endpoint for', url, '(cleaned:', cleanUrl + ')');
  return { data: [] };
},

// POST requests
post: async (url, data = {}) => {
  await delay();
  
  console.log('Mock API POST:', url, data);
  
  // Clean URL
  let cleanUrl = url.replace(/^\/+|\/+$/g, '');
  cleanUrl = cleanUrl.replace(/^api\//, '');
  
  // ==================== AUTH ====================
  
  // Login
  if (cleanUrl === 'users/login') {
    return {
      data: {
        user: mockDatabase.users.profile,
        tokens: {
          access: 'mock-jwt-token-' + Date.now(),
          refresh: 'mock-refresh-token-' + Date.now()
        }
      }
    };
  }
  
  // ==================== FEEDBACK ====================
  
  // Create feedback
  if (cleanUrl === 'feedback') {
    const newFeedback = {
      id: generateId(),
      ...data,
      created_at: new Date().toISOString()
    };
    mockDatabase.feedback.unshift(newFeedback);
    console.log('Mock API: Created feedback', newFeedback.id);
    return { data: newFeedback };
  }
  
  // Link feedback to issue
  if (cleanUrl.includes('link_to_issue')) {
    const parts = cleanUrl.split('/');
    const feedbackId = parseInt(parts[1]);
    console.log('Mock API: Linking feedback', feedbackId, 'to issue', data.issue_id);
    return { data: { status: 'linked' } };
  }
  
  // ==================== ISSUES ====================
  
  // Create issue
  if (cleanUrl === 'issues') {
    const newIssue = {
      id: generateId(),
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      feedback_count: 0,
      linked_feedback: []
    };
    mockDatabase.issues.unshift(newIssue);
    console.log('Mock API: Created issue', newIssue.id);
    return { data: newIssue };
  }
  
  // Resolve issue - FIXED
  if (cleanUrl.includes('resolve')) {
    const parts = cleanUrl.split('/');
    const id = parseInt(parts[1]);
    const issue = mockDatabase.issues.find(i => i.id === id);
    
    if (issue) {
      issue.status = 'resolved';
      issue.updated_at = new Date().toISOString();
      console.log('Mock API: Resolved issue', id);
    }
    return { data: { status: 'resolved' } };
  }
  
  // Link feedback to issue - FIXED
  if (cleanUrl.includes('link_feedback')) {
    const parts = cleanUrl.split('/');
    const issueId = parseInt(parts[1]);
    console.log('Mock API: Linking feedback to issue', issueId, data.feedback_ids);
    return { data: { status: 'linked', total_feedback: data.feedback_ids?.length || 0 } };
  }
  
  // ==================== NOTIFICATIONS ====================
  
  // Send notification
  if (cleanUrl.includes('notifications/send') || cleanUrl === 'notifications') {
    const newNotification = {
      id: generateId(),
      ...data,
      status: 'sent',
      sent_at: new Date().toISOString()
    };
    mockDatabase.notifications.unshift(newNotification);
    console.log('Mock API: Created notification', newNotification.id);
    return { data: newNotification };
  }
  
  // Resend notification
  if (cleanUrl.includes('resend') || cleanUrl.includes('bulk_resend')) {
    console.log('Mock API: Resending notification(s)');
    return { data: { status: 'resent' } };
  }
  
  // Send to affected users
  if (cleanUrl.includes('send_to_affected')) {
    console.log('Mock API: Sending to affected users for issue', data.issue_id);
    return { data: { status: 'sent', count: 5 } };
  }
  
  // ==================== DEFAULT ====================
  
  console.log('Mock API: Generic POST success');
  return { data: { success: true, ...data } };
},

// PUT requests
put: async (url, data = {}) => {
  await delay();
  
  console.log('Mock API PUT:', url, data);
  
  // Clean URL
  let cleanUrl = url.replace(/^\/+|\/+$/g, '');
  cleanUrl = cleanUrl.replace(/^api\//, '');
  
  // Update feedback
  if (cleanUrl.startsWith('feedback/')) {
    const parts = cleanUrl.split('/');
    const id = parseInt(parts[1]);
    const index = mockDatabase.feedback.findIndex(f => f.id === id);
    
    if (index !== -1) {
      mockDatabase.feedback[index] = { ...mockDatabase.feedback[index], ...data };
      console.log('Mock API: Updated feedback', id);
      return { data: mockDatabase.feedback[index] };
    }
  }
  
  // Update issue
  if (cleanUrl.startsWith('issues/')) {
    const parts = cleanUrl.split('/');
    const id = parseInt(parts[1]);
    const index = mockDatabase.issues.findIndex(i => i.id === id);
    
    if (index !== -1) {
      mockDatabase.issues[index] = { 
        ...mockDatabase.issues[index], 
        ...data,
        updated_at: new Date().toISOString()
      };
      console.log('Mock API: Updated issue', id);
      return { data: mockDatabase.issues[index] };
    }
  }
  
  // Update profile
  if (cleanUrl.includes('users/profile')) {
    mockDatabase.users.profile = { ...mockDatabase.users.profile, ...data };
    console.log('Mock API: Updated user profile');
    return { data: mockDatabase.users.profile };
  }
  
  // Update notification preferences
  if (cleanUrl.includes('notification-preferences')) {
    console.log('Mock API: Updated notification preferences');
    return { data: { success: true, preferences: data } };
  }
  
  // Default update response
  return { data: { ...data, updated: true } };
},

// DELETE requests
delete: async (url) => {
  await delay();
  
  console.log('Mock API DELETE:', url);
  
  // Clean URL
  let cleanUrl = url.replace(/^\/+|\/+$/g, '');
  cleanUrl = cleanUrl.replace(/^api\//, '');
  
  // Delete feedback
  if (cleanUrl.startsWith('feedback/')) {
    const parts = cleanUrl.split('/');
    const id = parseInt(parts[1]);
    const index = mockDatabase.feedback.findIndex(f => f.id === id);
    
    if (index !== -1) {
      mockDatabase.feedback.splice(index, 1);
      console.log('Mock API: Deleted feedback', id);
    }
  }
  
  // Delete issue
  if (cleanUrl.startsWith('issues/')) {
    const parts = cleanUrl.split('/');
    const id = parseInt(parts[1]);
    const index = mockDatabase.issues.findIndex(i => i.id === id);
    
    if (index !== -1) {
      mockDatabase.issues.splice(index, 1);
      console.log('Mock API: Deleted issue', id);
    }
  }
  
  // Delete notification
  if (cleanUrl.startsWith('notifications/')) {
    const parts = cleanUrl.split('/');
    const id = parseInt(parts[1]);
    const index = mockDatabase.notifications.findIndex(n => n.id === id);
    
    if (index !== -1) {
      mockDatabase.notifications.splice(index, 1);
      console.log('Mock API: Deleted notification', id);
    }
  }
  
  return { data: { success: true } };
},

  // Interceptors (for compatibility)
  interceptors: {
    request: {
      use: () => {}
    },
    response: {
      use: () => {}
    }
  }
};

// Create method for axios compatibility
mockApi.create = () => mockApi;

export default mockApi;