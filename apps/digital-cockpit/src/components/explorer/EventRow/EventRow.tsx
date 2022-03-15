import { Icon } from '@cognite/cogs.js';
import { CogniteEvent, Timestamp } from '@cognite/sdk';
import dayjs from 'dayjs';

import { TrWrapper } from './elements';

export type EventRowProps = {
  event: CogniteEvent;
  onClick?: () => void;
  className?: string;
};

const formatDate = (date?: Timestamp) => {
  if (!date) {
    return 'Ongoing';
  }
  return dayjs(date).format('LLL');
};

const EventRow = ({ event, onClick, className = '' }: EventRowProps) => {
  if (!event) {
    return null;
  }
  return (
    <TrWrapper onClick={onClick} className={`row ${className}`}>
      <td>
        <div className="row--types">
          <div>{event.type}</div> <div className="subtype">{event.subtype}</div>
        </div>
      </td>
      <td>
        <div className="row--meta">
          <h4>{event.description}</h4>
          <div className="small-screen-only">
            {formatDate(event?.startTime)}{' '}
            <Icon
              type="ChevronRight"
              style={{
                margin: '0 8px',
                position: 'relative',
                top: 2,
                opacity: 0.6,
              }}
            />{' '}
            {formatDate(event?.endTime)}
          </div>
        </div>
      </td>

      <td>
        <div className="row--dates large-screen-only">
          {formatDate(event?.startTime)}
        </div>
      </td>
      <td>
        <div className="row--dates large-screen-only">
          {formatDate(event?.endTime)}
        </div>
      </td>
    </TrWrapper>
  );
};

export default EventRow;
