import { Icon, IconType, Input, Switch, ToolBar } from '@cognite/cogs.js';
import { ToolbarMenu } from './ToolbarMenu';
import { DirectiveBuiltInType } from '@platypus/platypus-core';

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
  fieldDirectives,
  visibleFieldDirectives,
  setVisibleFieldDirectives,
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
  fieldDirectives: DirectiveBuiltInType[];
  visibleFieldDirectives: DirectiveBuiltInType[];
  setVisibleFieldDirectives: (
    visibleFieldDirectives: DirectiveBuiltInType[]
  ) => void;
}) => {
  // eslint-disable-next-line
  const isDirectiveVisible = (directive: DirectiveBuiltInType) =>
    visibleFieldDirectives.some((f) => f.name === directive.name);

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

      {!!fieldDirectives.length && <ToolbarMenu.Divider /> && (
        <ToolbarMenu.Header>Attributes</ToolbarMenu.Header>
      )}
      {fieldDirectives.map((fieldDirective) => {
        return (
          <ToolbarMenu.Item
            key={fieldDirective.name}
            onClick={() => {
              if (
                visibleFieldDirectives.some(
                  (directive) => directive.name === fieldDirective.name
                )
              ) {
                setVisibleFieldDirectives(
                  visibleFieldDirectives.filter(
                    (directive) => directive.name !== fieldDirective.name
                  )
                );
              } else {
                setVisibleFieldDirectives([
                  ...visibleFieldDirectives,
                  fieldDirective,
                ]);
              }
            }}
            appendIcon={
              isDirectiveVisible(fieldDirective) ? 'Checkmark' : undefined
            }
          >
            {fieldDirective.icon && (
              <Icon type={fieldDirective.icon as IconType} />
            )}
            {fieldDirective.name}
          </ToolbarMenu.Item>
        );
      })}
    </ToolbarMenu>
  );

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
