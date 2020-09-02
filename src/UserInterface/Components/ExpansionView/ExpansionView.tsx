import React from "react";
import "./ExpansionView.module.scss";
import Accordion from "@material-ui/core/Accordion";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import ExpandMoreSharpIcon from "@material-ui/icons/ExpandMoreSharp";
import ExpandLessSharpIcon from "@material-ui/icons/ExpandLessSharp";
import ToolBar from "@/UserInterface/Components/ToolBar/ToolBar";
import { BaseCommand } from "@/Core/Commands/BaseCommand";

export default function ExpansionView(props: {
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
      <Accordion
        expanded={isExpanded}
        onChange={() => onSectionExpand(id, !isExpanded)}
      >
        <AccordionSummary className="expand-panel-root">
          <div className="expand-summary-header">
            <div className="expand-btn">
              {isExpanded ? <ExpandLessSharpIcon /> : <ExpandMoreSharpIcon />}
            </div>
            <span className="expand-title">
              <b>{title}</b>
            </span>
          </div>
        </AccordionSummary>
        <AccordionDetails>{children || null}</AccordionDetails>
        <div className="expand-toolbar">
          <ToolBar toolBar={toolBar} sectionId={id} />
        </div>
      </Accordion>
    </div>
  );
}
