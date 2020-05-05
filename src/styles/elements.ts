import styled from 'styled-components';

type CogniteMarkProps = {
  color: string;
};

export const CogniteMark = styled.div<CogniteMarkProps>`
  width: 32px;
  height: 8px;
  background: ${(props) => props.color};
`;

export const StyledHeading = styled.p`
  font-weight: 600;
  color: #000000;
  margin-top: 6px;
`;

export const Centered = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  height: 100%;
`;
