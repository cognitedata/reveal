import { Body, Colors, Elevations, Icon, Title } from '@cognite/cogs.js';
import styled from 'styled-components';

export const Container = styled.div`
  width: 296px;
  background: ${Colors['surface--muted--inverted']};
  border: 1px solid ${Colors['border--muted--inverted']};
  box-shadow: ${Elevations['elevation--overlay']};
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
`;

export const Header = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding-bottom: 4px;
  justify-content: space-between;
`;

export const InnerHeaderWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

export const StyledIcon = styled(Icon)<{ color: string }>`
  color: ${(props) => props.color};
  margin-right: 8px;
  flex-shrink: 0;
`;

export const Label = styled(Title).attrs({
  level: 5,
})`
  color: ${Colors['text-icon--strong--inverted']};
  justify-content: center;
  align-items: center;
  word-break: break-all;
  overflow-wrap: break-word;
`;

export const Description = styled(Body).attrs({
  level: 3,
})`
  color: ${Colors['text-icon--muted--inverted']};
  padding: 4px 0;
`;

export const ButtonsContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

export const ButtonWrapper = styled.div`
  &:not(:last-child) {
    margin-right: 4px;
  }
`;
