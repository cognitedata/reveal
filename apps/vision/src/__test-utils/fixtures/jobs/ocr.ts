export const mockedOCRPostRes = {
  data: {
    createdTime: 1642676686666,
    items: [
      { fileId: 1 },
      { fileId: 2 },
      { fileId: 3 },
      { fileId: 4 },
      { fileId: 5 },
      { fileId: 6 },
      { fileId: 7 },
      { fileId: 8 },
      { fileId: 9 },
      { fileId: 10 },
      { fileId: 11 },
      { fileId: 12 },
    ],
    jobId: 123,
    status: 'Queued',
    statusTime: 1642676686666,
    useCache: true,
  },
  status: 200,
  headers: {},
};

export const mockedOCRGetRes = {
  data: {
    createdTime: 1643180519992,
    jobId: 123,
    startTime: 1643180521313,
    status: 'Queued',
    statusTime: 1643180528819,
    useCache: false,
  },
  status: 200,
  headers: {},
};
