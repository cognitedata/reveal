import get from 'lodash/get';
import sortBy from 'lodash/sortBy';
import uniqBy from 'lodash/uniqBy';
import { getPercent } from 'utils/getPercent';

import { Sequence } from '@cognite/sdk';

import { CasingType } from 'pages/authorized/search/well/inspect/modules/casing/CasingView/interfaces';

import { PreviewCasingType } from '../types';

/**
 * This holds lengthiest casing description
 */
let maxDescription = '';

/**
 *
 * This returns casings with valid depths
 */
export const filterValidCasings = (casings: Sequence[]): Sequence[] => {
  // get unique casings by name
  const uniqueByAssyName = uniqBy(casings, 'metadata.assy_name');
  const filteredCasingsByDepth = uniqueByAssyName.filter(
    (casing) =>
      casing.metadata &&
      Number(casing.metadata.assy_original_md_top) >= 0 &&
      Number(casing.metadata.assy_original_md_base) >= 0 &&
      Number(casing.metadata.assy_original_md_top) <
        Number(casing.metadata.assy_original_md_base)
  );

  // Remove casings not having 'TIANDI' in assy_name from duplicated casings
  let dupIdsBySize = getDupIdsBySize(filteredCasingsByDepth);
  const filteredCasingsByAssyName = filteredCasingsByDepth.filter(
    (casing) =>
      !dupIdsBySize.includes(casing.id) ||
      (casing.metadata && casing.metadata.assy_name.includes('TIANDI'))
  );

  // Remove casings having 'LINER' in assy_report_desc from duplicated casings
  dupIdsBySize = getDupIdsBySize(filteredCasingsByAssyName);
  const filteredCasingsByAssyReportDesc = filteredCasingsByAssyName.filter(
    (casing) =>
      !(
        dupIdsBySize.includes(casing.id) &&
        casing.metadata &&
        doesCasingHaveReportDescription(casing)
      )
  );

  return filteredCasingsByAssyReportDesc;
};

/**
 *
 * This returns duplicated casing ids by assy_size
 */
export const getDupIdsBySize = (casings: Sequence[]) => {
  return casings
    .filter((casingA) => {
      const dupsCount = casings.filter((casingB) => {
        return (
          casingA.metadata &&
          casingA.metadata.assy_size &&
          casingB.metadata &&
          casingB.metadata.assy_size &&
          casingA.metadata.assy_size === casingB.metadata.assy_size &&
          casingA.id !== casingB.id
        );
      }).length;
      return dupsCount > 0;
    })
    .map((casing) => casing.id);
};

const sortCasingsByDiameter = (casings: CasingType[]) => {
  return sortBy(casings, (casing) => Number(casing.outerDiameter));
};

export const convertToPreviewData = (
  casings: CasingType[]
): PreviewCasingType[] => {
  // Need to show casings in increasing order of diameter
  const sortedCasings = sortCasingsByDiameter(casings);

  // This finds the maximum depth of casings
  const maxDepth = Math.max(
    ...sortedCasings.map(({ endDepth }) => endDepth),
    0
  );

  // If the casings length is empty, then this will return empty
  if (maxDepth === 0) {
    return [];
  }

  return sortedCasings.map((casing) => {
    const endDepth = Math.ceil(casing.endDepth);
    const casingDisplayName = casing.name || '';

    const getCasingName = (casing: CasingType) => {
      if (casing.name) {
        return casing.name.toLowerCase().includes('casing') ? '' : 'Casing';
      }
      return '';
    };

    const description = `${
      casing.outerDiameter
    }" ${casingDisplayName} ${getCasingName(casing)} at ${endDepth}${
      casing.depthUnit
    } depth`;

    if (description.length > maxDescription.length) {
      maxDescription = `${description}`;
    }

    return {
      ...casing,
      casingStartDepth: getPercent(casing.startDepth, maxDepth),
      casingDepth: getPercent(casing.endDepth - casing.startDepth, maxDepth),
      casingDescription: description,
      liner: casing.name ? casing.name.toLowerCase().includes('liner') : false,
      maximumDescription: maxDescription,
    };
  });
};

/**
 * This converts given casing array in to a sorted array by casing base depth
 */
export const orderedCasingsByBase = (casings: Sequence[]) => {
  return sortBy(casings, (row) =>
    Number(get(row, 'metadata.assy_original_md_base'))
  );
};

export const doesCasingHaveReportDescription = (casing: any) => {
  return get(casing, 'metadata.assy_report_desc', '').includes('LINER');
};
