import { FloatingComponentsPanel } from 'components/floating-components-panel/FloatingComponentsPanel';
import ToolBar, { ToolbarButtonProps } from 'components/toolbar/ToolBar';
import { useWorkflowBuilderContext } from 'contexts/WorkflowContext';
import { useCallback, useEffect, useState } from 'react';

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
    {
      icon: 'FlowChart',
      onClick: () => {},
      showTooltip: true,
      tooltipContent: 'Format workflow',
    },
    {
      icon: 'Square', // There's no icon for sticky notes at the moment
      onClick: () => {},
      showTooltip: true,
      tooltipContent: 'Sticky note',
    },
    {
      icon: 'CommentDots',
      onClick: () => {},
      showTooltip: true,
      tooltipContent: 'Comment',
    },
    {
      icon: 'ChevronLeft', // There's no icon for undo at the moment
      onClick: () => {},
      showTooltip: true,
      tooltipContent: 'Undo',
    },
    {
      icon: 'ChevronRight', // There's no icon for redo at the moment
      onClick: () => {},
      showTooltip: true,
      tooltipContent: 'Redo',
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
