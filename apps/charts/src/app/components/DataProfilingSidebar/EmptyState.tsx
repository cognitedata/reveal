/**
 * Data Profiling Empty State
 */

import styled from 'styled-components/macro';

type Props = {
  text?: string;
};

const EmptyStateDiv = styled.div`
  width: 100%;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--cogs-greyscale-grey1);
`;

const EmptyState = ({ text }: Props) => {
  return (
    <EmptyStateDiv>
      <span>
        <b>{text}</b>
      </span>
    </EmptyStateDiv>
  );
};

export default EmptyState;
