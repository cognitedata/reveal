import React, { useState } from "react";
import Draggable from "react-draggable";
import { Appearance } from "@/Core/States/Appearance";
import { Icon } from "@/UserInterface/Components/Icon/Icon";
import DragIndicatorIcon from "@material-ui/icons/DragIndicator";
import { ToolBarSelect } from "@/UserInterface/Components/ToolBarSelect/ToolBarSelect";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import makeStyles from "@material-ui/core/styles/makeStyles";

export interface IToolbarButton {
  icon: string;
  isDropdown: boolean;
  tooltip: string;
  dropdownOptions: string[];

  // From State
  isChecked: boolean;
  value: string;
  isVisible: boolean;
}

const useStyles = makeStyles(() => ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  root: (props: {
    toolbarIconSize: number;
    toolbarSelectWidth: number;
    dragging: boolean;
    horizontal: boolean;
  }) => ({}),
  toolbarWrapper: {
    position: "absolute",
    "z-index": "10",
  },
  toolbarContainer: (props: { horizontal: boolean }) => ({
    display: "flex",
    position: "relative",
    padding: "0 0 0 25px",
    flexDirection: props.horizontal ? "row" : "column",
  }),
  dragHandle: (props: { dragging: boolean }) => ({
    position: "absolute",
    left: "0.6rem",
    top: "0.5rem",
    cursor: props.dragging ? "move" : "pointer",
  }),
  dragHandleIcon: {
    width: "1.2rem",
    height: "1.7rem",
  },
  toolbarGroup: (props: { horizontal: boolean }) => ({
    display: "inline-grid",
    gridTemplateRows: props.horizontal ? "auto auto" : "auto",
    gridTemplateColumns: props.horizontal ? "auto" : "auto auto",
    gridAutoFlow: props.horizontal ? "column" : "row",
    margin: "0.25rem",
    border: "0.01rem solid black",
    backgroundColor: "rgba(223, 223, 223, 0.6)",
    borderRadius: "0.2rem",
  }),
  toolbarIcon: (props: { toolbarIconSize: number }) => ({
    height: props.toolbarIconSize,
    width: props.toolbarIconSize,
    transition: "background-color 0.3s",
    margin: "0.025rem",
    padding: "0.2rem 0.2rem",
    cursor: "pointer",
    "&:hover": {
      backgroundColor: "lightblue",
      borderColor: "lightblue",
    },
  }),
  toolbarIconSelected: {
    backgroundColor: "lightblue !important",
  },
  toolbarDropdown: (props: {
    toolbarIconSize: number;
    toolbarSelectWidth: number;
  }) => ({
    height: props.toolbarIconSize,
    width: props.toolbarSelectWidth,
    transition: "background-color 0.3s",
    margin: "0.025rem",
    padding: "0.2rem 0.2rem",
    cursor: "pointer",
    "&:hover": {
      backgroundColor: "lightblue",
      borderColor: "lightblue",
    },
  }),
}));

// Visualizer ToolBar Component
export function VisualizerToolbar(props: {
  visualizerId: string;
  toolbar?: Map<string, IToolbarButton[]>;
  onToolbarButtonClick: (
    visualizerId: string,
    groupId: string,
    index: number
  ) => void;
  onToolbarSelectionChange: (
    visualizerId: string,
    groupId: string,
    index: number,
    value: string
  ) => void;
}) {
  const {
    toolbar,
    visualizerId,
    onToolbarButtonClick,
    onToolbarSelectionChange,
  } = props;

  if (!toolbar) return null;
  const groupIds: string[] = toolbar ? Object.keys(toolbar) : [];

  const { toolbarIconSize, toolbarSelectWidth } = Appearance;

  // Toolbar orientation
  const [horizontal, setHorizontal] = useState(true);

  // Whether dragging is happening
  const [dragging, setDragging] = useState(false);

  const classes = useStyles({
    toolbarIconSize,
    toolbarSelectWidth,
    dragging,
    horizontal,
  });

  // Calls when handle is clicked
  const onToolbarHandleButtonClick = () => {
    setHorizontal(!horizontal);
  };

  // Called when dragging stops
  const onStop = () => {
    if (dragging) {
      setDragging(false);
    } else {
      onToolbarHandleButtonClick();
    }
  };

  // Called when dragging
  const onDrag = () => {
    if (!dragging) setDragging(true);
  };

  const addButton = (groupId, index, command) => {
    return (
      <Grid
        className={`${classes.toolbarIcon} ${
          command.isChecked ? classes.toolbarIconSelected : ""
        }`}
        onClick={() => onToolbarButtonClick(visualizerId, groupId, index)}
        key={`visualizer-toolbar-icon-${index}`}
      >
        {command.icon && (
          <Icon
            src={command.icon}
            tooltip={{
              text: command.tooltip,
              placement: horizontal ? "bottom" : "right-start",
            }}
            iconSize={{
              width: Appearance.toolbarIconSize,
              height: Appearance.toolbarIconSize,
            }}
          />
        )}
      </Grid>
    );
  };

  const addDropdown = (groupId, index, command) => {
    return (
      <Grid
        className={classes.toolbarDropdown}
        key={`visualizer-toolbar-icon-${index}`}
      >
        <ToolBarSelect
          currentValue={command.value}
          onChange={(value) =>
            onToolbarSelectionChange(visualizerId, groupId, index, value)
          }
          options={command.dropdownOptions}
          tooltip={{
            text: command.tooltip,
            placement: "right-start",
          }}
          iconSize={{
            width: Appearance.toolbarSelectWidth,
            height: Appearance.toolbarIconSize,
          }}
        />
      </Grid>
    );
  };

  const addToolbarButtons = (groupId: string) => {
    return toolbar[groupId].map((command, index) => {
      if (command.isDropdown && command.isVisible) {
        return addDropdown(groupId, index, command);
      }
      if (!command.isDropdown && command.isVisible)
        return addButton(groupId, index, command);
      return null;
    });
  };

  const addToolbars = () => {
    return groupIds?.map((id) => {
      return (
        <Grid className={classes.toolbarGroup} key={`tool-group-${id}`}>
          {addToolbarButtons(id)}
        </Grid>
      );
    });
  };

  return (
    <Draggable bounds="parent" handle=".handle" onDrag={onDrag} onStop={onStop}>
      <Box className={classes.toolbarWrapper}>
        <Box className={classes.toolbarContainer}>
          <Box className={`handle ${classes.dragHandle}`}>
            <Box className={classes.dragHandleIcon}>
              <DragIndicatorIcon color="secondary" />
            </Box>
          </Box>
          {addToolbars()}
        </Box>
      </Box>
    </Draggable>
  );
}
