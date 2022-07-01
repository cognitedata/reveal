import { useNptEventsForMultiSelect } from 'domain/wells/npt/internal/hooks/useNptEventsForMultiSelect';

import React, { useEffect } from 'react';

import { MultiSelectCategorized } from 'components/Filters/MultiSelectCategorized/MultiSelectCategorized';
import { MultiSelectCategorizedOptionMap } from 'components/Filters/MultiSelectCategorized/types';

interface Props {
  selectedEvents: MultiSelectCategorizedOptionMap;
  onChange: (events: MultiSelectCategorizedOptionMap) => void;
}

export const EventNptFilter: React.FC<Props> = ({
  selectedEvents,
  onChange,
}) => {
  const events = useNptEventsForMultiSelect();

  // Automatically select all the events when the component is mounted
  useEffect(() => {
    if (!events) return;

    onChange(events);
  }, [events]);

  return (
    <MultiSelectCategorized
      title="NPT"
      onValueChange={(values) => onChange(values as any)}
      selectedOptions={selectedEvents}
      options={events}
      width={250}
      viewMode="submenu"
    />
  );
};
