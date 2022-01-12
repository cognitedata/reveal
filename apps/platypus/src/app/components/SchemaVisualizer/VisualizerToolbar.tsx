import { Switch, Input, ToolBar } from '@cognite/cogs.js';

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
  return (
    <ToolBar direction="horizontal">
      <>
        <Input
          style={{ marginLeft: 4 }}
          placeholder="Search"
          size="small"
          value={searchFilterValue}
          onChange={(e) => setSearchFilterValue(e.target.value)}
        />
        <Switch
          style={{ marginLeft: 8, marginRight: 8 }}
          checked={isCollapsed}
          name="Collapse details"
          onChange={() => setIsCollapsed(!isCollapsed)}
        >
          Collapse details
        </Switch>
      </>
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
