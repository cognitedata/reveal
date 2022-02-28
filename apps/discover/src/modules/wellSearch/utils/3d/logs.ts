import reduce from 'lodash/reduce';

import { ILog } from '@cognite/node-visualizer';

import { SequenceData } from 'modules/wellSearch/types';

export const mapLogsTo3D = (
  logs: Record<number, ILog[] | SequenceData[]>
): { [key: number]: ILog[] } => {
  return reduce(
    logs,
    (results, logs, key) => {
      return {
        ...results,
        [key]: logs.map((log) => {
          if ('items' in log) {
            // v2
            return log;
          }

          return {
            // v3 ... not working
            assetId: log.sequence.wellboreId,
            name: log.sequence.name || '',
            items: log.rows || [],
            id: log.sequence.id,
            state: 'LOADED',
          };
        }),
      };
    },
    {}
  );
};
