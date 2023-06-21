const getTimeFunc = jest.fn(() => new Date().getTime);

export const mockCogniteAssetList = [
  {
    id: 1,
    name: 'Asset 1',
    createdTime: { getTime: getTimeFunc },
  },
  {
    id: 2,
    name: 'Asset 2',
    createdTime: { getTime: getTimeFunc },
  },
];
