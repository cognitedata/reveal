import styled from 'styled-components/macro';

export const ItemWrapper = styled.div`
  margin: 30px;
  display: flex;
  flex-direction: column;
`;

export const TitleContainer = styled.div`
  display: flex;
  align-items: center;
`;
export const TitleRowFlexEnd = styled.div`
  margin: 0 24px 10px 24px;
  display: flex;
  align-items: center;
  flex-flow: row-reverse;
`;
export const TitleRowFlexStart = styled.div`
  margin: 0 24px 10px 24px;
  display: flex;
  align-items: center;
  flex-flow: row;
`;

export const BLabel = styled.span`
  margin-bottom: 5px;
  font-weight: bold;
  margin-right: 5px;
`;
