import { useMemo } from 'react';

import { Input, OptionType, SegmentedControl, Select } from '@cognite/cogs.js';

import { EditableChip } from '../../../../../components/EditableChip';
import { getContainer } from '../../../../../GlobalStyles';
import { useDataSets } from '../../../../../hooks/useDataSets';
import { useTranslation } from '../../../../../hooks/useTranslation';

import { Column, Label, Row } from './elements';

type Option = OptionType<any>;
export enum TransformationType {
  Data = 'Data',
  RelationShip = 'RelationShip',
}

export interface CreateTransformationFormProps {
  id: string;
  name: string;
  onRelationshipChange?: (relationship: Option | undefined) => void;
  onTransformationTypeChange: (value: TransformationType) => void;
  relationships?: Option[];
  selectedRelationship?: Option;
  selectedDataSet?: number;
  onDataSetChange?: (dataSet?: number) => void;
  transformationType: TransformationType;
}

export const CreateTransformationForm = (
  props: CreateTransformationFormProps
) => {
  const { t } = useTranslation('CreateTransformationForm');
  const { data: dataSets = [] } = useDataSets();

  const dataSetsOptions = useMemo(() => {
    return dataSets.map((el) => ({
      value: el.id,
      label: el.name || el.externalId || `${el.id}`,
    }));
  }, [dataSets]);

  return (
    <>
      <Row>
        <Column>
          <Label htmlFor="nameInput">
            {t(
              'create_transformation_modal_transformation_name_label',
              'Transformation name'
            )}
          </Label>
          <Input
            id="nameInput"
            type="text"
            disabled
            value={props.name}
            fullWidth
          ></Input>
        </Column>
        <Column>
          <EditableChip
            className="transformation-id"
            onChange={() => {
              return true;
            }}
            value={props.id}
            isLocked
          ></EditableChip>
        </Column>
      </Row>
      <Row>
        <Column>
          <Label htmlFor="nameInput">
            {t(
              'create_transformation_modal_data_set_label',
              'Data set (optional)'
            )}
          </Label>
          <Select
            menuPortalTarget={getContainer()}
            value={dataSetsOptions.find(
              (el) => el.value === props.selectedDataSet
            )}
            options={dataSetsOptions}
            onChange={(val?: { value: number }) =>
              props.onDataSetChange?.(val?.value)
            }
          />
        </Column>
      </Row>

      {props.relationships && props.relationships.length > 0 && (
        <Row style={{ marginBottom: 120 }}>
          <Column>
            <Label>
              {t(
                'create_transformation_modal_transformation_type_label',
                'Transformation type'
              )}
            </Label>
            <SegmentedControl
              fullWidth
              currentKey={props.transformationType}
              onButtonClicked={(value) =>
                props.onTransformationTypeChange(value as TransformationType)
              }
            >
              <SegmentedControl.Button key={TransformationType.Data}>
                {t('create_transformation_modal_load_data_button', 'Load data')}
              </SegmentedControl.Button>
              <SegmentedControl.Button key={TransformationType.RelationShip}>
                {t(
                  'create_transformation_modal_load_relationship_button',
                  'Load relationship'
                )}
              </SegmentedControl.Button>
            </SegmentedControl>
          </Column>
          <Column>
            {props.transformationType === TransformationType.RelationShip && (
              <>
                <Label>
                  {t(
                    'create_transformation_modal_relationship_label',
                    'Relationship'
                  )}
                </Label>
                <Select
                  menuPortalTarget={getContainer()}
                  value={props.selectedRelationship}
                  options={props.relationships}
                  onChange={props.onRelationshipChange}
                  placeholderElement={
                    <span>
                      {t(
                        'create_transformation_modal_relationshispan_placeholder',
                        'Select relationship'
                      )}
                    </span>
                  }
                />
              </>
            )}
          </Column>
        </Row>
      )}
    </>
  );
};
