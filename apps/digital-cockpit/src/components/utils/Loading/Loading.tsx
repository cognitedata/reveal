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

const Loading = () => {
  return (
    <Wrapper>
      <span>Loading...</span>
    </Wrapper>
  );
};

export default Loading;
