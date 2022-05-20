import styled from 'styled-components';

export const UserAccessContainer = styled.div`
  padding-top: 32px;
  .rc-collapse-content-box > div {
    margin: 10px;
  }
  cursor: default;
`;

const IconParagraph = styled.div`
  display: flex;
  align-items: center;

  div {
    padding-left: 5px;
  }
`;

export const ErrorList = styled(IconParagraph)`
  padding-left: 15px;
  padding-bottom: 5px;
  flex-direction: column;
  align-items: start;
`;
export const GoodParagraph = styled(IconParagraph)``;
export const ErrorParagraph = styled(IconParagraph)``;
