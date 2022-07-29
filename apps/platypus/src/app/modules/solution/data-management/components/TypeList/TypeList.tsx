import { Input, Title } from '@cognite/cogs.js';
import { DataModelTypeDefsType } from '@platypus/platypus-core';
import { useState } from 'react';
import styled from 'styled-components/macro';

export type TypeListProps = {
  items?: DataModelTypeDefsType[];
  selectedTypeName?: string;
  placeholder?: string;
  onClick: (item: DataModelTypeDefsType) => void;
};

export const TypeList = ({
  items,
  placeholder,
  onClick,
  selectedTypeName,
}: TypeListProps) => {
  const [filter, setFilter] = useState('');

  return (
    <StyledTypeList data-cy="types-list-panel">
      <StyledFilterContainer>
        <Input
          fullWidth
          placeholder={placeholder}
          value={filter}
          data-cy="types-list-filter"
          css={{}}
          onChange={(e) => setFilter(e.target.value)}
        ></Input>
      </StyledFilterContainer>
      <StyledItemContainer>
        {items
          ?.filter(({ name }) => name.match(new RegExp(filter, 'gi')))
          ?.map((dataModelType) => (
            <StyledItem
              key={dataModelType.name}
              data-cy="types-list-item"
              data-testid={dataModelType.name}
              className={
                selectedTypeName === dataModelType.name ? 'active' : ''
              }
              onClick={() => {
                onClick(dataModelType);
              }}
            >
              <Title level={5} className="type-name" title={dataModelType.name}>
                {dataModelType.name}
              </Title>
              <Description>{dataModelType.description}</Description>
            </StyledItem>
          ))}
      </StyledItemContainer>
    </StyledTypeList>
  );
};

const StyledTypeList = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
`;

const StyledFilterContainer = styled.div`
  height: 56px;
  padding: 16px;
`;

const StyledItemContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 10px;
`;

const StyledItem = styled.div`
  display: block;
  overflow: hidden;
  min-height: 54px;
  width: 100%;
  padding: 8px 12px;
  margin-bottom: 8px;
  transition: background-color 0.2s ease-in-out;
  border-radius: 6px;
  cursor: pointer;

  &:hover {
    background: var(--cogs-surface--interactive--toggled-hover);
  }
  &:active {
    background: var(--cogs-surface--interactive--toggled-pressed);
  }
  &.active {
    background: var(--cogs-surface--interactive--toggled-default);
  }

  .type-name {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    color: var(--cogs-text-primary);
  }
`;

const Description = styled.p`
  font-size: 13px;
  line-height: 18px;
  font-weight: 400;
  color: rgba(0, 0, 0, 0.45);
`;
