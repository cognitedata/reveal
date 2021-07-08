import React, { useEffect, useMemo, useState } from 'react';
import { FilePreviewProps } from 'src/modules/Review/types';
import {
  Annotator,
  Region,
  AnnotatorTool,
} from '@cognite/react-image-annotate';
import { retrieveDownloadUrl } from 'src/api/file/fileDownloadUrl';
import { AnnotationEditPopup } from 'src/modules/Review/Components/ReactImageAnnotateWrapper/AnnotationEditPopup';
import { convertToRegion } from 'src/modules/Review/Components/ReactImageAnnotateWrapper/ConversionUtils';
import styled from 'styled-components';
import { useDispatch } from 'react-redux';
import { deselectAllAnnotations, selectAnnotation } from '../../previewSlice';

export const ReactImageAnnotateWrapper: React.FC<FilePreviewProps> = ({
  onUpdateAnnotation,
  onCreateAnnotation,
  onDeleteAnnotation,
  annotations,
  fileInfo,
}: FilePreviewProps) => {
  const [imageUrl, setImageUrl] = useState<string>();
  const [selectedTool, setSelectedTool] = useState<AnnotatorTool>();
  const regions: any[] = useMemo(() => {
    return annotations.map((item) => convertToRegion(item));
  }, [annotations]);

  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      if (fileInfo && fileInfo.id) {
        const imgUrl = await retrieveDownloadUrl(fileInfo.id);
        if (imgUrl) {
          setImageUrl(imgUrl);
        } else {
          setImageUrl(undefined);
        }
      } else {
        setImageUrl(undefined);
      }
    })();
  }, [fileInfo]);

  const NewRegionEditLabel = useMemo(() => {
    return ({
      region,
      editing,
      onDelete,
      onClose,
      onChange,
    }: {
      region: Region;
      editing: boolean;
      onDelete: (region: Region) => void;
      onClose: (region: Region) => void;
      onChange: (region: Region) => void;
    }) => {
      return (
        <AnnotationEditPopup
          region={region}
          editing={editing}
          onDelete={onDelete}
          onClose={onClose}
          onChange={onChange}
          onCreateAnnotation={onCreateAnnotation}
          onUpdateAnnotation={onUpdateAnnotation}
          onDeleteAnnotation={onDeleteAnnotation}
        />
      );
    };
  }, [onCreateAnnotation, onUpdateAnnotation]);

  const images = useMemo(() => {
    if (!imageUrl) {
      return [];
    }

    return [
      {
        src: imageUrl,
        name: fileInfo.name,
        regions,
      },
    ];
  }, [imageUrl, regions, fileInfo]);

  const onRegionSelect = (region: Region) => {
    dispatch(selectAnnotation(region.id as number));
  };

  const deselectAllRegions = () => {
    dispatch(deselectAllAnnotations());
  };

  const onSelectTool = (tool: AnnotatorTool) => {
    dispatch(deselectAllAnnotations());
    setSelectedTool(tool);
  };

  return (
    <Container>
      <Annotator
        onExit={() => {}}
        hideHeader
        images={images}
        keypointDefinitions={{}}
        enabledTools={['create-box', 'create-polygon', 'create-point']}
        RegionEditLabel={NewRegionEditLabel}
        showTags
        onSelectRegion={onRegionSelect}
        deSelectAllRegions={deselectAllRegions}
        onSelectTool={onSelectTool}
        selectedTool={selectedTool}
      />
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  height: 100%;

  .MuiIconButton-colorPrimary {
    color: #3f51b5;
  }
`;
