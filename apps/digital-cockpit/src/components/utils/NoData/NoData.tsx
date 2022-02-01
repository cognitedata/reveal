import { Graphic } from '@cognite/cogs.js';
import styled from 'styled-components';

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 16px 0;
  span {
    color: var(--cogs-greyscale-grey7);
    padding-top: 8px;
  }
`;

export type NoDataProps = {
  type: string;
};

const NoData = ({ type }: NoDataProps) => {
  return (
    <Wrapper>
      <Graphic type={type} />
      <span>No data was found for this request.</span>
    </Wrapper>
  );
};

export default NoData;
