import { Button } from '@cognite/cogs.js';
import { DataElementOrigin, DataPanelActionType, Detection } from 'types';
import { useDataPanelDispatch, useDetectionOrigin } from 'hooks';
import { useCallback } from 'react';

import * as Styled from './style';

type DataSourceOriginProps = {
  detection: Detection;
};

export const DataSourceOrigin = ({ detection }: DataSourceOriginProps) => {
  const dataPanelDispatch = useDataPanelDispatch();
  const { dataElementOrigin } = useDetectionOrigin(detection);

  const openDataElementCard = useCallback(() => {
    dataPanelDispatch({
      type: DataPanelActionType.OPEN_DATA_ELEMENT,
      dataElement: dataElementOrigin!,
    });
  }, [dataElementOrigin]);

  const tag =
    dataElementOrigin?.origin === DataElementOrigin.EQUIPMENT
      ? 'Equip'
      : 'Comp';

  return dataElementOrigin ? (
    <Styled.Container>
      <Styled.Content>
        <Styled.Title className="cogs-micro strong">Source field</Styled.Title>
        <Styled.Origin>
          <Styled.Tag className="cogs-micro">{tag}</Styled.Tag>
          <Styled.Label className="cogs-body-2">
            {dataElementOrigin.config.label || dataElementOrigin?.key}
          </Styled.Label>
        </Styled.Origin>
      </Styled.Content>
      <Button
        htmlType="button"
        type="tertiary"
        size="small"
        onClick={openDataElementCard}
      >
        View
      </Button>
    </Styled.Container>
  ) : null;
};
