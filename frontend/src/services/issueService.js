import api from '../api/mockData';

export const issueService = {
  getAll: async (params = {}) => {
    const response = await api.get('/issues/', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/issues/${id}/`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/issues/', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/issues/${id}/`, data);
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/issues/${id}/`);
  },

  resolve: async (id) => {
    const response = await api.post(`/issues/${id}/resolve/`);
    return response.data;
  },

  linkFeedback: async (issueId, feedbackIds) => {
    const response = await api.post(`/issues/${issueId}/link_feedback/`, {
      feedback_ids: feedbackIds
    });
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/issues/stats/');
    return response.data;
  }
};