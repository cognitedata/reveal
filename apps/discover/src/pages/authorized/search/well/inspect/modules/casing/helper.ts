import get from 'lodash/get';

import { Sequence } from '@cognite/sdk';

import { CasingData, FormattedCasings } from './interfaces';
/**
 * This returns string depth in proper number format
 */
const getDepth = (depth: string | undefined) =>
  depth && Number(depth) > 0 ? Number(depth) : 0;

/**
 *
 * This returns casing data in a pattern required by CasingView component
 */
export const getFortmattedCasingData = (casingData: CasingData[]) => {
  const formattedCasings: FormattedCasings[] = [];

  casingData.forEach((row: CasingData) => {
    const validCasings = row.casings;
    if (validCasings.length === 0) {
      return;
    }
    formattedCasings.push({
      key: row.id,
      name: get(validCasings[0], 'metadata.wellboreName', row.wellboreName),
      casings: validCasings.map((casing: Sequence) => {
        const unitColumn = casing.columns.filter(
          (column) => column.name === 'comp_md_base'
        );
        return {
          id: casing.id,
          name: casing.metadata ? casing.metadata.assy_name : '',
          outerDiameter: casing.metadata ? casing.metadata.assy_size : '',
          startDepth: getDepth(
            casing.metadata ? casing.metadata.assy_original_md_top : '0'
          ),
          endDepth: getDepth(
            casing.metadata ? casing.metadata.assy_original_md_base : '0'
          ),
          depthUnit:
            unitColumn.length > 0 && unitColumn[0].metadata
              ? unitColumn[0].metadata.unit
              : '',
        };
      }),
    });
  });
  return formattedCasings;
};
