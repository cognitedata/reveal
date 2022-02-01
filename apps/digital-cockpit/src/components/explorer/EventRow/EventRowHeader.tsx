import { TrWrapper } from './elements';

export type EventRowHeaderProps = {
  onClick?: () => void;
};

const EventRowHeader = ({ onClick }: EventRowHeaderProps) => {
  return (
    <TrWrapper onClick={onClick} className="header">
      <th>Type / Subtype</th>
      <th>
        <span>
          Description{' '}
          <span className="small-screen-only"> / Start &amp; End time</span>
        </span>
      </th>

      <th>
        <div className="row--dates large-screen-only">Start time</div>
      </th>
      <th>
        <div className="row--dates large-screen-only">End Time</div>
      </th>
    </TrWrapper>
  );
};

export default EventRowHeader;
