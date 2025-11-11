import mockApi from './mockData';

// Test utilities
const log = (testName, result, expected = null) => {
  const passed = expected ? JSON.stringify(result) === JSON.stringify(expected) : result;
  console.log(
    `${passed ? '✅' : '❌'} ${testName}`,
    passed ? '' : '\n  Expected:', expected, '\n  Got:', result
  );
  return passed;
};

const logSection = (title) => {
  console.log(`\n${'='.repeat(50)}\n${title}\n${'='.repeat(50)}`);
};

// Run all tests
async function runTests() {
  console.clear();
  console.log('🧪 Starting Mock API Tests...\n');
  
  let passed = 0;
  let failed = 0;

  // ==================== FEEDBACK TESTS ====================
  logSection('📬 FEEDBACK ENDPOINT TESTS');

  try {
    // Test 1: Get all feedback
    const allFeedback = await mockApi.get('/feedback/');
    if (log('Get all feedback', allFeedback.data.length > 0)) passed++; else failed++;
    
    // Test 2: Get feedback with source filter
    const emailFeedback = await mockApi.get('/feedback/', { params: { source: 'email' } });
    const allEmail = emailFeedback.data.every(f => f.source === 'email');
    if (log('Filter feedback by source (email)', allEmail)) passed++; else failed++;
    
    // Test 3: Get single feedback
    const singleFeedback = await mockApi.get('/feedback/1/');
    if (log('Get single feedback (ID: 1)', singleFeedback.data?.id === 1)) passed++; else failed++;
    
    // Test 4: Create new feedback
    const newFeedback = await mockApi.post('/feedback/', {
      source: 'slack',
      content: 'Test feedback content',
      user_email: 'test@example.com',
      sentiment: 'positive'
    });
    if (log('Create new feedback', newFeedback.data?.content === 'Test feedback content')) passed++; else failed++;
    
    // Test 5: Update feedback
    const updatedFeedback = await mockApi.put('/feedback/1/', {
      content: 'Updated content'
    });
    if (log('Update feedback', updatedFeedback.data?.content === 'Updated content')) passed++; else failed++;
    
    // Test 6: Delete feedback
    await mockApi.delete('/feedback/999/');
    if (log('Delete feedback', true)) passed++; else failed++;
    
  } catch (error) {
    console.error('❌ Feedback tests failed:', error);
    failed += 6;
  }

  // ==================== ISSUES TESTS ====================
  logSection('🐛 ISSUES ENDPOINT TESTS');

  try {
    // Test 7: Get all issues
    const allIssues = await mockApi.get('/issues/');
    if (log('Get all issues', allIssues.data.length > 0)) passed++; else failed++;
    console.log('   Issues found:', allIssues.data.length);
    console.log('   Sample issue IDs:', allIssues.data.slice(0, 3).map(i => i.id));
    
    // Test 8: Get issues with status filter
    const openIssues = await mockApi.get('/issues/', { params: { status: 'open' } });
    const allOpen = openIssues.data.every(i => i.status === 'open');
    if (log('Filter issues by status (open)', allOpen)) passed++; else failed++;
    
    // Test 9: Get single issue
    const singleIssue = await mockApi.get('/issues/1/');
    console.log('   Single issue response:', singleIssue.data);
    if (log('Get single issue (ID: 1)', singleIssue.data?.id === 1)) passed++; else failed++;
    
    // Test 10: Verify issue has required fields
    if (singleIssue.data) {
      const hasRequiredFields = 
        singleIssue.data.title &&
        singleIssue.data.status &&
        singleIssue.data.priority !== undefined;
      if (log('Issue has required fields (title, status, priority)', hasRequiredFields)) passed++; else failed++;
    } else {
      console.log('❌ Issue has required fields - Issue data is null');
      failed++;
    }
    
    // Test 11: Get issue with ID 2
    const issue2 = await mockApi.get('/issues/2/');
    if (log('Get single issue (ID: 2)', issue2.data?.id === 2)) passed++; else failed++;
    
    // Test 12: Create new issue
    const newIssue = await mockApi.post('/issues/', {
      title: 'Test Issue',
      description: 'Test description',
      status: 'open',
      priority: 2
    });
    if (log('Create new issue', newIssue.data?.title === 'Test Issue')) passed++; else failed++;
    
    // Test 13: Update issue
    const updatedIssue = await mockApi.put('/issues/1/', {
      title: 'Updated Issue Title'
    });
    if (log('Update issue', updatedIssue.data?.title === 'Updated Issue Title')) passed++; else failed++;
    
    // Test 14: Resolve issue
    const resolvedIssue = await mockApi.post('/issues/1/resolve/');
    if (log('Resolve issue', resolvedIssue.data?.status === 'resolved')) passed++; else failed++;
    
    // Test 15: Get issue stats
    const issueStats = await mockApi.get('/issues/stats/');
    if (log('Get issue stats', issueStats.data?.openIssues !== undefined)) passed++; else failed++;
    
  } catch (error) {
    console.error('❌ Issues tests failed:', error);
    failed += 9;
  }

  // ==================== NOTIFICATIONS TESTS ====================
  logSection('📧 NOTIFICATIONS ENDPOINT TESTS');

  try {
    // Test 16: Get all notifications
    const allNotifications = await mockApi.get('/notifications/');
    if (log('Get all notifications', allNotifications.data.length > 0)) passed++; else failed++;
    
    // Test 17: Filter notifications by status
    const sentNotifications = await mockApi.get('/notifications/', { params: { status: 'sent' } });
    const allSent = sentNotifications.data.every(n => n.status === 'sent');
    if (log('Filter notifications by status (sent)', allSent)) passed++; else failed++;
    
    // Test 18: Create notification
    const newNotification = await mockApi.post('/notifications/send/', {
      recipient_email: 'test@example.com',
      subject: 'Test Subject',
      message: 'Test message'
    });
    if (log('Create notification', newNotification.data?.recipient_email === 'test@example.com')) passed++; else failed++;
    
    // Test 19: Get notification stats
    const notificationStats = await mockApi.get('/notifications/stats/');
    if (log('Get notification stats', notificationStats.data?.total !== undefined)) passed++; else failed++;
    
  } catch (error) {
    console.error('❌ Notifications tests failed:', error);
    failed += 4;
  }

  // ==================== USER TESTS ====================
  logSection('👤 USER ENDPOINT TESTS');

  try {
    // Test 20: Login
    const loginResponse = await mockApi.post('/users/login/', {
      email: 'test@example.com',
      password: 'password123'
    });
    if (log('User login', loginResponse.data?.tokens?.access !== undefined)) passed++; else failed++;
    
    // Test 21: Get user profile
    const profile = await mockApi.get('/users/profile/');
    if (log('Get user profile', profile.data?.email !== undefined)) passed++; else failed++;
    
    // Test 22: Update user profile
    const updatedProfile = await mockApi.put('/users/profile/', {
      first_name: 'Updated Name'
    });
    if (log('Update user profile', updatedProfile.data?.first_name === 'Updated Name')) passed++; else failed++;
    
  } catch (error) {
    console.error('❌ User tests failed:', error);
    failed += 3;
  }

  // ==================== EDGE CASES ====================
  logSection('🔍 EDGE CASE TESTS');

  try {
    // Test 23: Get non-existent issue
    const nonExistent = await mockApi.get('/issues/9999/');
    if (log('Get non-existent issue returns null', nonExistent.data === null || nonExistent.data === undefined)) passed++; else failed++;
    
    // Test 24: URL with trailing slash
    const issueWithSlash = await mockApi.get('/issues/1/');
    if (log('Handle URL with trailing slash', issueWithSlash.data?.id === 1)) passed++; else failed++;
    
    // Test 25: URL without trailing slash
    const issueWithoutSlash = await mockApi.get('/issues/1');
    if (log('Handle URL without trailing slash', issueWithoutSlash.data?.id === 1)) passed++; else failed++;
    
    // Test 26: Unknown endpoint
    const unknown = await mockApi.get('/unknown-endpoint/');
    if (log('Unknown endpoint returns empty array', Array.isArray(unknown.data) && unknown.data.length === 0)) passed++; else failed++;
    
  } catch (error) {
    console.error('❌ Edge case tests failed:', error);
    failed += 4;
  }

  // ==================== DATA INTEGRITY TESTS ====================
  logSection('📊 DATA INTEGRITY TESTS');

  try {
    // Test 27: All issues have required fields
    const allIssues = await mockApi.get('/issues/');
    const issuesValid = allIssues.data.every(issue => 
      issue.id &&
      issue.title &&
      issue.description !== undefined &&
      issue.status &&
      issue.priority !== undefined &&
      issue.created_at
    );
    if (log('All issues have required fields', issuesValid)) passed++; else failed++;
    
    // Test 28: All feedback have required fields
    const allFeedback = await mockApi.get('/feedback/');
    const feedbackValid = allFeedback.data.every(feedback =>
      feedback.id &&
      feedback.source &&
      feedback.content &&
      feedback.user_email &&
      feedback.created_at
    );
    if (log('All feedback have required fields', feedbackValid)) passed++; else failed++;
    
    // Test 29: Issue statuses are valid
    const issues = await mockApi.get('/issues/');
    const validStatuses = ['open', 'in_progress', 'resolved'];
    const statusesValid = issues.data.every(issue => 
      validStatuses.includes(issue.status)
    );
    if (log('All issue statuses are valid', statusesValid)) passed++; else failed++;
    
    // Test 30: Feedback sources are valid
    const feedback = await mockApi.get('/feedback/');
    const validSources = ['email', 'slack', 'github', 'form'];
    const sourcesValid = feedback.data.every(f => 
      validSources.includes(f.source)
    );
    if (log('All feedback sources are valid', sourcesValid)) passed++; else failed++;
    
  } catch (error) {
    console.error('❌ Data integrity tests failed:', error);
    failed += 4;
  }

  // ==================== RESULTS ====================
  logSection('📊 TEST RESULTS');
  
  const total = passed + failed;
  const percentage = ((passed / total) * 100).toFixed(1);
  
  console.log(`\nTotal Tests: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${percentage}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! Mock API is working correctly.\n');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the errors above.\n');
  }
  
  return { passed, failed, total, percentage };
}

// Export for use in browser console or Node
if (typeof window !== 'undefined') {
  window.testMockAPI = runTests;
  console.log('💡 Run tests in console with: testMockAPI()');
}

export default runTests;