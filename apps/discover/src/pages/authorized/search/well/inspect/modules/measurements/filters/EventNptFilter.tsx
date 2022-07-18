import { useNptCodeHelpText } from 'domain/wells/npt/internal/hooks/useNptCodeHelpText';
import { useNptEventsForMultiSelect } from 'domain/wells/npt/internal/hooks/useNptEventsForMultiSelect';

import React, { useEffect } from 'react';

import { MultiSelectCategorized } from 'components/Filters/MultiSelectCategorized/MultiSelectCategorized';
import { MultiSelectCategorizedOptionMap } from 'components/Filters/MultiSelectCategorized/types';

import { Definition } from '../../nptEvents/components/Definition';
import { NoCodeDefinition } from '../../nptEvents/components/NoCodeDefinition';

interface Props {
  selectedEvents: MultiSelectCategorizedOptionMap;
  onChange: (events: MultiSelectCategorizedOptionMap) => void;
}

export const EventNptFilter: React.FC<Props> = ({
  selectedEvents,
  onChange,
}) => {
  const events = useNptEventsForMultiSelect();

  const nptCodeHelpText = useNptCodeHelpText();

  const renderNptHelpText = (nptCode: string) => {
    const codeDefinition = nptCodeHelpText?.[nptCode];

    if (!codeDefinition) {
      return <NoCodeDefinition />;
    }

    return <Definition definition={codeDefinition} />;
  };

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
      renderCategoryHelpText={renderNptHelpText}
      options={events}
      width={175}
      viewMode="submenu"
    />
  );
};
