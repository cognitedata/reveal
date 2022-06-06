import '__mocks/mockContainerAuth';
import '__mocks/mockCogniteSDK';
import { nptCodeLegend } from 'domain/wells/legend/service/__fixtures/nptCodeLegend';
import { nptDetailCodeLegend } from 'domain/wells/legend/service/__fixtures/nptDetailCodeLegend';
import { getMockDetailCodeLegendGet } from 'domain/wells/legend/service/__mocks/getMockDetailCodeLegendGet';
import { getMockWellLegendGet } from 'domain/wells/legend/service/__mocks/getMockWellLegendGet';

import { renderHook } from '@testing-library/react-hooks';
import { setupServer } from 'msw/node';

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
