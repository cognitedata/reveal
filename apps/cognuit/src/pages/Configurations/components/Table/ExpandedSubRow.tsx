import { ExtendedConfigurationsResponse } from 'typings/interfaces';
import { Badge, Body } from '@cognite/cogs.js';
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
            {new Date(record.created_time).toLocaleString()}
          </ExpandedItemContent>
        </ExpandedItemRow>
        <ExpandedItemRow>
          <ExpandedItemLabel>Last updated: </ExpandedItemLabel>
          <ExpandedItemContent>
            {new Date(record.last_updated).toLocaleString()}
          </ExpandedItemContent>
        </ExpandedItemRow>
      </ExpandedItem>
      <ExpandedItem>
        <ExpandedItemLabel>Author: </ExpandedItemLabel>
        <Body level={2}>{record.author}</Body>
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
          {record.business_tags.map((tag) => (
            <Badge key={tag} text={tag} background="greyscale-grey3" />
          ))}
        </ExpandedItem>
      )}
      {record.data_status.length > 0 && (
        <ExpandedItem>
          <ExpandedItemLabel>Status tags: </ExpandedItemLabel>
          {record.data_status.map((tag) => (
            <Badge key={tag} text={tag} background="greyscale-grey3" />
          ))}
        </ExpandedItem>
      )}
    </ExpandedRow>
  );
}
