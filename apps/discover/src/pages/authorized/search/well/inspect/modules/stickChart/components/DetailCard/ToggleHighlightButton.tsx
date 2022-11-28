import * as React from 'react';

import { useHighlightEvent } from '../../hooks/useHighlightEvent';
import { EventType } from '../../types';

import { HighlightButton, RemoveButton } from './Buttons';

export interface ToggleHighlightButtonProps {
  type: EventType;
  eventExternalId: string;
}

export const ToggleHighlightButton: React.FC<ToggleHighlightButtonProps> = ({
  type,
  eventExternalId,
}) => {
  const { isEventHighlighted, toggleHighlightEvent } = useHighlightEvent(type);

  const Button = isEventHighlighted(eventExternalId)
    ? RemoveButton
    : HighlightButton;

  const handleToggleHighlight = () => {
    toggleHighlightEvent(eventExternalId);
  };

  return <Button onClick={handleToggleHighlight} />;
};
