import { Body, Input } from '@cognite/cogs.js';
import { DataModelTypeDefsType } from '@platypus/platypus-core';
import { useState } from 'react';

import { TypeDescription } from './TypeDescription';
import * as S from './elements';
import { usePublishedRowsCountMapByType } from '../../hooks/usePublishedRowsCountMapByType';

export type TypeListProps = {
  items?: DataModelTypeDefsType[];
  selectedTypeName?: string;
  placeholder?: string;
  onClick: (item: DataModelTypeDefsType) => void;
  dataModelExternalId: string;
};

export const TypeList = ({
  items,
  placeholder,
  onClick,
  selectedTypeName,
  dataModelExternalId,
}: TypeListProps) => {
  const [filter, setFilter] = useState('');

  const { data: publishedRowsCountMap, isLoading } =
    usePublishedRowsCountMapByType({
      dataModelExternalId,
      dataModelTypes: items || [],
    });

  return (
    <S.TypeList data-cy="types-list-panel">
      <S.FilterContainer>
        <Input
          fullWidth
          placeholder={placeholder}
          value={filter}
          data-cy="types-list-filter"
          css={{}}
          onChange={(e) => setFilter(e.target.value)}
        ></Input>
      </S.FilterContainer>
      <S.ItemContainer>
        {items
          ?.filter(({ name }) => name.match(new RegExp(filter, 'gi')))
          ?.map((dataModelType) => (
            <S.Item
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
              <Body
                level={2}
                strong
                className="type-name"
                title={dataModelType.name}
              >
                {dataModelType.name}
              </Body>
              <TypeDescription
                dataModelType={dataModelType}
                publishedRowsCount={
                  publishedRowsCountMap?.[dataModelType.name] || 0
                }
                isLoading={isLoading}
              />
            </S.Item>
          ))}
      </S.ItemContainer>
    </S.TypeList>
  );
};
