import styled from 'styled-components';
import { Button, Input } from '@cognite/cogs.js';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { setImagePreviewEditState } from 'src/store/previewSlice';
import React, { useState } from 'react';
import { DataExplorationProvider } from '@cognite/data-exploration';
import { v3Client as sdk } from '@cognite/cdf-sdk-singleton';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AssetSelector } from 'src/pages/Preview/components/AssetSelector/AssetSelector';
import { AnnotationDrawerMode } from 'src/utils/AnnotationUtils';
import { ImagePreviewEditMode } from 'src/pages/Preview/Types';

export const ImageReviewDrawerContent = ({ mode }: { mode: number }) => {
  const dispatch = useDispatch();
  const editMode = useSelector(
    (state: RootState) =>
      state.previewSlice.imagePreview.editable ===
      ImagePreviewEditMode.Creatable
  );

  const handleEditPolygon = () => {
    if (editMode) {
      dispatch(setImagePreviewEditState(ImagePreviewEditMode.NotEditable));
    } else {
      dispatch(setImagePreviewEditState(ImagePreviewEditMode.Creatable));
    }
  };
  if (mode === AnnotationDrawerMode.LinkAsset) {
    return <LinkAssetView editMode={editMode} onClick={handleEditPolygon} />;
  }
  return <AddAnnotationsView editMode={editMode} onClick={handleEditPolygon} />;
};

const StyledDrawerInput = styled(Input)`
  margin-bottom: 20px;
`;

export const AddAnnotationsView = (props: {
  editMode: boolean;
  onClick: () => void;
}) => {
  return (
    <div>
      <StyledDrawerInput placeholder="Label 1" title="Label" fullWidth />
      <EditPolygonButton edit={props.editMode} onClick={props.onClick} />
    </div>
  );
};

export const EditPolygonButton = (props: {
  edit: boolean;
  onClick: () => void;
}) => {
  if (props.edit) {
    return (
      <Button type="secondary" icon="Upload" onClick={props.onClick}>
        Finish Editing
      </Button>
    );
  }
  return (
    <Button type="secondary" icon="Polygon" onClick={props.onClick}>
      Add polygon
    </Button>
  );
};

const queryClient = new QueryClient();

export const LinkAssetView = (props: {
  editMode: boolean;
  onClick: () => void;
}) => {
  const [selectedAssets, setSelectedAssets] = useState<number[] | undefined>(
    []
  );

  const handleSelectAssets = (assetIds: number[] | undefined) => {
    setSelectedAssets(assetIds);
  };

  return (
    <DataExplorationProvider sdk={sdk}>
      <QueryClientProvider client={queryClient}>
        <div>
          <AssetSelector
            assets={selectedAssets}
            onSelectAssets={handleSelectAssets}
          />
          <EditPolygonButton edit={props.editMode} onClick={props.onClick} />
        </div>
      </QueryClientProvider>
    </DataExplorationProvider>
  );
};
