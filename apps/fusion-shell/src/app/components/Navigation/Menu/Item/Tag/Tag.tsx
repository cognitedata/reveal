import styled from 'styled-components';

import { Tooltip } from '@cognite/cogs.js';

import { Tag as TagType } from '../../../../../../types';

const Tag = ({ title, description, color }: TagType) => (
  <Tooltip interactive content={description}>
    <TagWrapper color={color}>{title}</TagWrapper>
  </Tooltip>
);

const TagWrapper = styled.div`
  margin-left: 10px;
  background-color: ${(props) => props.color || 'var(--cogs-warning)'};
  padding: 2px 5px;
  font-size: 11px;
  border-radius: 3px;
  font-weight: 500;
`;

export default Tag;
