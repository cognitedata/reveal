import styled from 'styled-components';
import { Colors } from '@cognite/cogs.js';

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

export const CardContainer = styled.div`
  background: #fff;
  padding: 40px 32px;
  border-radius: 4px;
  box-sizing: border-box;
  box-shadow: 0px 16.8443px 50.5328px rgba(0, 0, 0, 0.1),
    0px 13.4754px 20.2131px rgba(0, 0, 0, 0.07);

  .content {
    margin-top: 60px;
  }

  button {
    width: 100%;
    height: 48px;
  }

  button[type='submit'] {
    background: ${Colors['midblue-3']};
    border-radius: 4px;
  }
`;

export const Centered = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  height: 100%;
`;
