import React from 'react';

import { AllIconTypes, Button } from '@cognite/cogs.js';

import { ToolbarWrapper } from './elements';

export type Props = {
  chartRef: React.MutableRefObject<any>;
};

const Toolbar = ({ chartRef }: Props) => {
  const tools: AllIconTypes[] = [
    // 'ZoomIn', 'ZoomOut',
    'Refresh',
  ];

  return (
    <ToolbarWrapper>
      {tools.map((tool, index) => (
        <Button
          key={tool}
          type="ghost"
          icon={tool}
          size="small"
          aria-label={tool}
          onClick={() => {
            const inbuiltButtons = (
              chartRef.current?.el as HTMLDivElement
            ).getElementsByClassName('modebar-btn');
            (inbuiltButtons[index] as HTMLAnchorElement).click();
          }}
        />
      ))}
    </ToolbarWrapper>
  );
};

export default Toolbar;
