// eslint-disable-next-line @typescript-eslint/no-var-requires
const mockContainer = {
  getAuthHeaders: () => '',
};
jest.mock('@cognite/react-container', () => mockContainer);
