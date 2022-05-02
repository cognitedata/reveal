import React from 'react';

import styled from 'styled-components/macro';

import { MiddleEllipsis } from 'components/MiddleEllipsis/MiddleEllipsis';
import Skeleton from 'components/Skeleton';
import {
  FlexColumn,
  FlexRow,
  FlexGrow,
  FlexAlignEnd,
  PagePaddingWrapper,
  sizes,
} from 'styles/layout';

const TopWrapper = styled(PagePaddingWrapper)`
  padding-top: ${sizes.large};
  background: var(--cogs-white);
  border-bottom: 1px solid var(--cogs-greyscale-grey4);
`;

const HeaderTitle = styled.div`
  user-select: none;
  font-size: 24px;
  font-weight: bold;
  line-height: 36px;
  margin-bottom: 12px;
  max-width: 98%;
`;

const HeaderDescriptionText = styled(FlexRow)`
  user-select: none;
  font-size: 16px;
  line-height: 24px;
  max-width: 600px;
`;

const LeftContainer = styled.div`
  position: relative;
  margin-right: 12px;
`;

const BottomMargin = styled.div`
  margin-bottom: ${sizes.large};
`;

interface Props {
  title: string;
  description?: string;
  Right?: () => JSX.Element | null;
  Left?: () => JSX.Element | null;
  Bottom?: React.FC;
  isLoading?: boolean;
}
const Header: React.FC<Props> = ({
  title,
  description,
  Right,
  Left,
  Bottom,
  isLoading,
}) => {
  return (
    <TopWrapper>
      <FlexRow>
        {Left && (
          <LeftContainer>
            <Left />
          </LeftContainer>
        )}
        <FlexGrow as={FlexColumn}>
          <HeaderTitle>
            {isLoading ? (
              <Skeleton.Text isLastLine />
            ) : (
              <MiddleEllipsis value={title} />
            )}
          </HeaderTitle>
          <FlexRow>
            <FlexGrow as={FlexRow}>
              <HeaderDescriptionText>{description}</HeaderDescriptionText>
              {isLoading && <Skeleton.Text isOnlyLine />}
            </FlexGrow>
            {Right && (
              <FlexAlignEnd>
                <Right />
              </FlexAlignEnd>
            )}
          </FlexRow>
          {Bottom ? <Bottom /> : <BottomMargin />}
        </FlexGrow>
      </FlexRow>
    </TopWrapper>
  );
};

export default Header;
