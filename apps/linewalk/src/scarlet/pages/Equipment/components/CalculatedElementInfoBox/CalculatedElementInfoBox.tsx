import { v4 as uuid } from 'uuid';
import { useMemo } from 'react';
import { useAppState } from 'scarlet/hooks';
import { DataElement, DataElementOrigin } from 'scarlet/types';
import {
  getDataElementConfigByKey,
  getDataElementTypeLabelByOrigin,
  getFormulaFields,
} from 'scarlet/utils';
import capitalize from 'lodash/capitalize';

import * as Styled from './style';

type CalculatedElementInfoBoxProps = {
  dataElement: DataElement;
};

export const CalculatedElementInfoBox = ({
  dataElement,
}: CalculatedElementInfoBoxProps) => {
  const { equipmentConfig, equipment } = useAppState();
  const component = useMemo(
    () =>
      dataElement.componentId
        ? equipment.data?.components.find(
            (c) => c.id === dataElement.componentId
          )
        : undefined,
    [equipment.data]
  );

  const formulaArguments = useMemo(() => {
    const formulaArguments = getFormulaFields(
      dataElement.config.formula,
      component?.type
    )
      .filter(
        (item, i, self) =>
          i ===
          self.findIndex(
            (searchItem) =>
              searchItem.field === item.field &&
              searchItem.componentType === item.componentType
          )
      )
      .map((item) => {
        const origin = item.componentType
          ? DataElementOrigin.COMPONENT
          : DataElementOrigin.EQUIPMENT;
        const originLabel = item.componentType
          ? capitalize(item.componentType)
          : getDataElementTypeLabelByOrigin(origin);

        return {
          id: uuid(),
          dataElementLabel: getDataElementConfigByKey(
            equipmentConfig.data!,
            item.field,
            origin
          )?.label,
          originLabel,
        };
      });

    return formulaArguments;
  }, [dataElement, equipmentConfig]);

  if (!formulaArguments?.length) return null;

  return (
    <Styled.Container>
      <Styled.Tag className="cogs-micro">CALC</Styled.Tag>
      <Styled.Copy className="cogs-detail">
        This is a calculated field. <br />
        The value for this field is derived from the following fields:
      </Styled.Copy>
      <Styled.Fields>
        <Styled.FieldsRow className="cogs-micro" header>
          <Styled.FieldName>Field name</Styled.FieldName>
          <Styled.FieldLevel>Field level</Styled.FieldLevel>
        </Styled.FieldsRow>
        {formulaArguments.map((formulaArgument) => (
          <Styled.FieldsRow
            key={formulaArgument.id}
            className="cogs-detail strong"
          >
            <Styled.FieldName>
              {formulaArgument.dataElementLabel}
            </Styled.FieldName>
            <Styled.FieldLevel>{formulaArgument.originLabel}</Styled.FieldLevel>
          </Styled.FieldsRow>
        ))}
      </Styled.Fields>
    </Styled.Container>
  );
};
