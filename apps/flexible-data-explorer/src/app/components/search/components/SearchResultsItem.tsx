import React from 'react';

import styled from 'styled-components';

import { Body, Title } from '@cognite/cogs.js';

interface Props {
  name: string;
  description?: string;
  properties?: { key?: string; value?: any }[];
  onClick?: () => void;
}

const MAX_PROPERTIES = 3;

export const SearchResultsItem: React.FC<Props> = ({
  name,
  description,
  properties,
  onClick,
}) => {
  // Mainly a guide to prevent the UI from breaking
  const normalizedProperties = (properties || []).reduce(
    (acc, { key, value }) => {
      if (acc.length >= MAX_PROPERTIES) {
        return acc;
      }

      return [...acc, { key, value }];
    },
    [] as { key?: string; value?: any }[]
  );

  return (
    <Container role="button" onClick={onClick}>
      <TitleContent>
        <NameText>{name}</NameText>
        <DescriptionText>{description}</DescriptionText>
      </TitleContent>

      <PropertiesContainer>
        {normalizedProperties.map(({ key, value }, index) => (
          <PropertiesContent key={key || index}>
            <Body level={4} strong>
              {key}
            </Body>
            <Body>{value}</Body>
          </PropertiesContent>
        ))}
      </PropertiesContainer>
    </Container>
  );
};

const Container = styled.div`
  min-height: 40px;
  background: white;
  padding: 16px;
  display: flex;
  align-items: center;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 8px;
  box-shadow: 0px 1px 8px rgba(79, 82, 104, 0.06),
    0px 1px 1px rgba(79, 82, 104, 0.1);

  transition: background 2s ease;

  &:hover {
    background: linear-gradient(
        0deg,
        rgba(59, 130, 246, 0.1),
        rgba(59, 130, 246, 0.1)
      ),
      rgba(255, 255, 255, 0.8);
  }
`;

const TitleContent = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 50%;
  width: 100%;
`;

const PropertiesContainer = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: space-evenly;
  align-items: center;
  overflow: auto;
`;
const PropertiesContent = styled.div``;

const NameText = styled(Title).attrs({ level: 6 })`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const DescriptionText = styled(Body).attrs({ level: 6 })``;
