export default {
  project: 'mockProject',
  // @ts-ingore
  post: jest.fn(),
  // @ts-ingore
  get: jest.fn(),
};

export const getAuthState = () => ({
  username: 'someone@cognite.com',
});

export const loginAndAuthIfNeeded = async () => {};
