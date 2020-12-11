import React, { useState, KeyboardEvent, MouseEvent } from 'react';
import styled from 'styled-components';
// images
import ExpandOpen from '@images/Expanders/ExpandOpen.png';
import ExpandClosed from '@images/Expanders/ExpandClosed.png';
import ExpandOpenFocus from '@images/Expanders/ExpandOpenFocus.png';
import ExpandClosedFocus from '@images/Expanders/ExpandClosedFocus.png';
import { HTMLUtils } from '@/UserInterface/Foundation/Utils/HTMLUtils';

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
  }
  .expand-btn:focus & {
    background-image: url(${(props /* eslint-disable indent */) =>
      props.expanded ? ExpandOpenFocus : ExpandClosedFocus});
    background-repeat: no-repeat, no-repeat;
  }
`;
const ExpandButtonWrapper = styled.div`
  width: 0.8rem;
  height: 0.8rem;
  line-height: 0.8rem;
  color: #a6a6a6;
  font-size: 0.7rem;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
`;
const ExpandButtonWrapperHoverable = styled(ExpandButtonWrapper)`
  :hover {
    background-image: url(${(props: { expanded: boolean }) =>
      props.expanded ? ExpandOpenFocus : ExpandClosedFocus});
    background-repeat: no-repeat, no-repeat;
    background-position: center;
  }

  :focus {
    background-image: url(${(props) =>
      props.expanded ? ExpandOpenFocus : ExpandClosedFocus});
    background-repeat: no-repeat, no-repeat;
    background-position: center;
  }
`;

interface ExpandButtonProps {
  expandable: boolean;
  expanded?: boolean;
  onExpand: (e: any) => void;
  onCollapse: (e: any) => void;
}

export const ExpandButton = (props: ExpandButtonProps) => {
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
      <ExpandButtonWrapperHoverable
        expanded={props.expanded!}
        onClick={onEvent}
        onKeyUp={onEnter}
      >
        <Expand expanded={props.expanded} />
      </ExpandButtonWrapperHoverable>
    );
  }
  return <ExpandButtonWrapper />;
};
