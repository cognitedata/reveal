import styled from 'styled-components';

const HeaderWrapper = styled.div`
  display: inline;
`;

const RightPane = styled.div`
  text-align: right;
  float: right;
  display: inline-block;
`;

const LeftPane = styled.div`
  text-align: left;
  float: left;
  display: inline;
`;
export const HeaderItemsThreeDManagement = ({
  rightItem,
  leftItem,
}: {
  rightItem?: React.ReactElement;
  leftItem?: React.ReactElement;
}) => {
  return (
    <HeaderWrapper>
      <LeftPane>{leftItem && <span>{leftItem}</span>}</LeftPane>
      <RightPane>{rightItem && <span>{rightItem}</span>}</RightPane>
    </HeaderWrapper>
  );
};
