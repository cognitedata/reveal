import * as React from 'react';
import { Icon } from '@cognite/cogs.js';
import { MapAddedProps } from 'types';

import { StatusContainer, StatusMessage, StatusSeparator } from './elements';
import { allMessages, getStatusMessage } from './getStatusMessage';

export const ActionStatus: React.FC<MapAddedProps> = (props) => {
  const messagesToShow = getStatusMessage(props);
  const hasNothingToShow = messagesToShow.length === 0;

  if (hasNothingToShow) {
    return null;
  }

  return (
    <StatusContainer data-testid="shortcut-helper">
      <Icon type="Info" />
      {messagesToShow.map((messageId, index) => (
        <React.Fragment key={`${messageId}InfoMessage`}>
          {!!index && <StatusSeparator data-testid="info-message-separator" />}
          <StatusMessage data-testid={`${messageId}-info-message`}>
            {allMessages[messageId]}
          </StatusMessage>
        </React.Fragment>
      ))}
    </StatusContainer>
  );
};
