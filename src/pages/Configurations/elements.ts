import styled from 'styled-components';

export const ContentContainer = styled.div`
  background-color: var(--cogs-white);
  box-shadow: 0 8px 48px rgba(0, 0, 0, 0.1);
  margin-top: 16px;
`;

export const ContentCard = styled(ContentContainer)`
  border-radius: 16px;
  padding: 24px 32px;
`;

export const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
`;

export const ThreeColsLayout = styled.div`
  display: flex;
  & > div {
    width: calc(100% / 3);
    min-height: 50vh;
  }
`;

export const ConfigurationContainer = styled(ContentCard)`
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  & > header {
    border-bottom: 1px solid var(--cogs-greyscale-grey5);
    padding: 24px 48px;
  }
  & > main {
    padding: 16px 48px;
    flex-grow: 1;
  }
  & > footer {
    padding: 16px 48px;
    display: flex;
    justify-content: center;
  }
`;

export const ConfigurationArrow = styled.div`
  border: 1px solid red;
`;

export const InitialState = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  & > p {
    font-weight: bold;
    color: var(--cogs-greyscale-grey5);
  }
`;
