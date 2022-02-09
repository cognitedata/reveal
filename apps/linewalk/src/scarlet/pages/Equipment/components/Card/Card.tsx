import { useDataElementConfig } from 'scarlet/hooks';
import { DataElement } from 'scarlet/types';

import { CardHeader, DataSourceList } from '..';

import * as Styled from './style';

type CardProps = {
  dataElement: DataElement;
};

export const Card = ({ dataElement }: CardProps) => {
  const dataElementConfig = useDataElementConfig(dataElement);

  return (
    <Styled.Container>
      <CardHeader dataElement={dataElement} />
      <Styled.CategoryWrapper>
        <div className="cogs-body-1">{dataElementConfig?.label}</div>
        <div className="cogs-micro">Equipment</div>
      </Styled.CategoryWrapper>
      <Styled.Delimiter />
      <DataSourceList dataElement={dataElement} />
    </Styled.Container>
  );
};
