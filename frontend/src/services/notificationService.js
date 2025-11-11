import api from '../api/mockData'; // or axiosInstance for real API

export const notificationService = {
  getAll: async (params = {}) => {
    const response = await api.get('/notifications/', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/notifications/${id}/`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/notifications/send/', data);
    return response.data;
  },

  resend: async (id) => {
    const response = await api.post(`/notifications/${id}/resend/`);
    return response.data;
  },

  bulkResend: async (ids) => {
    const response = await api.post('/notifications/bulk_resend/', {
      notification_ids: ids
    });
    return response.data;
  },

  sendToAffected: async (issueId, messageData) => {
    const response = await api.post('/notifications/send_to_affected/', {
      issue_id: issueId,
      ...messageData
    });
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/notifications/${id}/`);
  },

  getStats: async () => {
    const response = await api.get('/notifications/stats/');
    return response.data;
  }
};