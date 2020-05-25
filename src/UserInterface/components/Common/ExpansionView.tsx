import React from "react";
import { useDispatch } from "react-redux";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronUp } from "@fortawesome/free-solid-svg-icons/faChevronUp";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons/faChevronDown";

import { onExpandChange } from "@/UserInterface/redux/actions/settings";
import { ToolBarType } from "@/UserInterface/interfaces/common";
import ToolBar from "./ToolBar";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    expansionSummaryRoot: {
      padding: "0 !important",
      minHeight: "1.8rem !important",
    },
    expansionSummaryHeader: {
      display: "flex",
      alignItems: "center",
      width: "100% !important",
      margin: "0 !important",
      backgroundImage: "linear-gradient(to right, #fff, #e7e7e7)",
      minHeight: "1.8rem !important",
      paddingLeft: "0.5rem"
    },
    expansionTitle: {
      margin: "0 .5rem",
      fontSize: "0.7rem",
      fontWeight: 500
    },
    expandButton: {
      width: "0.8rem",
      height: "0.8rem",
      borderRadius: "0.8rem",
      lineHeight: "0.8rem",
      color: "#a6a6a6",
      fontSize: "0.7rem",
      border: "1px solid #a6a6a6",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    },
    toolBar: {
      position: "absolute",
      left: "110px",
      top: "-1.8rem",
      zIndex: 9998
    }
  }),
);

/**
 * ExpansionView Component
 */
export default function ExpansionView(props: {
  sectionId: string,
  title: string,
  isExpanded: boolean,
  subSectionId?: string,
  toolBar?: ToolBarType,
  children: JSX.Element
}) {

  const classes = useStyles();
  const dispatch = useDispatch();

  const { sectionId, title, isExpanded, toolBar, subSectionId, children } = props;
  return (
    <ExpansionPanel
      expanded={isExpanded}
      onChange={(event) => {
        dispatch(onExpandChange({
          sectionId,
          subSectionId,
          expandState: !isExpanded
        }))
      }}>
      <ExpansionPanelSummary className={classes.expansionSummaryRoot}>
        <div className={classes.expansionSummaryHeader}>
          <div className={classes.expandButton}>
            {isExpanded ?

              <FontAwesomeIcon icon={faChevronUp} />
              : <FontAwesomeIcon icon={faChevronDown} />}
          </div>
          <span className={classes.expansionTitle}><b>{title}</b></span>
        </div>
      </ExpansionPanelSummary>
      <div className={classes.toolBar}>
        <ToolBar
          toolBar={toolBar}
          sectionId={sectionId}
        ></ToolBar>
      </div>
      <ExpansionPanelDetails>
        {children || null}
      </ExpansionPanelDetails>
    </ExpansionPanel >
  );
}
