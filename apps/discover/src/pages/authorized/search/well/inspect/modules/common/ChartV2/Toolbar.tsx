import React from 'react';

import { Button } from '@cognite/cogs.js';

import { ToolbarWrapper } from './elements';

export type Props = {
  chartRef: React.MutableRefObject<any>;
};

const Toolbar = ({ chartRef }: Props) => {
  return (
    <ToolbarWrapper>
      <Button
        key="Refresh"
        type="ghost"
        icon="Refresh"
        size="small"
        aria-label="Refresh"
        onClick={() => {
          const inbuiltButtons = (
            chartRef.current?.el as HTMLDivElement
          ).querySelector("[data-attr='zoom']");

          if (!inbuiltButtons) return;
          (inbuiltButtons as HTMLAnchorElement).click();
        }}
      />
    </ToolbarWrapper>
  );
};

export default Toolbar;
