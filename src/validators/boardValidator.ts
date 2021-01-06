export const boardValidator = {
  title: {
    required: { message: 'Please, enter board title' },
  },
  type: {
    required: { message: 'Please, select board type' },
  },
  url: {
    required: { message: 'Please, enter board URL' },
    pattern: {
      value:
        '^(https?|http):\\/\\/?[a-z0-9]+([\\-\\.]{1}[a-z0-9]+)*\\.[a-z]{2,5}(:[0-9]{1,5})?(\\/.*)?$',
      message: 'Invalid URL format',
    },
  },
};
