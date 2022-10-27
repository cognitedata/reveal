import { Input, OptionType, SegmentedControl, Select } from '@cognite/cogs.js';
import { EditableChip } from '@platypus-app/components/EditableChip';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
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
  transformationType: TransformationType;
}

export const CreateTransformationForm = (
  props: CreateTransformationFormProps
) => {
  const { t } = useTranslation('CreateTransformationForm');

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

      {props.relationships && props.relationships.length > 0 && (
        <Row>
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
                  value={props.selectedRelationship}
                  options={props.relationships}
                  onChange={props.onRelationshipChange}
                />
              </>
            )}
          </Column>
        </Row>
      )}
    </>
  );
};
