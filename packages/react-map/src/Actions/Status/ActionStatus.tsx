import React, { Fragment } from 'react';
import { Icon } from '@cognite/cogs.js';
import { MapAddedProps } from 'types';
import MapboxGLDraw from '@mapbox/mapbox-gl-draw';

import { POLYGON_EDIT_MESSAGE } from '../../constants';

import {
  StatusContainer,
  StatusKey,
  StatusMessage,
  StatusSeparator,
} from './elements';

const allMessages: { [status: string]: React.ReactNode } = {
  finish: (
    <>
      Press <StatusKey>Enter</StatusKey> to finish editing{' '}
    </>
  ),
  cancel: (
    <>
      Press <StatusKey>Esc</StatusKey> to cancel polygon search
    </>
  ),
  edit: POLYGON_EDIT_MESSAGE,
};

const getMessageCodes = ({
  draw,
  polygon,
  selectedFeatures,
}: MapAddedProps): (keyof typeof allMessages)[] => {
  const isPolygonButtonActive =
    draw === MapboxGLDraw.modes.DRAW_POLYGON || polygon?.length > 0;

  if (!isPolygonButtonActive) {
    return [];
  }

  if (
    selectedFeatures &&
    selectedFeatures.length === 0 &&
    polygon &&
    polygon.length > 0
  ) {
    return ['edit'];
  }

  return ['finish', 'cancel'];
};

export const ActionStatus: React.FC<MapAddedProps> = (props) => {
  const messagesToShow = getMessageCodes(props);

  if (messagesToShow.length === 0) {
    return null;
  }

  return (
    <StatusContainer data-testid="shortcut-helper">
      <Icon type="Info" />
      {messagesToShow.map((messageId, index) => (
        <Fragment key={`${messageId}InfoMessage`}>
          {!!index && <StatusSeparator data-testid="info-message-separator" />}
          <StatusMessage data-testid={`${messageId}-info-message`}>
            {allMessages[messageId]}
          </StatusMessage>
        </Fragment>
      ))}
    </StatusContainer>
  );
};
