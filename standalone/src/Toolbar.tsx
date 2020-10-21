import React from "react";
import {
  IToolbarButton,
  VisualizerToolbarProps,
  ToolbarButtonClickHandler,
  ToolbarSelectChangeHandler,
} from "@cognite/node-visualizer";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from '@material-ui/core/FormControl';

import HelpIcon from "@material-ui/icons/Help";

import PanToolIcon from "@material-ui/icons/PanTool";
import EditIcon from "@material-ui/icons/Edit";
import PhotoSizeSelectSmallIcon from "@material-ui/icons/PhotoSizeSelectSmall";
import ZoomInIcon from "@material-ui/icons/ZoomIn";
import AspectRatioIcon from "@material-ui/icons/AspectRatio";

import PageviewIcon from "@material-ui/icons/Pageview";
import MergeTypeIcon from "@material-ui/icons/MergeType";
import PhotoLibraryIcon from "@material-ui/icons/PhotoLibrary";
import CompareIcon from "@material-ui/icons/Compare";
import FullscreenIcon from "@material-ui/icons/Fullscreen";
import CategoryIcon from "@material-ui/icons/Category";
import FlipToFrontIcon from "@material-ui/icons/FlipToFront";

import BorderTopIcon from "@material-ui/icons/BorderTop";
import BorderBottomIcon from "@material-ui/icons/BorderBottom";
import BorderInnerIcon from "@material-ui/icons/BorderInner";
import BorderOuterIcon from "@material-ui/icons/BorderOuter";
import BorderLeftIcon from "@material-ui/icons/BorderLeft";
import BorderRightIcon from "@material-ui/icons/BorderRight";

interface Handlers {
  onToolbarButtonClick: ToolbarButtonClickHandler;
  onToolbarSelectionChange: ToolbarSelectChangeHandler;
}

const getIcon = (id: string): JSX.Element => {
  const mapping: { [id: string]: JSX.Element } = {
    tools0: <PanToolIcon />,
    tools1: <EditIcon />,
    tools2: <PhotoSizeSelectSmallIcon />,
    tools3: <ZoomInIcon />,
    tools4: <AspectRatioIcon />,

    actions0: <PageviewIcon />,
    actions1: <MergeTypeIcon />,
    actions2: <PhotoLibraryIcon />,
    actions3: <CompareIcon />,
    actions4: <FullscreenIcon />,
    actions5: <CategoryIcon />,
    actions6: <FlipToFrontIcon />,

    viewfrom0: <BorderTopIcon />,
    viewfrom1: <BorderBottomIcon />,
    viewfrom2: <BorderInnerIcon />,
    viewfrom3: <BorderOuterIcon />,
    viewfrom4: <BorderLeftIcon />,
    viewfrom5: <BorderRightIcon />,
  };
  const key = id.toLowerCase();

  return mapping[key] || <HelpIcon />;
};
const getIconId = (groupId: string, index: number): string =>
  `${groupId}${index}`;

export const Toolbar: React.FC<VisualizerToolbarProps> = ({
  visualizerId,
  config,
  onToolbarButtonClick,
  onToolbarSelectionChange,
}: VisualizerToolbarProps) => {
  const renderGroup = (
    visualizerId: string,
    groupId: string,
    buttons: IToolbarButton[] = [],
    { onToolbarButtonClick, onToolbarSelectionChange }: Handlers
  ) => {
    return buttons
      .map((button, index) => {
        const { tooltip, isDropdown, isVisible } = button;
        const key = getIconId(groupId, index);
        const buttonHandler = () =>
          onToolbarButtonClick(visualizerId, groupId, index);
        const selectHandler = (event: any) =>
          onToolbarSelectionChange(
            visualizerId,
            groupId,
            index,
            event.target.value
          );

        if (!isVisible) return null;

        return (
          <Grid item key={key} >
            <Tooltip title={tooltip}>
              {isDropdown
                ? renderDropdown(button, selectHandler)
                : renderIcon(key, button, buttonHandler)}
            </Tooltip>
          </Grid>
        );
      })
      .filter(Boolean);
  };

  const renderDropdown = (
    { value, dropdownOptions }: IToolbarButton,
    handler: (event: any) => void
  ) => {
    return (
      <FormControl variant={"standard"}>
        <Select value={value} onChange={handler} style={{padding: '5px'}}>
          {dropdownOptions.map((dropdown: string) => (
            <MenuItem key={dropdown} value={dropdown}>{dropdown}</MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  };

  const renderIcon = (
    id: string,
    { isChecked }: IToolbarButton,
    handler: () => void
  ) => {
    return (
      <IconButton
        style={isChecked ? { backgroundColor: "#ededed" } : {}}
        onClick={handler}
      >
        {getIcon(id)}
      </IconButton>
    );
  };

  return (
    <Box
      style={{
        backgroundColor: "#fff",
        padding: "10px",
        position: "absolute",
        width: "100%",
        zIndex: 1,
      }}
    >
      <Grid container spacing={1}>
        {Object.keys(config).map((groupId) => (
          <Grid key={groupId} container>
            {renderGroup(visualizerId, groupId, config[groupId], {
              onToolbarButtonClick,
              onToolbarSelectionChange,
            })}
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
