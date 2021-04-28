import React from 'react';
import { Icon } from '@cognite/cogs.js';
import styled from 'styled-components';

export const INFO_BTN_CLASSNAME = 'tree-view-info-btn';

const InfoIcon = styled(Icon)`
  color: rgb(223, 226, 229);
  cursor: pointer;
  display: inline-block;

  /* extend click area a bit */
  position: relative;
  &:after {
    content: ' ';
    position: absolute;
    top: -25%;
    left: -25%;
    height: 150%;
    width: 150%;
  }

  svg {
    width: unset;
    height: unset;
    margin-bottom: -2px;
  }

  &:hover {
    color: rgba(24, 144, 255, 0.9);
  }
`;

type Props = {
  name: string;
};
export function NodeWithInfoButton({ name }: Props) {
  return (
    <div>
      {name}&nbsp;
      <InfoIcon className={INFO_BTN_CLASSNAME} type="Info" />
    </div>
  );
}
