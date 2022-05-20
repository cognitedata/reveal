import React, { useCallback } from 'react';

import filter from 'lodash/filter';
import isUndefined from 'lodash/isUndefined';
import map from 'lodash/map';

import { Button, Flex, Tooltip } from '@cognite/cogs.js';

import { ItemWrapper } from '../layout/elements';
import { ConfigFormProps } from '../types';
import { getLabelFromIdentifier } from '../utils/getLabelFromIdentifier';

import { CreateNewOrUpdateComponent } from './CreateNewOrUpdateComponent';

const entityModalInitialValues = {
  visible: false,
  index: undefined,
  label: undefined,
  id: undefined,
  type: undefined,
  featureTypeId: undefined,
};

export const ConfigComponent: React.FC<ConfigFormProps> = ({
  metadataValue,
  values,
  onChange,
  onChangeAndUpdate,
  onUpdate,
  valuePath,
  metadataPath,
  renderCustomComponent,
  renderDeleteComponent,
  hasChanges,
}) => {
  const [createNewOpened, setCreateNewOpened] = React.useState(false);
  const [entityModal, setEntityModal] = React.useState<{
    visible: boolean;
    index: number | undefined;
    label: string | undefined;
    id: string | undefined;
    type: 'EDIT' | 'DELETE' | undefined;
    // Todo(PP-2934): remove featureTypeId from here & send value where customDeleteComponent decides what to use
    featureTypeId: string | undefined;
  }>(entityModalInitialValues);

  const resetEntityModal = useCallback(() => {
    setEntityModal(entityModalInitialValues);
  }, []);

  const isEntityModalVisible =
    entityModal.visible && !isUndefined(entityModal.index);

  const handleDelete = () => {
    onChangeAndUpdate(
      valuePath,
      filter(values as any[], (val, filterIndex) => {
        return filterIndex !== entityModal.index;
      })
    );
    resetEntityModal();
  };

  return (
    <Flex direction="column" gap={16} alignItems="flex-start">
      <Button
        type="secondary"
        icon="Add"
        iconPlacement="right"
        onClick={() => setCreateNewOpened(true)}
      >
        Create New {metadataValue?.label}
      </Button>
      <CreateNewOrUpdateComponent
        mode="NEW"
        opened={createNewOpened}
        setOpened={setCreateNewOpened}
        values={values}
        valuePath={valuePath}
        onChange={onChange}
        onChangeAndUpdate={onChangeAndUpdate}
        onUpdate={onUpdate}
        renderCustomComponent={renderCustomComponent}
        metadataValue={metadataValue}
        metadataPath={metadataPath}
      />
      {map(
        values as Array<{ id?: string; featureTypeId?: string }>,
        (datum, index) => {
          const label = getLabelFromIdentifier(
            datum,
            metadataValue?.dataLabelIdentifier,
            `${metadataValue?.label} ${index + 1}`
          );

          return (
            <Flex gap={8} alignItems="center" key={label}>
              <ItemWrapper level="4">{label}</ItemWrapper>
              {metadataValue?.editInline && (
                <Tooltip
                  content="Reset or save changes to enable edit"
                  disabled={!hasChanges}
                >
                  <Button
                    disabled={hasChanges}
                    icon="Edit"
                    aria-label="Edit item"
                    onClick={() =>
                      setEntityModal({
                        visible: true,
                        index,
                        label,
                        id: datum.id,
                        type: 'EDIT',
                        featureTypeId: datum.featureTypeId,
                      })
                    }
                  />
                </Tooltip>
              )}
              <Tooltip
                content="Reset or save changes to enable delete"
                disabled={!hasChanges}
              >
                <Button
                  disabled={hasChanges}
                  icon="Delete"
                  aria-label="Delete item"
                  onClick={() =>
                    setEntityModal({
                      visible: true,
                      index,
                      label,
                      id: datum.id,
                      type: 'DELETE',
                      featureTypeId: datum.featureTypeId,
                    })
                  }
                />
              </Tooltip>
            </Flex>
          );
        }
      )}
      {isEntityModalVisible && entityModal.type === 'DELETE'
        ? renderDeleteComponent({
            onDelete: handleDelete,
            onClose: resetEntityModal,
            type: metadataPath,
            label: entityModal.label,
            id: entityModal.id,
            featureTypeId: entityModal.featureTypeId,
          })
        : null}
      {isEntityModalVisible && entityModal.type === 'EDIT' ? (
        <CreateNewOrUpdateComponent
          mode="EDIT"
          opened={entityModal.visible}
          setOpened={() => resetEntityModal()}
          values={values}
          value={values?.[entityModal.index as number]}
          valuePath={valuePath}
          onChange={onChange}
          onChangeAndUpdate={onChangeAndUpdate}
          onUpdate={onUpdate}
          renderCustomComponent={renderCustomComponent}
          metadataValue={metadataValue}
          metadataPath={metadataPath}
        />
      ) : null}
    </Flex>
  );
};
