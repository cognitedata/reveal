export const getSDK = () => ({
  assets: {
    retrieve: async () => ({ items: [] }),
    list: async () => ({ items: [] }),
  },
  events: {
    retrieve: async () => ({ items: [] }),
    list: async () => ({ items: [] }),
  },
  sequences: {
    retrieve: async () => ({ items: [] }),
    list: async () => ({ items: [] }),
  },
  files: {
    retrieve: async () => ({ items: [] }),
    getDownloadUrls: async () => [{ downloadUrl: '//unsplash.it/1200/600' }],
    list: async () => ({ items: [] }),
  },
  timeseries: {
    retrieve: async () => ({ items: [] }),
    list: async () => ({ items: [] }),
  },
});

export const setSDK = () => {};
