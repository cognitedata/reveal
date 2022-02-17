import { UnitConverterItem } from 'utils/units';

import { CogniteEvent } from '@cognite/sdk';

import { EventsType } from 'modules/wellSearch/types';
import { convertObject } from 'modules/wellSearch/utils';

import { ndsAccessorsToFixedDecimal } from './constants';

export const getNdsUnitChangeAccessors = (
  toUnit?: string
): UnitConverterItem[] =>
  toUnit
    ? [
        {
          id: 'id',
          accessor: 'metadata.md_hole_start',
          fromAccessor: 'metadata.md_hole_start_unit',
          to: toUnit,
        },
        {
          id: 'id',
          accessor: 'metadata.md_hole_end',
          fromAccessor: 'metadata.md_hole_end_unit',
          to: toUnit,
        },
        {
          id: 'id',
          accessor: 'metadata.tvd_offset_hole_start',
          fromAccessor: 'metadata.tvd_offset_hole_start_unit',
          to: toUnit,
        },
        {
          id: 'id',
          accessor: 'metadata.tvd_offset_hole_end',
          fromAccessor: 'metadata.tvd_offset_hole_end_unit',
          to: toUnit,
        },
      ]
    : [];

export const useGetConvertFunctionForEvents = (unit?: string) => {
  return (eventType: EventsType, errorHandler?: (error: string) => void) => {
    switch (eventType) {
      case 'nds': {
        const ndsUnitChangeAcceessors = getNdsUnitChangeAccessors(unit);
        if (errorHandler) {
          if (ndsUnitChangeAcceessors.length)
            ndsUnitChangeAcceessors[0].errorHandler = errorHandler;
          if (ndsUnitChangeAcceessors.length > 1)
            ndsUnitChangeAcceessors[1].errorHandler = errorHandler;
        }
        return (event: CogniteEvent) =>
          convertObject(event)
            .changeUnits(ndsUnitChangeAcceessors)
            .toClosestInteger(ndsAccessorsToFixedDecimal)
            .get();
      }
      default:
        return (event: CogniteEvent) => event;
    }
  };
};
