import { useEffect, useState } from 'react';

import {
  DataModelExternalIdValidator,
  DataModelNameValidator,
  Validator,
} from '@platypus/platypus-core';

import {
  Body,
  Divider,
  Flex,
  Icon,
  Input,
  Modal,
  Textarea,
} from '@cognite/cogs.js';

import { useDataModels } from '../../hooks/useDataModelActions';
import { useTranslation } from '../../hooks/useTranslation';
import { CreateNewSpaceModal } from '../CreateNewSpaceModal/CreateNewSpaceModal';
import { DataModelLibrary } from '../DataModelLibrary/DataModelLibrary';
import { DataModelLibraryItem } from '../DataModelLibrary/library';
import { DataModelSpaceSelect } from '../DataModelSpaceSelect/DataModelSpaceSelect';
import { FormLabel } from '../FormLabel/FormLabel';

import { NameWrapper, StyledEditableChip, Selector } from './elements';

export type DataModelDetailModalProps = {
  description: string;
  externalId: string;
  hasInputError?: boolean;
  isExternalIdLocked?: boolean;
  isLoading?: boolean;
  isSpaceDisabled?: boolean;
  okButtonName?: string;
  name: string;
  onCancel: () => void;
  onSubmit: () => void;
  onDescriptionChange: (value: string) => void;
  onExternalIdChange?: (value: string) => void;
  onNameChange: (value: string) => void;
  onSpaceChange?: (value?: string) => void;
  onDMLChange?: (value?: string) => void;
  space?: string;
  title: string;
  visible?: boolean;
};

export const DataModelDetailModal = (props: DataModelDetailModalProps) => {
  const { t } = useTranslation('DataModelDetailModal');
  const [externalIdErrorMessage, setExternalIdErrorMessage] = useState();
  const [nameErrorMessage, setNameErrorMessage] = useState();
  const [isCreateSpaceModalVisible, setIsCreateSpaceModalVisible] =
    useState(false);
  const [isLibraryVisible, setIsLibraryVisible] = useState(false);
  const [selectedLibrary, setSelectedLibrary] = useState<
    DataModelLibraryItem | undefined
  >(undefined);

  const { onDMLChange } = props;

  useEffect(() => {
    if (onDMLChange) {
      onDMLChange(selectedLibrary?.versions[0].dml);
    }
  }, [selectedLibrary, onDMLChange]);

  const { data: dataModels } = useDataModels();

  const validateName = (value: string) => {
    const validator = new Validator({ name: value });
    const dataModelNameValidator = new DataModelNameValidator();
    validator.addRule('name', dataModelNameValidator);
    const result = validator.validate();
    setNameErrorMessage(result.valid ? null : result.errors.name);

    return result.valid;
  };

  const validateExternalId = (value: string) => {
    const validator = new Validator({ externalId: value });
    const dataModelExternalIdValidator = new DataModelExternalIdValidator();
    validator.addRule('externalId', dataModelExternalIdValidator);
    const result = validator.validate();

    setExternalIdErrorMessage(result.valid ? null : result.errors.externalId);

    return result.valid;
  };

  const isSubmitDisabled =
    !props.name.trim() ||
    props.hasInputError ||
    nameErrorMessage ||
    externalIdErrorMessage ||
    !props.space ||
    props.isLoading;

  return (
    <>
      <Modal
        closable={!props.isLoading}
        visible={
          props.visible && !isCreateSpaceModalVisible && !isLibraryVisible
        }
        title={props.title}
        onCancel={props.onCancel}
        onOk={props.onSubmit}
        okDisabled={isSubmitDisabled}
        okText={props.okButtonName}
        icon={props.isLoading ? 'Loader' : undefined}
        data-cy="create-data-model-modal-content"
      >
        <div>
          <label>
            <FormLabel level={2} strong required>
              {t('modal_name_title', 'Name')}
            </FormLabel>
            <NameWrapper>
              <Input
                fullWidth
                autoFocus
                name="dataModelName"
                data-cy="input-data-model-name"
                value={props.name}
                disabled={props.isLoading}
                placeholder={t('modal_name_input_placeholder', 'Enter name')}
                onChange={(e) => {
                  validateName(e.target.value);
                  props.onNameChange(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isSubmitDisabled) {
                    props.onSubmit();
                  }
                }}
                error={props.hasInputError || nameErrorMessage}
              />
            </NameWrapper>
          </label>
          <StyledEditableChip
            data-testid="external-id-field"
            errorMessage={externalIdErrorMessage}
            isLocked={props.isExternalIdLocked || props.isLoading}
            label={t('external_id_label', 'External ID')}
            onChange={props.onExternalIdChange}
            placeholder={t(
              'data_model_id_placeholder',
              'Data model external ID'
            )}
            tooltip={
              props.externalId
                ? t('tooltip_external_id_label', 'External ID')
                : t(
                    'tooltip_external_id_explanation',
                    'External ID automatically generated from [Name]'
                  )
            }
            validate={validateExternalId}
            value={props.externalId}
          />
          <label>
            <FormLabel level={2} strong>
              {t('modal_description_title', 'Description')}
            </FormLabel>
            <Textarea
              name="dataModelDescription"
              data-cy="input-data-model-description"
              disabled={props.isLoading}
              value={props.description}
              onChange={(e) => props.onDescriptionChange(e.target.value)}
              placeholder={t(
                'modal_description_textarea_placeholder',
                'Add description'
              )}
              fullWidth
            ></Textarea>
          </label>

          {props.onDMLChange && (
            <>
              <Divider style={{ margin: '16px 0px' }} />
              <FormLabel level={2} strong>
                {t('modal_how_to_start', 'How would you like to get started')}
              </FormLabel>

              <div
                style={{
                  marginTop: 16,
                  display: 'grid',
                  columnCount: 3,
                  gap: 12,
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                }}
              >
                <Selector
                  onClick={() => setSelectedLibrary(undefined)}
                  $isSelected={!selectedLibrary}
                >
                  <Icon type="Edit" />
                  <Flex direction="column" style={{ flex: 1 }}>
                    <Body className="name" strong>
                      {t('modal_how_to_start_scratch', 'From scratch')}
                    </Body>
                  </Flex>
                </Selector>
                <Selector
                  onClick={() => setIsLibraryVisible(true)}
                  $isSelected={!!selectedLibrary}
                >
                  <Icon type="Bookmarks" />
                  <Flex direction="column" style={{ flex: 1 }}>
                    <Body className="name" strong>
                      {selectedLibrary
                        ? `${t(
                            'modal_how_to_start_using_library',
                            `Starting from `
                          )} "${selectedLibrary.name}"`
                        : t('modal_how_to_start_library', 'Browse Library')}
                    </Body>
                  </Flex>
                </Selector>
              </div>
            </>
          )}

          <DataModelSpaceSelect
            isDisabled={props.isSpaceDisabled || props.isLoading}
            onChange={(selectedSpaceOption) =>
              props.onSpaceChange?.(selectedSpaceOption.value)
            }
            onRequestCreateSpace={() => setIsCreateSpaceModalVisible(true)}
            value={
              props.space
                ? { label: props.space, value: props.space }
                : undefined
            }
          />
        </div>
      </Modal>
      {isCreateSpaceModalVisible && (
        <CreateNewSpaceModal
          visible
          onCancel={() => setIsCreateSpaceModalVisible(false)}
          onSubmit={(newSpace) => {
            props.onSpaceChange?.(newSpace);
            setIsCreateSpaceModalVisible(false);
          }}
        />
      )}
      {isLibraryVisible && (
        <DataModelLibrary
          dataModels={
            dataModels?.map((el) => ({
              id: el.id,
              name: el.name,
              versions: [
                {
                  version: el.version,
                  dml: el.graphQlDml,
                  date: new Date(el.createdTime),
                },
              ],
            })) || []
          }
          onConfirm={(selected) => {
            setSelectedLibrary(selected);
            setIsLibraryVisible(false);
          }}
          onCancel={() => {
            setIsLibraryVisible(false);
          }}
        />
      )}
    </>
  );
};
