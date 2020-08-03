export const authenticate = jest
  .fn()
  .mockReturnValue({ type: 'login/MOCK_STATUS' });
export const status = jest.fn().mockReturnValue({ type: 'login/MOCK_STATUS' });
export const isCogniteUser = jest.fn().mockReturnValue(true);

const reducer = (state = {}) => {
  return state;
};

export { reducer as default };
