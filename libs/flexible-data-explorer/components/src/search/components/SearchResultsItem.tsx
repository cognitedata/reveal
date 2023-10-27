import React, { ReactNode, useMemo, useState } from 'react';

import styled from 'styled-components';

import { flattenProperties } from '@fdx/shared/utils/properties';

import { Title, IconType, Heading } from '@cognite/cogs.js';

import { CategoryChip } from '../../chips/CategoryChip';
import { Typography } from '../../Typography';

interface Props {
  icon?: IconType;
  name: string;
  description?: string;
  properties?: { key?: string; value?: any }[];
  onClick?: () => void;
  selected?: boolean;
  customHoverButton?: ReactNode;
}

const MAX_PROPERTIES = 3;

export const SearchResultsItem: React.FC<Props> = ({
  icon,
  name,
  description,
  properties,
  onClick,
  selected,
  customHoverButton,
}) => {
  const [isHoverButtonVisible, setIsHoverButtonVisible] = useState(false);

  const normalizedProperties = useMemo(() => {
    // Some of the properties may be time series charts etc, so we need to filter out those
    const propertiesWithKey = properties?.filter(({ key }) => !!key);

    // First limit number of properties, mainly a guide to prevent the UI from breaking
    const cappedProperties = (propertiesWithKey || []).reduce(
      (acc, { key, value }) => {
        if (acc.length >= MAX_PROPERTIES) {
          return acc;
        }

        return [...acc, { key, value }];
      },
      [] as { key?: string; value?: any }[]
    );

    // Convert to object to be able to use flattenProperties function
    const propertiesObject: { [key: string]: unknown } = {};
    cappedProperties?.forEach(({ key, value }) => {
      propertiesObject[key!] = value;
    });

    // Return back list of objects { key, value } object
    return flattenProperties(propertiesObject).map(({ key, value }) => ({
      key,
      value,
    }));
  }, [properties]);

  return (
    <Container
      role="button"
      tabIndex={0}
      onClick={onClick}
      selected={selected}
      onPointerEnter={() =>
        !isHoverButtonVisible && setIsHoverButtonVisible(true)
      }
      onPointerLeave={() =>
        isHoverButtonVisible && setIsHoverButtonVisible(false)
      }
    >
      {icon && <CategoryChip icon={icon} />}

      <TitleContent>
        <NameText>{name}</NameText>
        <DescriptionText>{description}</DescriptionText>
      </TitleContent>

      <PropertiesContainer>
        {normalizedProperties.map(({ key, value }, index) => (
          <PropertiesContent key={key || index}>
            <KeyText>{key}</KeyText>
            <ValueText>{value}</ValueText>
          </PropertiesContent>
        ))}
      </PropertiesContainer>
      {isHoverButtonVisible && customHoverButton && (
        <HoverButtonBackground>{customHoverButton}</HoverButtonBackground>
      )}
    </Container>
  );
};

const HoverButtonBackground = styled.div`
  position: absolute;
  right: 8px;
  top: 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 56px;
  width: 133px;
  background: linear-gradient(
    270deg,
    #f2f2f5 83.39%,
    rgba(242, 242, 245, 0) 100%
  );
`;

const Container = styled.div<{ selected?: boolean }>`
  min-height: 76px;
  background: ${({ selected }) =>
    selected
      ? 'var(--cogs-themed-surface--interactive--toggled-default)'
      : 'white'};
  color: ${({ selected }) =>
    selected
      ? 'var(--cogs-themed-text-icon--interactive--default)'
      : 'var(--cogs-themed-text-icon--strong)'};
  padding: 16px;
  position: relative;
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 8px;
  /* margin-bottom: 8px; */
  /* border-bottom: 1px solid #ebeef7; */

  &:hover {
    background: var(--surface-interactive-hover, rgba(34, 42, 83, 0.06));
  }
`;

const TitleContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 50%;
  width: 100%;
`;

const PropertiesContainer = styled.div`
  flex: 1;
  display: flex;
  max-width: 50%;
  width: 100%;
  height: 100%;
  justify-content: space-between;
  align-items: flex-start;
  word-break: break-all;
`;
const PropertiesContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-right: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const NameText = styled(Title).attrs({ level: 6 })`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const DescriptionText = styled(Typography.Body).attrs({
  level: 6,
  fallback: '',
})``;

const KeyText = styled(Typography.Body).attrs({ size: 'xsmall', muted: true })`
  text-transform: capitalize;
`;

const ValueText = styled(Heading).attrs({ level: 6 })`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
`;
