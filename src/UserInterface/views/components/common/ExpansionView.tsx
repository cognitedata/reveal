import React from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    expansionSummaryRoot: {
      padding: "0 !important",
      minHeight: "1.8rem !important"
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
      fontSize: "1rem",
      fontWeight: 500
    },
    expandButton: {
      width: "20px",
      height: "20px",
      borderRadius: "20px",
      lineHeight: "20px",
      color: "#a6a6a6",
      fontWeight: 700,
      fontSize: "0.7rem",
      border: "2px solid #a6a6a6",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }),
);

export default function ExpansionView(props: { children?: JSX.Element, title: string })
{
  const classes = useStyles();
  const [expanded, setExpanded] = React.useState<boolean>(false);
  const { title, children } = props;
  const handleChange = (isExpanded: boolean) =>
  {
    setExpanded(isExpanded);
  };

  return (
    <ExpansionPanel expanded={expanded} onChange={(event) => handleChange(!expanded)}>
      <ExpansionPanelSummary className={classes.expansionSummaryRoot}>
        <div className={classes.expansionSummaryHeader}>
          <div className={classes.expandButton}>
            {expanded ?

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