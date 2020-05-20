import React, { useState } from "react";
import IconElement from "./IconElement";
import { IconTypes } from "../../../constants/Icons";
import getIcon from "../../../utils/Icon";

const ExpandClosed = getIcon(IconTypes.EXPANDERS, "ExpandClosed");
const ExpandOpen = getIcon(IconTypes.EXPANDERS, "ExpandOpen");

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
