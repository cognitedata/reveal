import React, { useState, KeyboardEvent, MouseEvent } from "react";
import styled from "styled-components";
// images
import ExpandOpen from "@images/Expanders/ExpandOpen.png";
import ExpandClosed from "@images/Expanders/ExpandClosed.png";
import ExpandOpenFocus from "@images/Expanders/ExpandOpenFocus.png";
import ExpandClosedFocus from "@images/Expanders/ExpandClosedFocus.png";
import { HTMLUtils } from "@/UserInterface/Foundation/Utils/HTMLUtils";

interface ExpandProps {
  readonly expanded?: boolean;
}

const Expand = styled.div<ExpandProps>`
  height: 0.7em;
  width: 0.7em;
  background-image: ${(props) =>
    props.expanded ? `url(${ExpandOpen})` : `url(${ExpandClosed})`};
  background-repeat: no-repeat, no-repeat;
  background-size: 0.7em 0.7em;
  .expand-btn:hover & {
    background-image: url(${(props /* eslint-disable indent */) =>
      props.expanded ? ExpandOpenFocus : ExpandClosedFocus});
    background-repeat: no-repeat, no-repeat;
  }
  .expand-btn:focus & {
    background-image: url(${(props /* eslint-disable indent */) =>
      props.expanded ? ExpandOpenFocus : ExpandClosedFocus});
    background-repeat: no-repeat, no-repeat;
  }
`;
export function ExpandButton(props: {
  expandable: boolean;
  expanded?: boolean;
  onExpand: (e: any) => void;
  onCollapse: (e: any) => void;
}) {
  const [expanded, setExpanded] = useState(props.expanded || true);

  const onEvent = (e: MouseEvent<HTMLDivElement>) => {
    if (expanded) {
      props.onCollapse(e);
    } else {
      props.onExpand(e);
    }
    setExpanded(!expanded);
  };

  const onEnter = (e: KeyboardEvent) => {
    return HTMLUtils.onEnter(onEvent)(e);
  };

  if (props.expandable) {
    return (
      <div
        role="button"
        aria-label="expand row group"
        className="expand-btn clickable center"
        onClick={onEvent}
        onKeyUp={onEnter}
        tabIndex={0}
      >
        <Expand expanded={props.expanded} />
      </div>
    );
  }
  return <div className="expand-btn" />;
}
