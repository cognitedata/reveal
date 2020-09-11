import React from "react";
import "./ExpansionView.module.scss";
import Accordion from "@material-ui/core/Accordion";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import ExpandMoreSharpIcon from "@material-ui/icons/ExpandMoreSharp";
import ExpandLessSharpIcon from "@material-ui/icons/ExpandLessSharp";
import { ToolBar } from "@/UserInterface/Components/ToolBar/ToolBar";
import { BaseCommand } from "@/Core/Commands/BaseCommand";
import withStyles from "@material-ui/core/styles/withStyles";

const StyledAccordion = withStyles({
  root: {
    borderRadius: 0,
    "&$expanded": {
      margin: 0,
    },
  },
})(Accordion);

const StyledAccordionSummary = withStyles({
  expanded: {
    margin: 0,
  },
  content: {
    margin: 0,
    "&$expanded": {
      margin: 0,
    },
  },
})(AccordionSummary);

const StyledAccordionDetails = withStyles({
  root: {
    padding: 0,
    display: "block",
  },
})(AccordionDetails);

export function ExpansionView(props: {
  id: string;
  title: string;
  isExpanded?: boolean;
  onSectionExpand: (id: string, expandStatus: boolean) => void;
  toolBar?: BaseCommand[];
  children: JSX.Element;
}) {
  const { id, title, isExpanded, onSectionExpand, toolBar, children } = props;

  return (
    <div className="expansion-view-root">
      <StyledAccordion
        expanded={isExpanded}
        onChange={() => onSectionExpand(id, !isExpanded)}
      >
        <StyledAccordionSummary className="expand-panel-root">
          <div className="expand-summary-header">
            <div className="expand-header">
              <div className="expand-btn">
                {isExpanded ? <ExpandLessSharpIcon /> : <ExpandMoreSharpIcon />}
              </div>
              <span className="expand-title">
                <b>{title}</b>
              </span>
            </div>
            {isExpanded && (
              <div className="expand-toolbar">
                <ToolBar toolBar={toolBar} sectionId={id} />
              </div>
            )}
          </div>
        </StyledAccordionSummary>
        <StyledAccordionDetails className="expand-panel-content">
          {children || null}
        </StyledAccordionDetails>
      </StyledAccordion>
    </div>
  );
}
