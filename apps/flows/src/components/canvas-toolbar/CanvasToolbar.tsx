import { useCallback, useEffect, useState } from 'react';

import { FloatingComponentsPanel } from '@flows/components/floating-components-panel/FloatingComponentsPanel';
import ToolBar, { ToolbarButtonProps } from '@flows/components/toolbar/ToolBar';
import { useWorkflowBuilderContext } from '@flows/contexts/WorkflowContext';

export const CanvasToolbar = () => {
  const [active, setActive] = useState(false);
  const { setIsComponentsPanelVisible, isComponentsPanelVisible } =
    useWorkflowBuilderContext();

  const handleAddNodeClick = useCallback(() => {
    setIsComponentsPanelVisible(!isComponentsPanelVisible);
    setActive(!active);
  }, [active, isComponentsPanelVisible, setIsComponentsPanelVisible]);

  useEffect(() => {
    if (!isComponentsPanelVisible) {
      setActive(false);
    }
  }, [isComponentsPanelVisible]);

  const buttons: ToolbarButtonProps[] = [
    {
      icon: 'AddLarge',
      onClick: () => {
        handleAddNodeClick();
      },
      activeButton: active,
      showTooltip: true,
      tooltipContent: 'Add components',
      plusButton: true,
    },
  ];

  return (
    <>
      <ToolBar
        buttons={buttons}
        placement="topLeft"
        toolbarDirection="column"
        gap={4}
        tooltipPlacement="right"
      />
      {isComponentsPanelVisible && <FloatingComponentsPanel />}
    </>
  );
};
