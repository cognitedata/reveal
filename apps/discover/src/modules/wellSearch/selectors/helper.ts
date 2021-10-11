import { Sequence } from '@cognite/sdk';

import { shortDate } from '_helpers/date';
import { LogTypeData } from 'pages/authorized/search/well/inspect/modules/logType/interfaces';

import { Well, Wellbore } from '../types';

export const updateData = (
  tableData: LogTypeData[],
  well: Well,
  wellbore: Wellbore,
  dataType: string,
  sequence: Sequence
) => {
  tableData.push({
    ...sequence,
    ...{
      wellName: well.name,
      logType: dataType,
      wellboreName: wellbore.description || '',
      modified: shortDate(sequence.lastUpdatedTime),
    },
  });
};
