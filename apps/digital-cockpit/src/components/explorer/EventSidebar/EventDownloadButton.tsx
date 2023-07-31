import { Icon } from '@cognite/cogs.js';
import { CogniteEvent } from '@cognite/sdk';
import { useMemo } from 'react';

const EventDownloadButton = ({ event }: { event: CogniteEvent }) => {
  const dataStr = useMemo(
    () =>
      `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(event)
      )}`,
    [event]
  );

  const fileName = `${event.type}-${event.subtype}-${event.id}`;

  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      className="cogs-btn cogs-btn-secondary cogs-btn--padding"
      href={dataStr}
      download={`${fileName}.json`}
    >
      <Icon type="Download" style={{ marginRight: '8px' }} />
      Download
    </a>
  );
};

export default EventDownloadButton;
