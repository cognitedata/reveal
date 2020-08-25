import React from "react";
import "./ExpansionView.module.scss";
import Accordion from "@material-ui/core/Accordion";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronUp } from "@fortawesome/free-solid-svg-icons/faChevronUp";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons/faChevronDown";
import ToolBar from "@/UserInterface/Components/ToolBar/ToolBar";
import { ToolBarType } from "@/UserInterface/Components/Settings/Types";

export default function ExpansionView(props: {
  id: string;
  title: string;
  isExpanded?: boolean;
  onSectionExpand: (id: string, expandStatus: boolean) => void;
  toolBar?: ToolBarType;
  children: JSX.Element;
}) {
  const { id, title, isExpanded, onSectionExpand, toolBar, children } = props;

  return (
    <Accordion
      expanded={isExpanded}
      onChange={() => onSectionExpand(id, !isExpanded)}
    >
      <AccordionSummary className="expand-panel-root">
        <div className="expand-summary-header">
          <div className="expand-btn">
            {isExpanded ? (
              <FontAwesomeIcon icon={faChevronUp} />
            ) : (
              <FontAwesomeIcon icon={faChevronDown} />
            )}
          </div>
          <span className="expand-title">
            <b>{title}</b>
          </span>
        </div>
      </AccordionSummary>
      <div className="expand-toolbar">
        <ToolBar toolBar={toolBar} sectionId={id} />
      </div>
      <AccordionDetails>{children || null}</AccordionDetails>
    </Accordion>
  );
}
