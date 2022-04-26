import { Sequence } from '@cognite/sdk';

import { sequence } from '__test-utils/fixtures/log';

import {
  convertToPreviewData,
  doesCasingHaveReportDescription,
  filterValidCasings,
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

  it(`should return true when name includes liner`, async () => {
    expect(convertToPreviewData(casingViewProps.casing)[0].liner).toEqual(true);
  });

  it(`should sort casings on basis of outerDiameter`, async () => {
    casingViewProps.casing[1].name = 'SURFACE CASING';
    expect(convertToPreviewData(casingViewProps.casing)[0].name).toEqual(
      'SURFACE CASING'
    );
    expect(convertToPreviewData(casingViewProps.casing)[1].name).toEqual(
      'DRILLING LINER 2'
    );
  });

  it(`should return false when casing name  doesnot include liner`, async () => {
    casingViewProps.casing[1].name = 'SURFACE CASING';
    expect(convertToPreviewData(casingViewProps.casing)[0].liner).toEqual(
      false
    );
  });

  it(`should include casing in the description when  name not consists Casing`, async () => {
    casingViewProps.casing[1].name = 'DRILLING LINER 1';
    expect(
      convertToPreviewData(casingViewProps.casing)[0].casingDescription
    ).toEqual('18" DRILLING LINER 1 Casing at 11084ft depth');
  });

  it(`should not include casing in the description when  name not consist Casing`, async () => {
    casingViewProps.casing[1].name = 'SURFACE CASING';
    expect(
      convertToPreviewData(casingViewProps.casing)[0].casingDescription
    ).toEqual('18" SURFACE CASING  at 11084ft depth');
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

  it(`should return valid casings`, async () => {
    const mockSequence: Sequence = sequence;
    const validCasing = {
      metadata: {
        assy_name: 'Test Name',
        assy_original_md_top: '10',
        assy_original_md_base: '1000',
      },
    };
    const casings: Sequence[] = [
      { ...mockSequence, ...{ ...validCasing }, ...{ id: 1 } },
      { ...mockSequence, ...{ ...validCasing }, ...{ id: 2 } },

      {
        ...{ id: 3 },
        ...mockSequence,
        ...{
          metadata: {
            assy_name: 'Test Assy',
            assy_original_md_top: '1000',
            assy_original_md_base: '10',
          },
        },
      },
    ];

    expect(filterValidCasings(casings)).toEqual([
      { ...mockSequence, ...{ ...validCasing }, ...{ id: 1 } },
    ]);
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
