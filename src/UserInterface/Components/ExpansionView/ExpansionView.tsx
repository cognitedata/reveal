import React from "react";
import "./ExpansionView.module.scss";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronUp } from "@fortawesome/free-solid-svg-icons/faChevronUp";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons/faChevronDown";
import ToolBar from "@/UserInterface/Components/ToolBar/ToolBar";
import { ToolBarType } from "@/UserInterface/Components/Settings/Types";

export default function ExpansionView(props: {
  id: string;
  title: string;
  isExpanded: boolean;
  onExpandChange: (id: string, expandStatus: boolean) => void;
  toolBar?: ToolBarType;
  children: JSX.Element;
}) {
  const { id, title, isExpanded, onExpandChange, toolBar, children } = props;

  return (
    <ExpansionPanel
      expanded={isExpanded}
      onChange={(event) => onExpandChange(id, !isExpanded)}
    >
      <ExpansionPanelSummary className="expand-panel-root">
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
      </ExpansionPanelSummary>
      <div className="expand-toolbar">
        <ToolBar toolBar={toolBar} sectionId={id} />
      </div>
      <ExpansionPanelDetails>{children || null}</ExpansionPanelDetails>
    </ExpansionPanel>
  );
}
