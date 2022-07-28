import React, { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Col,
  OptionType,
  Popconfirm,
  Row,
  Title,
} from '@cognite/cogs.js';
import { deselectAllSelectionsReviewPage } from 'src/store/commonActions';
import styled from 'styled-components';
import { useDispatch } from 'react-redux';
import {
  PredefinedKeypoint,
  PredefinedKeypointCollection,
  PredefinedShape,
  PredefinedVisionAnnotations,
  VisionOptionType,
} from 'src/modules/Review/types';
import { AnnotationEditPopupBody } from 'src/modules/Review/Components/ReactImageAnnotateWrapper/AnnotationEditPopup/AnnotationEditPopupBody';
import {
  AnnotatorPointRegion,
  AnnotatorRegion,
  AnnotatorRegionLabelProps,
  AnnotatorRegionType,
  isAnnotatorPointRegion,
} from 'src/modules/Review/Components/ReactImageAnnotateWrapper/types';

export const AnnotationEditPopup = ({
  region,
  editing,
  onDelete,
  onClose,
  onChange,
  onCreateRegion,
  onDeleteRegion,
  collectionOptions,
  shapeOptions,
  nextPredefinedShape,
  nextPredefinedKeypointCollection,
  onOpenAnnotationSettings,
  popupReference,
  nextKeypoint,
  predefinedAnnotations,
}: AnnotatorRegionLabelProps & {
  onCreateRegion: (region: AnnotatorRegion) => void;
  onDeleteRegion: (region: AnnotatorRegion) => void;
  collectionOptions?: VisionOptionType<string>[];
  shapeOptions?: VisionOptionType<string>[];
  nextPredefinedShape?: PredefinedShape;
  nextPredefinedKeypointCollection: PredefinedKeypointCollection;
  onOpenAnnotationSettings: (
    type: string,
    text?: string,
    color?: string
  ) => void;
  nextKeypoint: PredefinedKeypoint | null;
  popupReference: any;
  predefinedAnnotations: PredefinedVisionAnnotations;
}) => {
  const dispatch = useDispatch();

  const title = useMemo(() => {
    switch (region.type) {
      case AnnotatorRegionType.BoxRegion: {
        return 'Rectangle';
      }
      case AnnotatorRegionType.PointRegion: {
        return 'Point';
      }
      case AnnotatorRegionType.PolygonRegion: {
        return 'Polygon';
      }
      case AnnotatorRegionType.LineRegion: {
        return 'Line';
      }
      default:
        return 'Other';
    }
  }, [region.type]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { annotationLabelOrText, annotationMeta, keypointLabel } =
    region as AnnotatorPointRegion;

  // means already saved in CDF
  const alreadyCreated = useMemo(() => {
    return !!(annotationMeta && annotationMeta?.annotation?.lastUpdatedTime);
  }, [annotationMeta]);

  const isKeypoint = useMemo(() => {
    return isAnnotatorPointRegion(region);
  }, [region]);

  const getInitialOption = (): VisionOptionType<string> => {
    // sets last created keypoint or shape in the options list or adds existing label for created annotations
    if (!alreadyCreated) {
      if (isKeypoint) {
        return (
          collectionOptions?.find(
            (val) =>
              val.value === nextPredefinedKeypointCollection.collectionName
          ) || {
            label: '',
          }
        );
      }
      return (
        shapeOptions?.find(
          (val) => val.value === nextPredefinedShape?.shapeName
        ) || { label: '' }
      );
    }
    return { label: annotationLabelOrText, value: annotationLabelOrText };
  };

  const [labelValue, setLabelValue] =
    useState<VisionOptionType<string>>(getInitialOption);

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

  const handleOnCreate = () => {
    // calls create callback and deletes temp region in annotation lib memory
    onCreateRegion(region);
    onClose(region);
    onDelete(region);
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

  // fix label on first time render of component
  // todo: Use the action handlers for selector for triggering this instead of using useEffect
  // updating the region
  useEffect(() => {
    if (
      region.annotationLabelOrText &&
      labelValue.value !== region.annotationLabelOrText
    ) {
      setLabelValue({
        label: region.annotationLabelOrText,
        value: annotationLabelOrText,
      });
    }
  }, [region.annotationLabelOrText]);

  useEffect(() => {
    // on select and on label value state is set region is updated accordingly
    if (editing && !isKeypoint && labelValue?.color && labelValue.value) {
      const updatedRegion = {
        ...region,
        color: labelValue.color,
        annotationLabelOrText: labelValue.value,
      };
      onChange(updatedRegion);
    }
  }, [labelValue, editing]);

  // on changing shape option region and region label is changed accordingly for keypoints
  // todo: the color property should be accessed from predefined annotation or every metadata such as color, keypoints needs to be populated in labelOptions and passed to this component
  useEffect(() => {
    if (
      editing &&
      isAnnotatorPointRegion(region) &&
      labelValue?.color &&
      labelValue.value
    ) {
      if (nextKeypoint) {
        // for intermediate keypoints of a collection keypoint metadata are accessed from nextKeypoint

        if (!region.annotationLabelOrText || !region.keypointLabel) {
          const updatedRegion = {
            ...region,
            color: nextKeypoint.color,
            annotationLabelOrText: labelValue.value,
            keypointLabel: nextKeypoint.caption,
          };
          onChange(updatedRegion);
        }
      } else {
        // for first keypoint of a collection keypoint metadata needs to be taken from the correct predefinedKeypointCollection
        const predefinedCollection =
          predefinedAnnotations.predefinedKeypointCollections.find(
            (collection) => collection.collectionName === labelValue.value
          );
        if (
          predefinedCollection &&
          predefinedCollection.keypoints &&
          predefinedCollection.keypoints.length
        ) {
          const firstKeypoint = predefinedCollection.keypoints[0];
          const updatedRegion = {
            ...region,
            color: firstKeypoint.color,
            annotationLabelOrText: predefinedCollection.collectionName,
            keypointLabel: firstKeypoint.caption,
          };
          onChange(updatedRegion);
        }
      }
    }
  }, [labelValue, editing, nextKeypoint]);

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

  // show footer when shape options or collection options are available
  const showFooter = useMemo(() => {
    return !isKeypoint ? !!shapeOptions?.length : !!collectionOptions?.length;
  }, [isKeypoint]);

  if (editing && (!isKeypoint || (isKeypoint && !nextKeypoint))) {
    // don't show popup for intermediate keypoints
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
          {showFooter && (
            <FooterContainer>
              <Popconfirm
                icon="WarningFilled"
                placement="bottom-end"
                onConfirm={handleOnDelete}
                content="Are you sure you want to permanently delete this annotation?"
              >
                <Button
                  size="small"
                  icon="Delete"
                  disabled={!alreadyCreated || isKeypoint}
                >
                  Delete
                </Button>
              </Popconfirm>
              <FooterRightButtonContainer>
                <Button size="small" onClick={handleOnCancel}>
                  Cancel
                </Button>
                {!alreadyCreated && (
                  <Button
                    className="annotation-submit-btn"
                    type="primary"
                    icon="Add"
                    size="small"
                    onClick={handleOnCreate}
                    disabled={disabledCreationOrUpdate}
                    tabIndex={0}
                  >
                    Create
                  </Button>
                )}
              </FooterRightButtonContainer>
            </FooterContainer>
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

const FooterContainer = styled.div`
  display: grid;
  grid-template-columns: auto auto;
  grid-template-rows: 100%;
  padding-top: 30px;
`;

const FooterRightButtonContainer = styled.div`
  display: flex;
  justify-content: end;
  align-items: center;
  gap: 20px;
`;
