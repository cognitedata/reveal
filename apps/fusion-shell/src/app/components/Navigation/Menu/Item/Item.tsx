import { CSSProperties } from 'react';

import styled from 'styled-components';

import { Body, Colors, Icon } from '@cognite/cogs.js';

import theme from '../../../../styles/theme';
import { AppItem, Tag as TagType } from '../../../../types';

import ItemLink from './ItemLink';
import Tag from './Tag';

export interface ItemProps {
  item: AppItem;
  onClose?: (destination: string) => void;
  tag: TagType | undefined;
  isCompact?: boolean;
}

const Item = (props: ItemProps) => {
  const { item, tag, isCompact = false } = props;

  const { icon, title, subtitle = '', onClick } = item;

  const itemContent = (
    <LinkContainer onClick={onClick} isCompact={isCompact}>
      <ItemIcon className="icon" isCompact={isCompact}>
        <Icon type={icon} />
      </ItemIcon>
      <Info isCompact={isCompact}>
        <TitleWrapper>
          <Body level={2} strong>
            {title}
          </Body>
          {tag && !isCompact && (
            <Tag
              title={tag.title}
              description={tag.description}
              color={tag.color}
            />
          )}
        </TitleWrapper>
        {subtitle && !isCompact && (
          <StyledSubTitle level={2}>{subtitle}</StyledSubTitle>
        )}
      </Info>
    </LinkContainer>
  );

  return <ItemLink {...props}>{itemContent}</ItemLink>;
};

const StyledSubTitle = styled(Body)`
  &&& {
    color: ${Colors['text-icon--medium']};
  }
`;

const Container = styled.div`
  display: flex;
  align-items: center;
  padding: 8px;
  color: ${theme.textColor};
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
`;

const LinkContainer = styled(Container).attrs(
  ({ isCompact }: { isCompact: boolean }) => {
    const style: CSSProperties = {
      ...(isCompact
        ? {
            flexWrap: 'wrap',
            width: '224px',
            flex: '0 1 50%',
            alignItems: 'flex-start',
            padding: '8px',
            margin: '0 -8px',
          }
        : { padding: '8px' }),
    };
    return { style };
  }
)<{ isCompact: boolean }>`
  align-items: flex-start;
  box-sizing: border-box;
  display: flex;
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
`;

const ItemIcon = styled.div<{ isCompact?: boolean }>`
  font-size: ${({ isCompact }) => (isCompact ? 12 : 20)}px;
  background-color: ${(props) => props.color};
  flex: 0 0 ${({ isCompact }) => (isCompact ? 24 : 48)}px;
  height: ${({ isCompact }) => (isCompact ? 24 : 48)}px;
  margin-right: ${({ isCompact }) => (isCompact ? 8 : 0)}px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
`;

const Info = styled.div<{ isCompact: boolean }>`
  margin-left: ${({ isCompact }) => (isCompact ? 0 : 12)}px;
  margin-top: ${({ isCompact }) => (isCompact ? 1 : 0)}px;
  flex: 1 1 0;
  font-size: 14px;
`;

const TitleWrapper = styled.div`
  align-items: center;
  color: ${Colors['text-icon--medium']};
  display: flex;
`;

export default Item;
