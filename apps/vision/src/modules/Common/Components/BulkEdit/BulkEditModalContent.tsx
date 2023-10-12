import React, { useEffect, useMemo, useState } from 'react';

import styled from 'styled-components';

import { notification } from 'antd';

import {
  Body,
  Button,
  Popconfirm,
  Select,
  Title,
  Tooltip,
} from '@cognite/cogs.js';

import { retrieveAsset } from '../../../../api/assets/retrieveAsset';
import { AnnotationRenderer } from '../../Containers/FileTableRenderers/AnnotationRenderer';
import { AnnotationStatusRenderer } from '../../Containers/FileTableRenderers/AnnotationStatusRenderer';
import { FilteredAnnotationsRenderer } from '../../Containers/FileTableRenderers/FilteredAnnotationsRenderer';
import { FilteredAnnotationStatusRenderer } from '../../Containers/FileTableRenderers/FilteredAnnotationStatusRenderer';
import { NameRenderer } from '../../Containers/FileTableRenderers/NameRenderer';
import { StringRenderer } from '../../Containers/FileTableRenderers/StringRenderer';
import { BulkEditUnsavedState } from '../../store/common/types';
import { VisionFile } from '../../store/files/types';

import { DEFAULT_THRESHOLDS } from './Annotation/AnnotationStatusPanel';
import {
  bulkEditOptions,
  BulkEditOptionType,
  EditPanelState,
} from './bulkEditOptions';
import { BulkEditTable } from './BulkEditTable/BulkEditTable';
import { BulkEditOptions } from './enums';

export type BulkEditModalContentProps = {
  selectedFiles: VisionFile[];
  bulkEditUnsaved: BulkEditUnsavedState;
  onCancel: () => void;
  setBulkEditUnsaved: (value: BulkEditUnsavedState) => void;
  onFinishBulkEdit: () => void;
};

const OptionalPopconfirmButton = (props: {
  buttonText: string;
  onFinish: () => void;
  editing: boolean;
  popconfirm?: boolean;
}) => {
  const button = (
    <Button
      type="primary"
      icon="Upload"
      onClick={props.popconfirm ? () => {} : props.onFinish}
      disabled={props.editing}
    >
      {props.buttonText}
    </Button>
  );
  return props.popconfirm ? (
    <Popconfirm
      icon="WarningFilled"
      placement="bottom-end"
      onConfirm={props.onFinish}
      content="Are you sure you want to perform this action?"
    >
      {button}
    </Popconfirm>
  ) : (
    button
  );
};

const rendererMap = {
  name: NameRenderer,
  // Metadata
  originalMetadata: StringRenderer,
  updatedMetadata: StringRenderer,
  // Labels
  originalLabels: StringRenderer,
  updatedLabels: StringRenderer,
  // Asset
  originalAssets: StringRenderer,
  updatedAssets: StringRenderer,
  // Source
  originalSource: StringRenderer,
  updatedSource: StringRenderer,
  // Directory
  originalDirectory: StringRenderer,
  updatedDirectory: StringRenderer,
  // Annotation
  originalAnnotations: AnnotationRenderer,
  updatedAnnotations: FilteredAnnotationsRenderer,
  // Annotation statuses
  originalAnnotationStatuses: AnnotationStatusRenderer,
  updatedAnnotationStatuses: FilteredAnnotationStatusRenderer,
};

const initialEditPanelState = {
  annotationThresholds: [DEFAULT_THRESHOLDS[0], DEFAULT_THRESHOLDS[1]],
} as EditPanelState;

export const BulkEditModalContent = ({
  selectedFiles,
  bulkEditUnsaved,
  onCancel,
  setBulkEditUnsaved,
  onFinishBulkEdit,
}: BulkEditModalContentProps) => {
  const [selectedBulkEditOption, setSelectedBulkEditOption] =
    useState<BulkEditOptionType>(bulkEditOptions[0]);
  const [editing, setEditing] = useState<boolean>();
  const [editPanelState, setEditPanelState] = useState<EditPanelState>(
    initialEditPanelState
  );
  const [assetsDetails, setAssetsDetails] = useState<
    Record<number, { name: string }>
  >({});
  const [errors, setErrors] = useState<
    Record<string, { message: string; description: string }>
  >({});

  const {
    columns,
    popconfirmOnApply,
    tooltipContentOnDisabled,
    EditPanel,
    data,
    disabled,
  } = selectedBulkEditOption;
  const { assetIds: unsavedAssetIds } = bulkEditUnsaved;
  const assetIdsFromFiles = useMemo(
    () => selectedFiles.map((file) => file.assetIds).flat(),
    [selectedFiles]
  );

  useEffect(() => {
    setEditing(false);
  }, [selectedBulkEditOption]);

  useEffect(() => {
    if (selectedBulkEditOption.label === BulkEditOptions.assets) {
      const assetIds: number[] = [
        assetIdsFromFiles,
        unsavedAssetIds?.addedAssetIds,
        unsavedAssetIds?.removedAssetIds,
      ]
        .flat()
        .filter((v, i, a) => a.indexOf(v) === i && v !== undefined) as number[];

      (async () => {
        try {
          if (assetIds.length > 0) {
            const assets = await retrieveAsset(assetIds);
            assets.forEach((asset) => {
              setAssetsDetails((currentAssets) => ({
                ...currentAssets,
                [asset.id]: { name: asset.name },
              }));
            });
          }
          setErrors({});
        } catch (e: any) {
          const error = e.errors[0].message.split(' | ')[0];

          if (error === 'Asset id not found') {
            setErrors({
              ...errors,
              [BulkEditOptions.assets]: {
                message: 'Some files are linked to non-existing assets',
                description: 'Please remove these and try again',
              },
            });
          } else {
            setErrors({
              ...errors,
              [BulkEditOptions.assets]: {
                message: 'Retrieve asset failed',
                description: e.errors[0].message,
              },
            });
          }
        }
      })();
    }
  }, [
    assetIdsFromFiles,
    selectedBulkEditOption,
    unsavedAssetIds?.addedAssetIds,
    unsavedAssetIds?.removedAssetIds,
  ]);

  const handleBulkEditOptionChange = (value: {
    label: string;
    text: string;
  }) => {
    if (errors[value.label]) {
      notification.error({ ...errors[value.label] });
    } else {
      const option = bulkEditOptions.find((item) => item.label === value.label);
      if (option) {
        setSelectedBulkEditOption(option);
      }
      // Reset unsaved panel state when bulk edit option state has changed
      setBulkEditUnsaved({});
    }
  };

  return (
    <>
      <Title level={4} as="h1">
        Bulk edit files
      </Title>
      <BodyContainer>
        <EditType>
          <Body level={2}>Select bulk action</Body>
          <SelectContainer>
            <Select
              value={{
                label: selectedBulkEditOption.label,
                value: selectedBulkEditOption.value,
              }}
              onChange={handleBulkEditOptionChange}
              options={bulkEditOptions.map((item) => ({
                value: item.value,
                label: item.label,
              }))}
              closeMenuOnSelect
            />
          </SelectContainer>
        </EditType>
        <EditPanel
          selectedFiles={selectedFiles}
          bulkEditUnsaved={bulkEditUnsaved}
          setBulkEditUnsaved={setBulkEditUnsaved}
          setEditing={setEditing}
          editPanelStateOptions={{ editPanelState, setEditPanelState }}
        />
        <BulkEditTable
          data={data({
            selectedFiles,
            bulkEditUnsaved,
            editPanelState,
            assetsDetails,
          })}
          columns={columns}
          rendererMap={rendererMap}
          disabled={disabled && disabled({ bulkEditUnsaved })}
        />
      </BodyContainer>
      <Footer>
        <RightFooter>
          <Button type="ghost-destructive" icon="CloseLarge" onClick={onCancel}>
            Cancel
          </Button>
          <Tooltip
            content={
              <span data-testid="text-content">
                {tooltipContentOnDisabled ||
                  'Please finish your unfinished edits'}
              </span>
            }
            disabled={!editing}
          >
            <OptionalPopconfirmButton
              buttonText="Apply"
              onFinish={onFinishBulkEdit}
              editing={!!editing}
              popconfirm={popconfirmOnApply}
            />
          </Tooltip>
        </RightFooter>
      </Footer>
    </>
  );
};

const BodyContainer = styled.div`
  display: grid;
  grid-gap: 18px;
  margin: 17px 0px;
`;

const EditType = styled.div`
  display: grid;
  grid-gap: 6px;
  height: 62px;
`;

const SelectContainer = styled.div`
  width: 255px;
`;

const Footer = styled.div`
  display: grid;
  grid-auto-flow: column;
`;

const RightFooter = styled.div`
  display: grid;
  grid-auto-flow: column;
  align-self: center;
  justify-self: end;
  grid-gap: 6px;
`;
