import { useState } from 'react';

import { DataModelTypeDefsType } from '@platypus/platypus-core';

import { Body, Input } from '@cognite/cogs.js';

import { useDMContext } from '../../../../../context/DMContext';
import { isEdgeType } from '../../utils';

import * as S from './elements';
import { TypeDescription } from './TypeDescription';

export type TypeListProps = {
  onClick: (item: DataModelTypeDefsType) => void;
};

export const TypeList = ({ onClick }: TypeListProps) => {
  const { typeDefs, selectedDataType: dataType } = useDMContext();
  const [filter, setFilter] = useState('');

  return (
    <S.TypeList data-cy="types-list-panel">
      <S.FilterContainer>
        <Input
          fullWidth
          placeholder="Filter"
          value={filter}
          data-cy="types-list-filter"
          css={{}}
          onChange={(e) => setFilter(e.target.value)}
        ></Input>
      </S.FilterContainer>
      <S.ItemContainer>
        {typeDefs.types
          // we dont support edge types
          ?.filter((type) => !isEdgeType(type))
          ?.filter(({ name }) => name.match(new RegExp(filter, 'gi')))
          ?.map((dataModelType) => (
            <S.Item
              key={dataModelType.name}
              data-cy="types-list-item"
              data-testid={dataModelType.name}
              className={dataType?.name === dataModelType.name ? 'active' : ''}
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
              <TypeDescription dataModelType={dataModelType} />
            </S.Item>
          ))}
      </S.ItemContainer>
    </S.TypeList>
  );
};
