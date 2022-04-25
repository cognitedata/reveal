import React, { useEffect, useMemo, useState } from 'react';
import { Body, Micro } from '@cognite/cogs.js';
import { EditPanelProps } from 'src/modules/Common/Components/BulkEdit/bulkEditOptions';
import { RangeSlider } from 'src/modules/Common/Components/Slider/rangeSlider';
import { AnnotationUtils } from 'src/utils/AnnotationUtils';
import { makeSelectAnnotationsForFileIds } from 'src/modules/Common/store/annotationV1/selectors';
import { useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';

// Constants
export const DEFAULT_THRESHOLDS: [number, number] = [0.25, 0.75];
const UNHANDLED_COLOR = '#4A67FB';
const REJECTED_COLOR = '#FFBB00';
const ACCEPTED_COLOR = '#18AF8E';

const percentFormatter = (value?: number) => {
  return `${value}%`;
};

const getConfidenceDescription = (
  rejectedThreshold: number,
  acceptedThreshold: number
) => {
  if (rejectedThreshold <= 0 && acceptedThreshold >= 100) {
    return <Micro>All annotations will be unhandled.</Micro>;
  }
  if (rejectedThreshold <= 0) {
    return (
      <Micro>
        Annotations with confidence <em>above</em>{' '}
        <strong>{acceptedThreshold}% </strong> are{' '}
        <strong style={{ color: ACCEPTED_COLOR }}>approved</strong>.
      </Micro>
    );
  }
  if (acceptedThreshold >= 100) {
    return (
      <Micro>
        Annotations with confidence <em>below</em>{' '}
        <strong> {rejectedThreshold}% </strong> are{' '}
        <strong style={{ color: REJECTED_COLOR }}>rejected</strong>.
      </Micro>
    );
  }

  return (
    <Micro>
      Annotations with confidence <em>below</em>{' '}
      <strong> {rejectedThreshold}% </strong> are{' '}
      <strong style={{ color: REJECTED_COLOR }}>rejected</strong>, while those{' '}
      <em>above</em> <strong>{acceptedThreshold}% </strong> are{' '}
      <strong style={{ color: ACCEPTED_COLOR }}>approved</strong>.
    </Micro>
  );
};

export const AnnotationStatusPanel = ({
  selectedFiles,
  editPanelStateOptions,
  bulkEditUnsaved,
  setBulkEditUnsaved,
}: EditPanelProps) => {
  const defaultValues: [number, number] = [
    DEFAULT_THRESHOLDS[0] * 100,
    DEFAULT_THRESHOLDS[1] * 100,
  ];
  const [thresholds, setThresholds] = useState<[number, number]>(defaultValues);
  const selectAnnotationsForFileIds = useMemo(
    makeSelectAnnotationsForFileIds,
    []
  );
  const annotationsMap = useSelector(({ annotationReducer }: RootState) =>
    selectAnnotationsForFileIds(
      annotationReducer,
      selectedFiles.map((item) => item.id)
    )
  );
  const marks = {
    0: {
      style: { color: '--cogs-text-color-secondary' },
      label: '0%',
    },
    100: {
      style: { color: '--cogs-text-color-secondary' },
      label: '100%',
    },
  };

  useEffect(() => {
    // NOTE: thresholds are in range [0, 100] in the slider
    const [rejectThreshold, acceptThreshold] = [
      thresholds[0] / 100,
      thresholds[1] / 100,
    ];
    editPanelStateOptions.setEditPanelState({
      ...editPanelStateOptions.editPanelState,
      annotationThresholds: [rejectThreshold, acceptThreshold],
    });

    const rejectedAnnotationIds: number[] = [];
    const verifiedAnnotationIds: number[] = [];
    const unhandledAnnotationIds: number[] = [];
    Object.entries(annotationsMap).forEach(([_, annotations]) => {
      const filteredAnnotations =
        AnnotationUtils.filterAnnotationsIdsByConfidence(
          annotations,
          rejectThreshold,
          acceptThreshold
        );
      rejectedAnnotationIds.push(...filteredAnnotations.rejectedAnnotationIds);
      verifiedAnnotationIds.push(...filteredAnnotations.acceptedAnnotationIds);
      unhandledAnnotationIds.push(
        ...filteredAnnotations.unhandledAnnotationIds
      );
    });
    setBulkEditUnsaved({
      ...bulkEditUnsaved,
      annotationIds: {
        rejectedAnnotationIds,
        verifiedAnnotationIds,
        unhandledAnnotationIds,
      },
    });
  }, [thresholds, annotationsMap]);

  return (
    <>
      <div>
        <Body level={2} style={{ paddingBottom: '4px' }}>
          Confidence threshold
        </Body>
        {getConfidenceDescription(thresholds[0], thresholds[1])}
        <RangeSlider
          values={thresholds}
          defaultValues={defaultValues}
          setValues={setThresholds}
          trackColor={UNHANDLED_COLOR}
          railColor={[REJECTED_COLOR, ACCEPTED_COLOR]}
          marks={marks}
          formatter={percentFormatter}
        />
      </div>
    </>
  );
};
