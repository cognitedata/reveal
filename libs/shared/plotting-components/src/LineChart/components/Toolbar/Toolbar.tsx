import * as React from 'react';

import { AxisDirectionConfig, LineChartProps } from '../../types';
import { PlotElement } from '../Plot';

import { ToolbarWrapper } from './elements';
import { Filters } from './Filters';
import { Actions } from './Actions';

export interface ToolbarProps
  extends Pick<LineChartProps, 'renderFilters' | 'renderActions'> {
  plotRef: React.RefObject<PlotElement>;
  zoomDirectionConfig: AxisDirectionConfig;
  showFilters: boolean;
  showActions: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = React.memo(
  ({
    plotRef,
    zoomDirectionConfig,
    showFilters,
    showActions,
    renderFilters,
    renderActions,
  }) => {
    return (
      <ToolbarWrapper>
        <Filters showFilters={showFilters} renderFilters={renderFilters} />

        <Actions
          plotRef={plotRef}
          zoomDirectionConfig={zoomDirectionConfig}
          showActions={showActions}
          renderActions={renderActions}
        />
      </ToolbarWrapper>
    );
  }
);
