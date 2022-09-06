import { EventFilterRequest } from '@cognite/sdk';

import { ReportFilter } from '../../internal/types';

export const adaptReportFilterToEventFilter = (
  filters: ReportFilter
): EventFilterRequest => {
  const advancedFilters = [];
  if (filters.status) {
    advancedFilters.push({
      in: {
        property: ['metadata', 'status'],
        values: filters.status,
      },
    });
  }
  if (filters.externalIds) {
    advancedFilters.push({
      in: {
        property: ['type'],
        values: filters.externalIds,
      },
    });
  }
  if (filters.ownerUserId) {
    advancedFilters.push({
      in: {
        property: ['metadata', 'ownerUserId'],
        values: filters.ownerUserId,
      },
    });
  }
  if (filters.reason) {
    advancedFilters.push({
      in: {
        property: ['metadata', 'reason'],
        values: filters.reason,
      },
    });
  }
  if (filters.reportType) {
    advancedFilters.push({
      in: {
        property: ['subtype'],
        values: filters.reportType,
      },
    });
  }
  if (advancedFilters?.length) {
    return {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore not updated in API
      advancedFilter: { and: advancedFilters },
    };
  }
  return {};
};
