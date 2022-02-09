import { CogniteEvent } from '@cognite/sdk';
import Loading from 'components/utils/Loading';
import StatusMessage from 'components/utils/StatusMessage';
import useEventListQuery from 'hooks/useQuery/useEventListQuery';
import dayjs from 'dayjs';
import useEventUniqueValues, {
  UniqueValue,
} from 'hooks/useQuery/useEventUniqueValues';
import { useState } from 'react';

import Card from '../Card';

import { EventList, TypeButton } from './elements';

export type EventsCardProps = {
  assetId: number;
  onHeaderClick?: () => void;
  onEventClick?: (event: CogniteEvent) => void;
};

type UniqueTypeButtonProps = {
  uniqueValue: UniqueValue;
  onClick: () => void;
};

const UniqueTypeButton = ({ uniqueValue, onClick }: UniqueTypeButtonProps) => {
  return (
    <TypeButton unstyled onClick={onClick}>
      <div className="value">{uniqueValue.value}</div>
      <div className="count">{uniqueValue.count}</div>
    </TypeButton>
  );
};

const EventsCard = ({
  assetId,
  onHeaderClick,
  onEventClick,
}: EventsCardProps) => {
  const [uniqueValue, setUniqueValue] = useState<UniqueValue>();
  const {
    data: eventsList,
    isLoading,
    error,
  } = useEventListQuery({
    filter: { assetIds: [assetId], type: uniqueValue?.value },
    limit: 10,
  });

  const { data: uniqueTypes } = useEventUniqueValues('type', {
    filter: { assetIds: [assetId] },
  });

  const renderLink = (event: CogniteEvent) => {
    return (
      <div
        key={event.id}
        className="row"
        role="button"
        onClick={() => {
          onEventClick && onEventClick(event);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && onEventClick) {
            onEventClick(event);
          }
        }}
        tabIndex={onEventClick ? -1 : 0}
      >
        <div>
          {event.type} <br /> {event.description}
        </div>
        <div>{dayjs(event.startTime).format('L')}</div>
      </div>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return <Loading />;
    }
    if (error) {
      return (
        <StatusMessage type="Error" message="We could not load your events." />
      );
    }

    if ((uniqueTypes || []).length === 0) {
      return <StatusMessage type="Missing.Events" />;
    }

    if (!uniqueValue) {
      return (uniqueTypes || []).map((uniqueValue) => (
        <UniqueTypeButton
          key={uniqueValue.value}
          uniqueValue={uniqueValue}
          onClick={() => {
            setUniqueValue(uniqueValue);
          }}
        />
      ));
    }

    return (
      <EventList>
        <div>
          <UniqueTypeButton
            uniqueValue={uniqueValue}
            onClick={() => {
              setUniqueValue(undefined);
            }}
          />
        </div>
        <div>{eventsList?.map(renderLink)}</div>
      </EventList>
    );
  };

  return (
    <Card header={{ title: 'Events', icon: 'Events' }} onClick={onHeaderClick}>
      {renderContent()}
    </Card>
  );
};

export default EventsCard;
