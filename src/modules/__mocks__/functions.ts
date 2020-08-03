export const status = jest
  .fn()
  .mockReturnValue({ type: 'functions/MOCK_STATUS' });

const reducer = (state = {}) => {
  return state;
};

export const GCSUploader = jest.fn().mockReturnValue({ start: jest.fn() });

export { reducer as default };
