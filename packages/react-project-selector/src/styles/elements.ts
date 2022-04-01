import styled from 'styled-components';

type CogniteMarkProps = {
  color: string;
};

export const CogniteMark = styled.div<CogniteMarkProps>`
  width: 32px;
  height: 8px;
  background: ${(props) => props.color};
`;

export const CenteredOnDesktop = styled.div`
  @media (max-width: 450px) {
    justify-content: flex-start;
  }
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  height: 100%;
`;
