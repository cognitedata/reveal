import { ComponentProps } from 'react';
import styled from 'styled-components/macro';
import ActionBar from './ActionBar/ActionBar';
import { NodeWrapper } from './elements';

type NodeWithActionBarProps = ComponentProps<typeof ActionBar> & {
  isActionBarVisible: boolean;
  children: React.ReactNode;
};

const NodeWithActionBar = ({
  isActionBarVisible,
  children,
  ...props
}: NodeWithActionBarProps) => (
  <>
    {isActionBarVisible && (
      <ActionContainer>
        <ActionBar {...props} />
      </ActionContainer>
    )}
    {children}
  </>
);

const ActionContainer = styled(NodeWrapper)`
  &&& {
    width: fit-content;
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 0;
    position: absolute;
    top: -40px;
  }
`;

export default NodeWithActionBar;
