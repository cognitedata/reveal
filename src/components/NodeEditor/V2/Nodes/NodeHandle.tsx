import { Handle, HandleProps } from 'react-flow-renderer';
import styled from 'styled-components/macro';

const NodeHandle = (props: HandleProps) => {
  return (
    <HandleContainer {...props}>
      <StyledHandle />
    </HandleContainer>
  );
};

const HandleContainer = styled(Handle)`
  background: transparent;
  border: none;
  min-width: 24px;
  min-height: 24px;
  display: flex;
  align-items: center;
  justify-content: ${(props: HandleProps) =>
    props.position === 'right' ? 'flex-end' : 'flex-start'};
  pointer-events: all;
`;

const StyledHandle = styled.div`
  background: white;
  width: 8px;
  height: 8px;
  border: 1px solid var(--cogs-text-hint);
  border-radius: 50%;
  pointer-events: none;

  &:hover {
    border: 2px solid var(--cogs-midblue-5);
  }
`;

export default NodeHandle;
