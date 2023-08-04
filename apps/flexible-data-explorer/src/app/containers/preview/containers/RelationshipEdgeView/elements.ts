import styled from 'styled-components';

import { Body, Button } from '@cognite/cogs.js';

export const Link = styled(Button)`
  width: 100%;

  && {
    display: flex;
    justify-content: space-between;
    text-align: left;
    padding-left: 4px;
    padding-right: 4px;
  }
`;

export const RelationshipEdgeContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 25%;
  height: 64px;
  padding: 10px 12px;
  width: 100%;
  border-radius: 8px;
  background: var(--surface-action-muted-default, rgba(83, 88, 127, 0.08));
  cursor: pointer;
  transition: background 0.2s ease-in-out;
  justify-content: center;

  &:hover {
    background: var(--surface-action-muted-hover, rgba(83, 88, 127, 0.12));
  }
`;

export const RelationshipEdgeContent = styled.div`
  display: flex;
  justify-content: space-between;
`;

export const TypeText = styled(Body)`
  color: var(--text-icon-muted, rgba(0, 0, 0, 0.55));
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-transform: capitalize;
`;
