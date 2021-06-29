import {
  ExtendedConfigurationsResponse,
  UNIX_TIMESTAMP_FACTOR,
} from 'typings/interfaces';
import { Badge } from '@cognite/cogs.js';
import { getProgressStats } from 'pages/Configurations/utils/progress';

import {
  ExpandedItem,
  ExpandedItemContent,
  ExpandedItemLabel,
  ExpandedRow,
  ExpandedItemRow,
} from '../../elements';

// TODO_: Move date functions to utils
export function ExpandedSubRow({
  original: record,
}: {
  original: ExtendedConfigurationsResponse;
}) {
  return (
    <ExpandedRow>
      <ExpandedItem column>
        <ExpandedItemRow>
          <ExpandedItemLabel>Created: </ExpandedItemLabel>
          <ExpandedItemContent>
            {new Date(
              record.created_time * UNIX_TIMESTAMP_FACTOR
            ).toLocaleString()}
          </ExpandedItemContent>
        </ExpandedItemRow>
        <ExpandedItemRow>
          <ExpandedItemLabel>Last updated: </ExpandedItemLabel>
          <ExpandedItemContent>
            {new Date(
              record.last_updated * UNIX_TIMESTAMP_FACTOR
            ).toLocaleString()}
          </ExpandedItemContent>
        </ExpandedItemRow>
      </ExpandedItem>
      {record.datatypes.length > 0 && (
        <ExpandedItem>
          <ExpandedItemLabel>Data types: </ExpandedItemLabel>
          {record.datatypes.map((datatype) => (
            <Badge
              key={datatype}
              text={`${datatype} (${getProgressStats(record, datatype)})`}
              background="greyscale-grey3"
            />
          ))}
        </ExpandedItem>
      )}
      {record.business_tags.length > 0 && (
        <ExpandedItem>
          <ExpandedItemLabel>Business tags: </ExpandedItemLabel>
          {record.business_tags.map((tag: string) => (
            <Badge key={tag} text={tag} background="greyscale-grey3" />
          ))}
        </ExpandedItem>
      )}
    </ExpandedRow>
  );
}
