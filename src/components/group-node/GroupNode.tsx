import { Colors } from '@cognite/cogs.js';
import { NodeProps } from 'reactflow';
import styled from 'styled-components';

export const GroupNode = ({ selected }: NodeProps): JSX.Element => {
  return (
    <Container
      className={selected ? 'workflow-builder-node-selected' : undefined}
    >
      &nbsp;
    </Container>
  );
};

const Container = styled.div`
  background-color: ${Colors['surface--status-neutral--muted--default--alt']};
  border: 1px solid ${Colors['border--status-neutral--muted']};
  border-radius: 2px;
  width: 100%;
  height: 100%;

  &.workflow-builder-node-selected {
    background-color: ${Colors['surface--status-neutral--muted--default']};
    border-color: ${Colors['border--status-neutral--strong']};
  }
`;
