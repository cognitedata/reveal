import { Sequence } from '@cognite/sdk';

import { sequence } from '__test-utils/fixtures/log';

import {
  doesCasingHaveReportDescription,
  getDupIdsBySize,
  orderedCasingsByBase,
} from '../casings';

describe('normalize casings', () => {
  /**
   * This should be properly typed and fixed.
   * Better to do when completely migrating to use well sdk v3.
   */
  const casingViewProps = {
    name: 'Casing view 1',
    casing: [
      {
        id: 3478522947223720,
        name: 'DRILLING LINER 2',
        outerDiameter: '20.0',
        startDepth: 8660.797497795,
        endDepth: 11084.12749779,
        startDepthTVD: 8340.797497795,
        endDepthTVD: 10825.12749779,
        depthUnit: 'ft',
        metadata: { assy_report_desc: '' },
      },
      {
        id: 3478522947223719,
        name: 'DRILLING LINER 1',
        outerDiameter: '18.0',
        startDepth: 8660.897497795,
        endDepth: 11083.12749779,
        depthUnit: 'ft',
        metadata: { assy_report_desc: '' },
      },
    ],
  };

  it('should return false when assy_report_desc isUnavailable.', () => {
    expect(doesCasingHaveReportDescription(casingViewProps.casing[0])).toEqual(
      false
    );
  });

  it('should return true when assy_report_desc isAvailable.', () => {
    casingViewProps.casing[0].metadata.assy_report_desc =
      '5 1/2 PRODUCTION LINER';

    expect(doesCasingHaveReportDescription(casingViewProps.casing[0])).toEqual(
      true
    );
  });

  it(`should return casings ordered by Base`, async () => {
    const mockSequence: Sequence = sequence;
    const casings = [
      {
        ...mockSequence,
        ...{
          metadata: { assy_original_md_base: '2' },
        },
      },
      {
        ...mockSequence,
        ...{
          metadata: { assy_original_md_base: '1' },
        },
      },
    ];
    expect(orderedCasingsByBase(casings)).toEqual(casings.reverse());
  });

  it(`should return duplicated casing ids by assy_size`, async () => {
    const mockSequence: Sequence = sequence;
    const casings: Sequence[] = [
      {
        ...mockSequence,
        ...{
          id: 1,
          metadata: {
            assy_size: '100',
          },
        },
      },
      {
        ...mockSequence,
        ...{
          id: 2,
          metadata: {
            assy_size: '100',
          },
        },
      },
      {
        ...mockSequence,
        ...{
          id: 3,
          metadata: {
            assy_size: '1000',
          },
        },
      },
    ];
    expect(getDupIdsBySize(casings)).toEqual([1, 2]);
  });
});
