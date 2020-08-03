export const status = jest.fn().mockReturnValue({ type: 'files/MOCK_STATUS' });

const reducer = (state = {}) => {
  return state;
};

export const searchAndCount = jest.fn();

export const searchSelector = jest.fn();

export const listSelector = jest.fn();

export const retrieveSelector = jest.fn();

export const countSelector = jest.fn();

export const itemSelector = jest.fn();

export { reducer as default };
