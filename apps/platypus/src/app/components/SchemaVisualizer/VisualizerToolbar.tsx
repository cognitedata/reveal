import { Input, ToolBar } from '@cognite/cogs.js';
import { ToolbarMenu } from './ToolbarMenu';

export const VisualizerToolbar = ({
  isCollapsed,
  setIsCollapsed,
  isVisualizerExpanded,
  setIsVisualizerExpanded,
  searchFilterValue,
  setSearchFilterValue,
  zoomInHandler,
  zoomOutHandler,
  fitHandler,
}: {
  isCollapsed: boolean;
  setIsCollapsed: (newValue: boolean) => void;
  isVisualizerExpanded: boolean;
  setIsVisualizerExpanded: (newValue: boolean) => void;
  searchFilterValue: string;
  setSearchFilterValue: (newValue: string) => void;
  zoomInHandler: () => void;
  zoomOutHandler: () => void;
  fitHandler: () => void;
}) => {
  const filterDropdownMenu = (
    <ToolbarMenu>
      <ToolbarMenu.Item
        css={{ display: 'flex' }}
        onChange={() => setIsCollapsed(!isCollapsed)}
        toggled={isCollapsed}
        hasSwitch
      >
        Headers only
      </ToolbarMenu.Item>
    </ToolbarMenu>
  );

  return (
    <ToolBar direction="horizontal">
      <>
        <Input
          type="search"
          style={{ marginLeft: 4 }}
          placeholder="Search"
          size="small"
          css={{}}
          value={searchFilterValue}
          onChange={(e) => setSearchFilterValue(e.target.value)}
        />
      </>
      <ToolBar.ButtonGroup
        buttonGroup={[
          {
            icon: 'EyeShow',
            'aria-label': 'filter',
            description: 'Filter',
            dropdownContent: filterDropdownMenu,
          },
        ]}
      />
      <ToolBar.ButtonGroup
        buttonGroup={[
          {
            icon: 'ZoomIn',
            'aria-label': 'zoom in',
            description: 'Zoom in',
            onClick: () => zoomInHandler(),
          },
          {
            icon: 'ZoomOut',
            'aria-label': 'zoom out',
            description: 'Zoom out',
            onClick: () => zoomOutHandler(),
          },
          {
            icon: 'FullScreen',
            'aria-label': 'fullscreen',
            description: 'Fit to screen',
            onClick: () => fitHandler(),
          },
        ]}
      />
      {!isVisualizerExpanded && (
        <ToolBar.ButtonGroup
          buttonGroup={[
            {
              icon: 'Expand',
              'aria-label': 'expand',
              description: 'Expand to full screen',
              onClick: () => setIsVisualizerExpanded(!isVisualizerExpanded),
            },
          ]}
        />
      )}
    </ToolBar>
  );
};
