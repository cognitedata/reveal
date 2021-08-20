import { Region } from '@cognite/react-image-annotate/Types/ImageCanvas/region-tools';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Col,
  Popconfirm,
  Row,
  Title,
  OptionType,
} from '@cognite/cogs.js';
import styled from 'styled-components';
import { useDispatch } from 'react-redux';
import {
  deleteCurrentCollection,
  deselectAllKeypoints,
} from 'src/modules/Review/imagePreviewSlice';
import { BodyContainer } from 'src/modules/Review/Components/ReactImageAnnotateWrapper/BodyContainer';
import { VisionOptionType } from 'src/modules/Review/types';
import { deselectAllAnnotations } from '../../previewSlice';

const getKeypointOptions = (
  optionsMap?: { key: string; value: VisionOptionType<string>[] }[],
  key?: string
): VisionOptionType<string>[] => {
  return optionsMap?.find((val) => val.key === key)?.value || [];
};

export const AnnotationEditPopup = (props: {
  region: Region;
  editing: boolean;
  onDelete: (region: Region) => void;
  onClose: (region: Region) => void;
  onChange: (region: Region) => void;
  onCreateRegion: (
    region: Region,
    labelValue: VisionOptionType<string>,
    keyPointLabel: VisionOptionType<string>
  ) => void;
  onUpdateRegion: (
    region: Region,
    labelValue: VisionOptionType<string>,
    keyPointLabel: VisionOptionType<string>
  ) => void;
  onDeleteRegion: (region: Region) => void;
  collectionOptions?: VisionOptionType<string>[];
  shapeOptions?: VisionOptionType<string>[];
  keyPointLabelOptionMap?: {
    key: string;
    value: VisionOptionType<string>[];
  }[];
  nextPoint: string;
  nextShape: string;
  nextCollection: string;
  onOpenCollectionSettings: () => void;
}) => {
  const {
    region,
    editing,
    onDelete,
    onClose,
    onChange,
    onCreateRegion,
    onUpdateRegion,
    onDeleteRegion,
    collectionOptions,
    shapeOptions,
    keyPointLabelOptionMap,
    nextPoint,
    nextShape,
    nextCollection,
    onOpenCollectionSettings,
  } = props;

  const dispatch = useDispatch();

  const title = useMemo(() => {
    switch (region.type) {
      case 'box': {
        return 'Rectangle';
      }
      case 'point': {
        return 'Point';
      }
      case 'polygon': {
        return 'Polygon';
      }
      default:
        return 'Other';
    }
  }, [region]);

  const alreadyCreated = !!(region as any).lastUpdatedTime;

  const isKeypoint = region.type === 'point';

  const getInitialValue = (tags?: string[]): VisionOptionType<string> => {
    if (!tags || !tags.length) {
      if (region.type === 'point') {
        return (
          collectionOptions?.find((val) => val.value === nextCollection) || {
            label: '',
          }
        );
      }
      return (
        shapeOptions?.find((val) => val.value === nextShape) || { label: '' }
      );
    }
    if (alreadyCreated && tags) {
      if (region.type === 'point') {
        return (
          collectionOptions?.find((val) => val.value === tags[0]) || {
            label: tags[0],
            value: tags[0],
          }
        );
      }
      return (
        shapeOptions?.find((val) => val.value === tags[0]) || {
          label: tags[0],
          value: tags[0],
        }
      );
    }
    return { label: '' };
  };

  const [labelValue, setLabelValue] = useState<VisionOptionType<string>>(
    getInitialValue(region.tags)
  );

  const keyPointLabelOptions = getKeypointOptions(
    keyPointLabelOptionMap,
    labelValue?.value
  );

  const getInitialKeyPointValue = (
    tags?: string[]
  ): VisionOptionType<string> => {
    if (!tags || !tags.length) {
      return (
        keyPointLabelOptions?.find((val) => val.value === nextPoint) || {
          label: '',
        }
      );
    }
    if (alreadyCreated && tags.length >= 4) {
      return (
        keyPointLabelOptions?.find((val) => val.value === tags[1]) || {
          label: tags[3],
          value: tags[1],
        }
      );
    }
    return { label: '' };
  };

  const [keyPointValue, setKeyPointValue] = useState<OptionType<string>>(
    getInitialKeyPointValue(region.tags)
  );

  const disabledCreationOrUpdate =
    region.type === 'point'
      ? !labelValue.value && !keyPointValue.value
      : !labelValue.value;

  const handleOnDelete = () => {
    onDeleteRegion(region);
    onDelete(region);
    onClose(region);
  };

  const handleOnCancel = () => {
    onClose(region);
    if (alreadyCreated) {
      dispatch(deselectAllAnnotations());
      dispatch(deselectAllKeypoints());
    } else {
      onDelete(region);
    }
  };

  const handleOnCreate = () => {
    onClose(region);
    onCreateRegion(region, labelValue, keyPointValue);
  };

  const handleOnUpdate = () => {
    onClose(region);
    onUpdateRegion(region, labelValue, keyPointValue);
  };

  const updateRegionLabel = (label: string) => {
    let updatedRegionTags = [];

    if (label) {
      if (region.tags?.length) {
        updatedRegionTags = region.tags.slice(1);
      } else {
        updatedRegionTags = [label];
      }
      const updatedRegion = { ...region, tags: updatedRegionTags };
      onChange(updatedRegion);
    }
  };

  const handleSelect = (value: Required<OptionType<string>>) => {
    if (value.value !== labelValue.value) {
      dispatch(deleteCurrentCollection());
    }
    setLabelValue(value);
    if (keyPointLabelOptions && keyPointLabelOptions.length) {
      setKeyPointValue(
        getKeypointOptions(keyPointLabelOptionMap, value.value).find(
          (val) => val.value === '1'
        ) || {
          label: '',
        }
      );
    }

    updateRegionLabel(value.value);
  };

  const handleSelectKeyPointValue = (value: Required<OptionType<string>>) => {
    setKeyPointValue(value);
    updateRegionLabel(value.value);
  };

  useEffect(() => {
    if (editing) {
      return () => {
        if (editing && !alreadyCreated) {
          onDelete(region);
        }
      };
    }
    return () => {};
  }, [editing]);

  useEffect(() => {
    if (editing && labelValue?.color) {
      onChange({ ...region, color: labelValue.color });
    }
  }, [labelValue, editing]);

  useEffect(() => {
    if (editing && keyPointValue?.color) {
      onChange({ ...region, color: keyPointValue.color });
    }
  }, [keyPointValue, editing]);

  if (editing) {
    return (
      <Container>
        <OptionContainer>
          <Row
            cols={6}
            style={{ display: 'flex', justifyContent: 'space-between' }}
          >
            <Col span={3}>
              <Title level={4} style={{ paddingBottom: '4px' }}>
                {title}
              </Title>
            </Col>
            <Col span={3}>
              <Button
                size="small"
                variant="default"
                type="link"
                icon="Settings"
                iconPlacement="right"
                style={{ textTransform: 'capitalize' }}
                onClick={onOpenCollectionSettings}
              >
                Collection Settings
              </Button>
            </Col>
          </Row>
          <Row cols={5} style={{ paddingTop: '10px', paddingBottom: '10px' }}>
            <BodyContainer
              isKeypointMode={isKeypoint}
              color={region.color}
              disabledDropdown={alreadyCreated}
              labelOption={labelValue}
              keypointLabelOption={keyPointValue}
              keypointLabelOptions={keyPointLabelOptions}
              onSelectLabel={(val) => {
                handleSelect(val);
              }}
              onSelectKeypoint={(val) => {
                handleSelectKeyPointValue(val);
              }}
              labelOptions={collectionOptions}
              shapeOptions={shapeOptions}
            />
          </Row>
          <Row style={{ paddingTop: '30px' }} cols={12} gutter={0}>
            <Col span={3}>
              <Popconfirm
                icon="WarningFilled"
                placement="bottom-end"
                onConfirm={handleOnDelete}
                content="Are you sure you want to permanently delete this annotation?"
              >
                <Button
                  size="small"
                  icon="Trash"
                  disabled={isKeypoint || disabledCreationOrUpdate}
                >
                  Delete
                </Button>
              </Popconfirm>
            </Col>
            <Col span={3}>
              <div />
            </Col>
            <Col span={3}>
              <Button size="small" onClick={handleOnCancel}>
                Cancel
              </Button>
            </Col>
            <Col span={3}>
              {!alreadyCreated && (
                <Button
                  type="primary"
                  icon="PlusCompact"
                  size="small"
                  onClick={handleOnCreate}
                  disabled={disabledCreationOrUpdate}
                >
                  Create
                </Button>
              )}
              {alreadyCreated && (
                <Button
                  type="primary"
                  icon="Upload"
                  size="small"
                  onClick={handleOnUpdate}
                >
                  Update
                </Button>
              )}
            </Col>
          </Row>
        </OptionContainer>
      </Container>
    );
  }

  return null;
};

const OptionContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 360px;
  background: #ffffff;
  border: 1px solid #d9d9d9;
  box-sizing: border-box;
  border-radius: 4px;
  padding: 11px;
`;

const Container = styled.div`
  cursor: default;
`;
