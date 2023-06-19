export default {
  // @ts-ingore
  post: jest.fn(),
  // @ts-ingore
  get: jest.fn(),
};

export const getFlow = () => ({ flow: 'COGNITE_AUTH' });

export const loginAndAuthIfNeeded = async () => {};
