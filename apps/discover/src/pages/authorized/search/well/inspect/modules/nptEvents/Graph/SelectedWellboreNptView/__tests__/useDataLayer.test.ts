import '__mocks/mockContainerAuth';
import '__mocks/mockCogniteSDK';
import { nptCodeLegend } from 'domain/wells/legend/service/__fixtures/nptCodeLegend';
import { getMockWellLegendGet } from 'domain/wells/legend/service/__mocks/getMockWellLegendGet';

import { renderHook } from '@testing-library/react-hooks';
import { setupServer } from 'msw/node';

import { testWrapper } from '__test-utils/renderer';

import { useDataLayer } from '../useDataLayer';

const nptCodeLegends = nptCodeLegend();
const mockServer = setupServer(getMockWellLegendGet(nptCodeLegends));

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
