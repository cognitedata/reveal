import React from 'react';
import { Icon } from '@cognite/cogs.js';
import styled from 'styled-components';

export const INFO_BTN_CLASSNAME = 'tree-view-info-btn';

const Node = styled.div`
  .${INFO_BTN_CLASSNAME} {
    color: rgb(223, 226, 229);
    cursor: pointer;

    /* extend click area a bit */
    padding: 4px;
    margin: -4px;

    svg {
      margin-bottom: -2px;
    }

    &:hover {
      color: rgba(24, 144, 255, 0.9);
    }
  }
`;

type Props = {
  name: string;
};
export function NodeWithInfoButton({ name }: Props) {
  return (
    <Node>
      {name}&nbsp;
      <Icon className={INFO_BTN_CLASSNAME} type="Info" />
    </Node>
  );
}
