export default {
  useAuthContext: () => {
    return {
      authState: { id: 'test-id', project: 'test', email: 'test-email' },
    };
  },
  getAuthHeaders: () => ({}),
};
