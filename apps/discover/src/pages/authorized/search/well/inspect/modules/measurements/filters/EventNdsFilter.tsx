import { useNdsEventsForMultiSelect } from 'domain/wells/nds/internal/hooks/useNdsEventsForMultiSelect';

import React, { useEffect } from 'react';

import { IconType } from '@cognite/cogs.js';

import { MultiSelectCategorized } from 'components/Filters/MultiSelectCategorized/MultiSelectCategorized';
import { MultiSelectCategorizedOptionMap } from 'components/Filters/MultiSelectCategorized/types';

interface Props {
  selectedEvents: MultiSelectCategorizedOptionMap;
  onChange: (events: MultiSelectCategorizedOptionMap) => void;
  iconInsteadText?: IconType;
}

export const EventNdsFilter: React.FC<Props> = ({
  selectedEvents,
  onChange,
  iconInsteadText,
}) => {
  const events = useNdsEventsForMultiSelect();

  // Automatically select all the events when the component is mounted
  useEffect(() => {
    if (!events) return;

    onChange(events);
  }, [events]);

  return (
    <MultiSelectCategorized
      title="NDS"
      onValueChange={(values) => onChange(values as any)}
      selectedOptions={selectedEvents}
      options={events}
      width={iconInsteadText ? undefined : 200}
      viewMode="submenu"
      iconInsteadText={iconInsteadText}
    />
  );
};
