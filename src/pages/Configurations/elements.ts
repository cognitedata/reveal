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

export const Configuration = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
`;

export const System = styled.div`
  background-color: var(--cogs-white);
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  min-height: 468px;
`;

export const SystemConfiguration = styled(Configuration)`
  flex-direction: column;
  justify-content: flex-start;
  padding: 16px;
  & p {
    text-align: center;
    color: var(--cogs-greyscale-grey5);
    font-weight: bold;
  }
`;

export const Source = styled(System)``;

export const Target = styled(System)``;

export const SystemHeader = styled(Header)`
  margin-bottom: unset;
  padding: 16px 32px;
  border-bottom: 1px solid var(--cogs-greyscale-grey4);
`;

export const Arrow = styled.div`
  padding: 40px;
  display: flex;
  justify-content: center;
  width: max(296px, 50px);
  & svg {
    width: 100%;
    stroke: var(--cogs-greyscale-grey4);
  }
`;
