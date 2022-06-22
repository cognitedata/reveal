import { Input, Switch, ToolBar } from '@cognite/cogs.js';
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
      <ToolbarMenu.Item onClick={() => setIsCollapsed(!isCollapsed)}>
        Headers only{' '}
        <Switch
          checked={isCollapsed}
          onClick={(e) => {
            e.preventDefault();
            setIsCollapsed(!isCollapsed);
          }}
          name="Collapse details"
        ></Switch>
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
            description: 'Filter',
            dropdownContent: filterDropdownMenu,
          },
        ]}
      />
      <ToolBar.ButtonGroup
        buttonGroup={[
          {
            icon: 'ZoomIn',
            description: 'Zoom in',
            onClick: () => zoomInHandler(),
          },
          {
            icon: 'ZoomOut',
            description: 'Zoom out',
            onClick: () => zoomOutHandler(),
          },
          {
            icon: 'FullScreen',
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
              description: 'Expand to full screen',
              onClick: () => setIsVisualizerExpanded(!isVisualizerExpanded),
            },
          ]}
        />
      )}
    </ToolBar>
  );
};
