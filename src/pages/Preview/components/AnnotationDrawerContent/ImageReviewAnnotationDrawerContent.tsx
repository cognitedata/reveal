import styled from 'styled-components';
import { Button, Input } from '@cognite/cogs.js';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import {
  editLabelAddAnnotation,
  selectAssetsIds,
  setImagePreviewEditState,
} from 'src/store/previewSlice';
import React from 'react';
import { DataExplorationProvider } from '@cognite/data-exploration';
import { v3Client as sdk } from '@cognite/cdf-sdk-singleton';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AssetSelector } from 'src/pages/Preview/components/AssetSelector/AssetSelector';
import { AnnotationDrawerMode } from 'src/utils/AnnotationUtils';
import { ImagePreviewEditMode } from 'src/pages/Preview/Types';

export const ImageReviewDrawerContent = ({
  mode,
  fileId,
}: {
  mode: number;
  fileId: string;
}) => {
  const dispatch = useDispatch();
  const editMode = useSelector(
    (state: RootState) =>
      state.previewSlice.imagePreview.editable ===
      ImagePreviewEditMode.Creatable
  );

  const drawerAnnotationLabel = useSelector(
    (state: RootState) => state.previewSlice.drawer.annotation?.text || ''
  );

  const drawerSelectedAssetIds = useSelector(
    (state: RootState) => state.previewSlice.drawer.selectedAssetIds
  );

  const handleEditPolygon = () => {
    if (editMode) {
      dispatch(setImagePreviewEditState(ImagePreviewEditMode.NotEditable));
    } else {
      dispatch(setImagePreviewEditState(ImagePreviewEditMode.Creatable));
    }
  };

  const handleLabelChange = (label: string) => {
    dispatch(editLabelAddAnnotation({ fileId, label }));
  };

  const handleAssetIdSelect = (ids: number[]) => {
    dispatch(selectAssetsIds(ids));
  };

  if (mode === AnnotationDrawerMode.LinkAsset) {
    return (
      <LinkAssetView
        editMode={editMode}
        onClick={handleEditPolygon}
        onSelectAssetIds={handleAssetIdSelect}
        selectedAssetIds={drawerSelectedAssetIds}
      />
    );
  }
  return (
    <AddAnnotationsView
      editMode={editMode}
      onClick={handleEditPolygon}
      onLabelChange={handleLabelChange}
      text={drawerAnnotationLabel}
    />
  );
};

const StyledDrawerInput = styled(Input)`
  margin-bottom: 20px;
`;

export const AddAnnotationsView = (props: {
  text: string;
  editMode: boolean;
  onClick: () => void;
  onLabelChange: (label: string) => void;
}) => {
  const inputChange = (evt: any) => {
    props.onLabelChange(evt.target.value);
  };
  return (
    <div>
      <StyledDrawerInput
        placeholder="Label 1"
        title="Label"
        fullWidth
        onInput={inputChange}
        value={props.text}
      />
      <EditPolygonButton edit={props.editMode} onClick={props.onClick} />
    </div>
  );
};

export const EditPolygonButton = (props: {
  disabled?: boolean;
  edit: boolean;
  onClick: () => void;
}) => {
  if (props.edit) {
    return (
      <Button
        type="secondary"
        icon="Upload"
        onClick={props.onClick}
        disabled={props.disabled}
      >
        Finish Editing
      </Button>
    );
  }
  return (
    <Button
      type="secondary"
      icon="Polygon"
      onClick={props.onClick}
      disabled={props.disabled}
    >
      Add polygon
    </Button>
  );
};

const queryClient = new QueryClient();

export const LinkAssetView = (props: {
  editMode: boolean;
  onClick: () => void;
  onSelectAssetIds: (ids: number[]) => void;
  selectedAssetIds: number[];
}) => {
  const handleSelectAssets = (assetIds: number[] | undefined) => {
    props.onSelectAssetIds(assetIds || []);
  };

  return (
    <DataExplorationProvider sdk={sdk}>
      <QueryClientProvider client={queryClient}>
        <div>
          <AssetSelector
            assets={props.selectedAssetIds}
            onSelectAssets={handleSelectAssets}
          />
          <EditPolygonButton edit={props.editMode} onClick={props.onClick} />
        </div>
      </QueryClientProvider>
    </DataExplorationProvider>
  );
};
