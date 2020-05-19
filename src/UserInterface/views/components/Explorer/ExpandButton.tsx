import React, { useState } from "react";
import IconElement from "./IconElement";
import ExpandClosed from "../../../assets/images/Icons/Checkboxes/ExpandClosed.png";
import ExpandOpen from "../../../assets/images/Icons/Checkboxes/ExpandOpen.png";

export function ExpandButton(props: {
  expandable: boolean;
  expanded: boolean;
  onExpand: (e: any) => void;
  onCollapse: (e: any) => void;
}) {
  const [expanded, setExpanded] = useState(props.expanded);

  const handleClick = function(e: any) {
    if (expanded) {
      props.onCollapse(e);
    } else {
      props.onExpand(e);
    }
    setExpanded(!expanded);
  };
  if (props.expandable) {
    return (
      <div className="expand-btn clickable" onClick={handleClick}>
        {expanded ? (
          <IconElement src={ExpandOpen} alt="click to expand" size="100%" />
        ) : (
          <IconElement src={ExpandClosed} alt="click to expand" size="100%" />
        )}
      </div>
    );
  } else {
    return <div className="expand-btn" />;
  }
}
