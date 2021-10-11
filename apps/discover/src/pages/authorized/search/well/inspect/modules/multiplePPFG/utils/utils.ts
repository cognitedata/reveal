import flatten from 'lodash/flatten';
import get from 'lodash/get';
import uniq from 'lodash/uniq';
import uniqBy from 'lodash/uniqBy';

import { Sequence } from '@cognite/sdk';

import { Item } from 'components/filters/CheckBoxes/CheckBoxes';
import { SequenceData } from 'modules/wellSearch/types';

export type WellboreIdNameMap = { [key: number]: string };

export type FilterInputType = {
  dateType: string;
  data: string[] | Item[];
};

export type FilterInputMap = {
  [key: string]: string[] | Item[];
};

export type FilterResultMap = {
  [key: string]: string[];
};

export type SelectAllFilterOptionsMap = { [key: string]: boolean };

export const getIntersectCurves = (
  curves: string[] = [],
  defaultCurves: string[] = []
): string[] =>
  curves.filter((curve) =>
    defaultCurves.map((row) => row.toLowerCase()).includes(curve.toLowerCase())
  );

export const getWellboreIdNameMap = (sequences: Sequence[]) =>
  uniqBy(sequences, 'metadata.wellboreName').reduce(
    (prev, sequence) => ({
      ...prev,
      [sequence.assetId as number]: sequence.metadata?.wellboreName as string,
    }),
    {} as WellboreIdNameMap
  );

export const getCheckboxItemMap = (sequences: Sequence[]): Item[] =>
  uniqBy(sequences, 'metadata.wellboreName')
    .filter((sequence) => sequence.metadata !== undefined)
    .map((sequence) => ({
      text: sequence.metadata!.wellboreDescription,
      key: sequence.metadata!.wellboreName,
    }));

export const getUniqueTypes = (
  sequenceData: SequenceData[],
  selectedFilters: FilterInputMap
) =>
  uniq(
    sequenceData
      .filter((ppfgWithData) =>
        (get(selectedFilters, 'wellbores', []) as string[]).includes(
          get(ppfgWithData, 'sequence.metadata.wellboreName')
        )
      )
      .map((ppfgWithData) => ppfgWithData.sequence.description as string)
  );

export const getUniquePressureCurves = (sequenceData: SequenceData[]) =>
  uniq(
    flatten(
      sequenceData.map((ppfgWithData: SequenceData) =>
        ppfgWithData.sequence.columns
          .filter(
            (column) =>
              column.valueType === 'DOUBLE' && column.metadata?.unit !== 'ft'
          )
          .map((column) => column.name)
      )
    )
  ) as string[];

export const getFilteredPPFGsData = (
  sequenceData: SequenceData[],
  selectedFilters: FilterInputMap
) =>
  sequenceData.filter(
    (ppfgData) =>
      (get(selectedFilters, 'wellbores', []) as string[]).includes(
        get(ppfgData, 'sequence.metadata.wellboreName')
      ) &&
      (get(selectedFilters, 'ppfgTypes', []) as string[]).includes(
        get(ppfgData, 'sequence.description')
      ) &&
      (get(selectedFilters, 'uniqTypes', []) as string[]).includes(
        get(ppfgData, 'sequence.description')
      )
  );
