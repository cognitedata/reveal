import React from 'react';
import { useDispatch } from "react-redux";
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons';

import { onExpandChange } from "../../../store/actions/settings"

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
      backgroundImage: "linear-gradient(to right, #f4f4f4, #d6d6d6)",
      minHeight: "1.8rem !important",
      paddingLeft: "0.2rem"
    },
    expansionTitle: {
      marginLeft: ".5rem",
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
    }
  }),
);

export default function ExpansionView(props)
{
  const classes = useStyles();
  const dispatch = useDispatch();

  const { subIndex, mainId, title, isExpanded, children, iconIndex } = props;
  return (
    <ExpansionPanel expanded={isExpanded} onChange={(event) =>
    {
      dispatch(onExpandChange({ mainId, subIndex, iconIndex }))
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
      <ExpansionPanelDetails>
        {children || null}
      </ExpansionPanelDetails>
    </ExpansionPanel >
  );
}