import { getDataExplorerBackendEndpoint } from '../getDataExplorerBackendEndpoint';

describe('getDataExplorerBackendEndpoint', () => {
  it('should return correct url', () => {
    expect(
      getDataExplorerBackendEndpoint(
        'test',
        'https://api.cognitedata.com',
        false
      )
    ).toEqual('https://api.staging.cogniteapp.com/data-explorer-backend/test');
    expect(
      getDataExplorerBackendEndpoint(
        'test',
        'https://api.cognitedata.com',
        true
      )
    ).toEqual('https://api.cogniteapp.com/data-explorer-backend/test');

    expect(
      getDataExplorerBackendEndpoint(
        'test',
        'https://bluefield.cognitedata.com',
        false
      )
    ).toEqual(
      'https://api.staging.bluefield.cogniteapp.com/data-explorer-backend/test'
    );

    expect(
      getDataExplorerBackendEndpoint(
        'test',
        'https://bluefield.cognitedata.com',
        true
      )
    ).toEqual(
      'https://api.bluefield.cogniteapp.com/data-explorer-backend/test'
    );
  });
});
