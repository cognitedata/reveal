import React from 'react';

import { Button, Tooltip } from '@cognite/cogs.js';

import { ToolbarWrapper } from './elements';

export type Props = {
  chartRef: React.MutableRefObject<any>;
};

const Toolbar = ({ chartRef }: Props) => {
  return (
    <ToolbarWrapper>
      <Tooltip content="Zoom in">
        <Button
          key="zoom-in"
          type="ghost"
          icon="ZoomIn"
          size="small"
          aria-label="Zoom in"
          onClick={() => {
            const inbuiltButtons = (
              chartRef.current?.el as HTMLDivElement
            ).querySelector("[data-val='in']");

            if (!inbuiltButtons) return;
            (inbuiltButtons as HTMLAnchorElement).click();
          }}
        />
      </Tooltip>

      <Tooltip content="Zoom out">
        <Button
          key="zoom-out"
          type="ghost"
          icon="ZoomOut"
          size="small"
          aria-label="Zoom out"
          onClick={() => {
            const inbuiltButtons = (
              chartRef.current?.el as HTMLDivElement
            ).querySelector("[data-val='out']");

            if (!inbuiltButtons) return;
            (inbuiltButtons as HTMLAnchorElement).click();
          }}
        />
      </Tooltip>

      <Tooltip content="Reset zoom">
        <Button
          key="Refresh"
          type="ghost"
          icon="Refresh"
          size="small"
          aria-label="Refresh"
          onClick={() => {
            const inbuiltButtons = (
              chartRef.current?.el as HTMLDivElement
            ).querySelector("[data-val='auto']");

            if (!inbuiltButtons) return;
            (inbuiltButtons as HTMLAnchorElement).click();
          }}
        />
      </Tooltip>
    </ToolbarWrapper>
  );
};

export default Toolbar;
