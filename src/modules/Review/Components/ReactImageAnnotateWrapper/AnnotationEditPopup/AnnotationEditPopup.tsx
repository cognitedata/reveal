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
import { deselectAllSelectionsReviewPage } from 'src/store/commonActions';
import styled from 'styled-components';
import { useDispatch } from 'react-redux';
import {
  PredefinedKeypoint,
  PredefinedKeypointCollection,
  VisionOptionType,
} from 'src/modules/Review/types';
import { AnnotationEditPopupBody } from 'src/modules/Review/Components/ReactImageAnnotateWrapper/AnnotationEditPopup/AnnotationEditPopupBody';

export const AnnotationEditPopup = (props: {
  region: Region;
  editing: boolean;
  onDelete: (region: Region) => void;
  onClose: (region: Region) => void;
  onChange: (region: Region) => void;
  onCreateRegion: (region: Region) => void;
  onUpdateRegion: (region: Region) => void;
  onDeleteRegion: (region: Region) => void;
  collectionOptions?: VisionOptionType<string>[];
  shapeOptions?: VisionOptionType<string>[];
  lastShape?: string;
  lastCollection: PredefinedKeypointCollection;
  onOpenAnnotationSettings: (
    type: string,
    text?: string,
    color?: string
  ) => void;
  popupReference: any;
  nextKeypoint: PredefinedKeypoint | null;
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
    lastShape,
    lastCollection,
    onOpenAnnotationSettings,
    popupReference,
    nextKeypoint,
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
      case 'line': {
        return 'Line';
      }
      default:
        return 'Other';
    }
  }, [region]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [annotationLabel, keypointOrder, annotationId, keypointLabel] =
    region.tags || [];
  const alreadyCreated = !!(region as any).lastUpdatedTime; // means already saved in CDF
  const isKeypoint = region.type === 'point';

  const getInitialValue = (): VisionOptionType<string> => {
    // sets last created keypoint or shape in the options list or adds existing label for created annotations
    if (!alreadyCreated) {
      if (isKeypoint) {
        return (
          collectionOptions?.find(
            (val) => val.value === lastCollection.collectionName
          ) || {
            label: '',
          }
        );
      }
      return (
        shapeOptions?.find((val) => val.value === lastShape) || { label: '' }
      );
    }
    return { label: annotationLabel, value: annotationLabel };
  };

  const [labelValue, setLabelValue] = useState<VisionOptionType<string>>(
    getInitialValue()
  );

  const disabledCreationOrUpdate = !labelValue.value; // disallow creating or updating annotation if label is not available

  const handleOnDelete = () => {
    // calls delete callback and deletes region in annotation lib memory
    onDeleteRegion(region);
    onDelete(region);
    onClose(region);
  };

  const handleOnCancel = () => {
    onClose(region);
    if (alreadyCreated) {
      dispatch(deselectAllSelectionsReviewPage());
    } else {
      onDelete(region);
    }
  };

  const createKeypoint = () => {
    if (lastCollection && nextKeypoint) {
      const updatedRegion = {
        ...region,
        color: nextKeypoint.color,
        tags: [
          labelValue.value ? labelValue.value : lastCollection.collectionName,
          nextKeypoint.order,
          String(lastCollection.id) || '',
          nextKeypoint.caption,
        ],
      };
      onChange(updatedRegion);
      onCreateRegion(updatedRegion);
      onClose(updatedRegion);
    }
  };

  const handleOnCreate = () => {
    // calls create callback and deletes temp region in annotation lib memory
    if (isKeypoint) {
      createKeypoint();
    }
    onCreateRegion(region);
    onClose(region);
    onDelete(region);
  };

  const handleOnUpdate = () => {
    // calls update callback and deletes region in annotation lib memory
    onClose(region);
    onDelete(region);
    onUpdateRegion(region); // todo: move this to top of function once annotations are immutable
  };

  const handleSelect = (value: Required<OptionType<string>>) => {
    setLabelValue(value);
  };

  const handleAnnotationSettingsOpen = (text?: string, color?: string) => {
    if (isKeypoint) {
      onOpenAnnotationSettings('keypoint', text, color);
    } else {
      onOpenAnnotationSettings('shape', text, color);
    }
  };

  useEffect(() => {
    // on select and on label value state is set region is updated accordingly
    if (editing && !isKeypoint && labelValue?.color && labelValue.value) {
      let updatedRegionTags = [labelValue.value];
      if (region.tags?.length) {
        updatedRegionTags = updatedRegionTags.concat(region.tags.slice(1));
      }
      const updatedRegion = {
        ...region,
        color: labelValue.color,
        tags: updatedRegionTags,
      };
      onChange(updatedRegion);
    }
  }, [labelValue, editing]);

  useEffect(() => {
    if (editing) {
      if (nextKeypoint && +nextKeypoint.order > 1) {
        // create intermediate keypoints
        createKeypoint();
      }
    }
  }, [editing, nextKeypoint]);

  useEffect(() => {
    // focus to submit buttons
    if (editing) {
      if (popupReference.current) {
        const submitBtn = popupReference.current?.querySelector(
          '.annotation-submit-btn'
        ) as HTMLButtonElement;
        if (submitBtn) {
          submitBtn.focus();
        }
      }
    }
  }, [editing]);

  const showFooter = (isShape: boolean) => {
    return isShape ? !!shapeOptions?.length : !!collectionOptions?.length;
  };

  if (
    editing &&
    (!isKeypoint ||
      (isKeypoint && !nextKeypoint?.order) || // no predefined keypoints
      (isKeypoint && +nextKeypoint!.order === 1)) // don't show popup for intermediate keypoints
  ) {
    return (
      <Container ref={popupReference}>
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
                onClick={() => handleAnnotationSettingsOpen()}
              >
                Annotation Settings
              </Button>
            </Col>
          </Row>
          <Row cols={5} style={{ paddingTop: '10px', paddingBottom: '10px' }}>
            <AnnotationEditPopupBody
              isKeypointMode={isKeypoint}
              color={region.color}
              isSavedAnnotation={alreadyCreated}
              labelOption={labelValue}
              keypointLabel={keypointLabel}
              onSelectLabel={(val) => {
                handleSelect(val);
              }}
              labelOptions={isKeypoint ? collectionOptions : shapeOptions}
              onOpenAnnotationSettings={handleAnnotationSettingsOpen}
            />
          </Row>
          {showFooter(!isKeypoint) && (
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
                    disabled={!alreadyCreated || isKeypoint}
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
                    className="annotation-submit-btn"
                    type="primary"
                    icon="PlusCompact"
                    size="small"
                    onClick={handleOnCreate}
                    disabled={disabledCreationOrUpdate}
                    tabIndex={0}
                  >
                    Create
                  </Button>
                )}
                {alreadyCreated && (
                  <Button
                    className="annotation-submit-btn"
                    type="primary"
                    icon="Upload"
                    size="small"
                    disabled={disabledCreationOrUpdate}
                    onClick={handleOnUpdate}
                    tabIndex={0}
                  >
                    Update
                  </Button>
                )}
              </Col>
            </Row>
          )}
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
