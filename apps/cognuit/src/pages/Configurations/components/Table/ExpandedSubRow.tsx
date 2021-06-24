import {
  ExtendedConfigurationsResponse,
  UNIX_TIMESTAMP_FACTOR,
} from 'typings/interfaces';
import { Badge } from '@cognite/cogs.js';

import { ExpandedRow } from '../../elements';

// TODO_: Move date functions to utils
export function ExpandedSubRow({
  original: record,
}: {
  original: ExtendedConfigurationsResponse;
}) {
  return (
    <ExpandedRow>
      <div className="expanded-item">
        <div>
          <span className="expanded-item__label">Created: </span>
          <span className="expanded-item__content">
            {new Date(
              record.created_time * UNIX_TIMESTAMP_FACTOR
            ).toLocaleString()}
          </span>
        </div>
        <div>
          <span className="expanded-item__label">Last updated: </span>
          <span className="expanded-item__content">
            {new Date(
              record.last_updated * UNIX_TIMESTAMP_FACTOR
            ).toLocaleString()}
          </span>
        </div>
      </div>
      {record.datatypes.length > 0 && (
        <div className="expanded-item">
          <span className="expanded-item__label">Data types: </span>
          <span>
            {Object.entries(record.progress).map(
              ([tag, progress]: [string, any]) => (
                <Badge
                  key={tag}
                  text={`${tag} (${progress?.total})`}
                  background="greyscale-grey3"
                />
              )
            )}
          </span>
        </div>
      )}
      {record.business_tags.length > 0 && (
        <div className="expanded-item">
          <span className="expanded-item__label">Business tags: </span>
          <span>
            {record.business_tags.map((tag: string) => (
              <Badge key={tag} text={tag} background="greyscale-grey3" />
            ))}
          </span>
        </div>
      )}
    </ExpandedRow>
  );
}
