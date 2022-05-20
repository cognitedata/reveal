import '__mocks/mockContainerAuth';
import '__mocks/mockCogniteSDK';
import { renderHook } from '@testing-library/react-hooks';
import { setupServer } from 'msw/node';
import { nptCodeLegend } from 'services/well/__fixtures/nptCodeLegend';
import { nptDetailCodeLegend } from 'services/well/__fixtures/nptDetailCodeLegend';
import { getMockDetailCodeLegendGet } from 'services/well/__mocks/getMockDetailCodeLegendGet';
import { getMockWellLegendGet } from 'services/well/__mocks/getMockWellLegendGet';

import { testWrapper } from '__test-utils/renderer';

import { useDataLayer } from '../useDataLayer';

const nptCodeLegends = nptCodeLegend();
const nptDetailCodeLegends = nptDetailCodeLegend();

const mockServer = setupServer(
  getMockWellLegendGet(nptCodeLegends),
  getMockDetailCodeLegendGet(nptDetailCodeLegends)
);

describe('useDataLayer', () => {
  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());

  it('should return expected result', async () => {
    const { result, waitForNextUpdate } = renderHook(useDataLayer, {
      wrapper: testWrapper,
    });
    await waitForNextUpdate();
    expect(result.current.nptCodeDefinitions).toMatchObject({
      [nptCodeLegends[0].id]: nptCodeLegends[0].legend,
      [nptCodeLegends[1].id]: nptCodeLegends[1].legend,
    });
  });
});
