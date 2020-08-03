export const list = jest.fn().mockReturnValue({ type: 'datasets/LIST' });

const reducer = (state = {}) => {
  return state;
};

export { reducer as default };
