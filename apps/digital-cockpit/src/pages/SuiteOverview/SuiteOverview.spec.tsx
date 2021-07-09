import { sandbox, render } from 'utils/test';
import { getEmptySuite, getSuiteWithImages } from '__mocks/suites';
import { createMockCdfClient } from 'utils/test/client';
import { initialState as initialSuitesState } from 'store/suites/reducer';

import merge from 'lodash/merge';
import SuiteOverview from './SuiteOverview';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: 'suite-1' }),
}));
const testSuiteKey = 'suite-1';

const getEmptySuitesTable = () =>
  merge({}, initialSuitesState, {
    suites: [getEmptySuite(testSuiteKey)],
    loaded: true,
  });
const getMockSuiteTableImages = () =>
  merge({}, initialSuitesState, {
    suites: [getSuiteWithImages(testSuiteKey)],
    loaded: true,
  });

describe('SuiteOverview', () => {
  beforeAll(() => {
    window.fetch = sandbox.stub();
  });
  const mockClient = createMockCdfClient();

  it('should render', () => {
    const suitesTable = getEmptySuitesTable();
    const view = render(<SuiteOverview />, {
      state: { suitesTable },
    });
    expect(view).toBeTruthy();
  });

  it('should fetch image preview urls', () => {
    const fetchImgUrlsStub = sandbox
      .stub(mockClient, 'getDownloadUrls')
      .resolves([
        { externalId: 'test-1', downloadUrl: 'test-1' },
        { externalId: 'test-2', downloadUrl: 'test-2' },
      ]);
    const suitesTable = getMockSuiteTableImages();
    render(<SuiteOverview />, {
      state: { suitesTable },
      cdfClient: mockClient,
    });
    expect(fetchImgUrlsStub.callCount).toBe(1);
  });
});
