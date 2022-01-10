import { cleanup, within, screen } from '@testing-library/react';
import { shortDate } from 'utils/date';

import { getMockWell } from '__test-utils/fixtures/well';
import { testRenderer } from '__test-utils/renderer';
import { EMPTY_FIELD_PLACEHOLDER } from 'constants/general';

import { WellMetadata } from '../WellMetadata';

const SPUD_DATE = new Date();
const TEST_ID_PREFIX = 'metadata-label-';

describe('Well metadata', () => {
  const getWellMetadata = (props?: any) =>
    testRenderer(WellMetadata, undefined, props);

  afterEach(cleanup);

  it('should render metadata with details of well', async () => {
    await getWellMetadata({
      well: getMockWell({
        sources: ['test-sources'],
        operator: 'test-operator',
        spudDate: SPUD_DATE,
      }),
    });

    expect(screen.getByText('test-sources')).toBeInTheDocument();
    expect(screen.getByText('test-operator')).toBeInTheDocument();
    expect(screen.getByText(shortDate(SPUD_DATE))).toBeInTheDocument();
  });

  it("should render placeholders when well isn't provided", async () => {
    await getWellMetadata({});

    const depthEl = await screen.findByTestId(
      `${TEST_ID_PREFIX}Water Depth (ft)`
    );
    expect(
      within(depthEl).getByText(EMPTY_FIELD_PLACEHOLDER)
    ).toBeInTheDocument();

    const sourceEl = await screen.findByTestId(`${TEST_ID_PREFIX}Source`);
    expect(
      within(sourceEl).getByText(EMPTY_FIELD_PLACEHOLDER)
    ).toBeInTheDocument();

    const operatorEl = await screen.findByTestId(`${TEST_ID_PREFIX}Operator`);
    expect(
      within(operatorEl).getByText(EMPTY_FIELD_PLACEHOLDER)
    ).toBeInTheDocument();
  });
});
