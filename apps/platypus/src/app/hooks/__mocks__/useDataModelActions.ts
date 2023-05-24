export const useDataModel = jest.fn().mockImplementation(() => {
  return {
    data: {},
    isLoading: false,
    isError: false,
    isSuccess: true,
  };
});
export const useDataModels = jest.fn().mockImplementation(() => {
  return {
    data: [],
    isLoading: false,
    isError: false,
    isSuccess: true,
  };
});
export const useDataModelVersions = jest.fn().mockImplementation(() => {
  return {
    data: [],
    isLoading: false,
    isError: false,
    isSuccess: true,
  };
});
