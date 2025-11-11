import api from '../api/mockData';

export const feedbackService = {
  getAll: async (params = {}) => {
    const response = await api.get('/feedback/', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/feedback/${id}/`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/feedback/', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/feedback/${id}/`, data);
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/feedback/${id}/`);
  },

  linkToIssue: async (feedbackId, issueId) => {
    const response = await api.post(`/feedback/${feedbackId}/link_to_issue/`, {
      issue_id: issueId
    });
    return response.data;
  },

  bulkLink: async (feedbackIds, issueId) => {
    const response = await api.post('/feedback/bulk_link/', {
      feedback_ids: feedbackIds,
      issue_id: issueId
    });
    return response.data;
  }
};