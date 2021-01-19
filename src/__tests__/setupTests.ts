jest.mock('@cognite/seismic-sdk-js', () => {
  class CogniteSeismicClient {}

  return { CogniteSeismicClient };
});