import * as React from 'react';

import { ActionsWrapper, ActionWrapper } from './elements';
import { ToolbarProps } from './Toolbar';
import { ZoomActions } from '../ZoomActions';

export interface ActionsProps
  extends Pick<
    ToolbarProps,
    'plotRef' | 'zoomDirectionConfig' | 'renderActions'
  > {
  showActions: boolean;
}

export const Actions: React.FC<ActionsProps> = ({
  plotRef,
  zoomDirectionConfig,
  showActions,
  renderActions,
}) => {
  if (!showActions) {
    return null;
  }

  return (
    <ActionsWrapper>
      <ActionWrapper>
        <ZoomActions
          key="zoom-actions"
          plotRef={plotRef}
          zoomDirectionConfig={zoomDirectionConfig}
        />
      </ActionWrapper>

      {renderActions?.().map((Action, index) => {
        return (
          <ActionWrapper key={`action-${index + 1}`}>{Action}</ActionWrapper>
        );
      })}
    </ActionsWrapper>
  );
};
