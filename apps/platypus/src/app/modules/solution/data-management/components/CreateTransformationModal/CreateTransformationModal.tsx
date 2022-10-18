import { useState } from 'react';
import { useTranslation } from '@platypus-app/hooks/useTranslation';

import { Input, SegmentedControl, Select, OptionType } from '@cognite/cogs.js';
import { Row, Column, Label } from './elements';

import { EditableChip } from '@platypus-app/components/EditableChip/EditableChip';
import { ModalDialog } from '@platypus-app/components/ModalDialog/ModalDialog';

import {
  DataModelExternalIdValidator,
  RequiredFieldValidator,
  Validator,
} from '@platypus/platypus-core';

type Option = OptionType<any>;

export interface CreateTransformationModalProps {
  name: string;
  id: string;
  selectedRelationship?: Option;
  relationships?: Option[];
  onRequestClose: () => void;
  onOk: () => void;
  onRelationshipChange?: (relationship: Option) => void;
}

export const CreateTransformationModal = (
  props: CreateTransformationModalProps
) => {
  const { t } = useTranslation('CreateTransformationModal');

  const [transformationType, setTransformationType] = useState('data');

  const validator = new Validator(props);
  if (transformationType === 'relationship') {
    validator.addRule('selectedRelationship', new RequiredFieldValidator());
  }
  const validationResult = validator.validate();

  return (
    <ModalDialog
      visible
      title={t('create_transformation_modal_title', 'Create transformation')}
      onOk={props.onOk}
      onCancel={props.onRequestClose}
      okDisabled={!validationResult.valid}
      okButtonName={t('create_transformation_modal_ok_button', 'Next')}
      okType="primary"
      width="620px"
    >
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
              currentKey={transformationType}
              onButtonClicked={setTransformationType}
            >
              <SegmentedControl.Button key="data">
                {t('create_transformation_modal_load_data_button', 'Load data')}
              </SegmentedControl.Button>
              <SegmentedControl.Button key="relationship">
                {t(
                  'create_transformation_modal_load_relationship_button',
                  'Load relationship'
                )}
              </SegmentedControl.Button>
            </SegmentedControl>
          </Column>
          <Column>
            {transformationType === 'relationship' && (
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
    </ModalDialog>
  );
};
