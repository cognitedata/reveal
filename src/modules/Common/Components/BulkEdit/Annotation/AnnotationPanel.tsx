import React, { useEffect, useMemo, useState } from 'react';
import { Select } from '@cognite/cogs.js-old';
import { Body } from '@cognite/cogs.js';
import { EditPanelProps } from 'src/modules/Common/Components/BulkEdit/bulkEditOptions';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { makeSelectAnnotationsForFileIds } from 'src/modules/Common/store/annotation/selectors';
import { filterAnnotations } from 'src/modules/Common/Utils/AnnotationUtils/AnnotationUtils';
import {
  annotationEditOptions,
  AnnotationEditOptionType,
} from './annotationEditOptions';

export const AnnotationPanel = ({
  selectedFiles,
  bulkEditUnsaved,
  editPanelStateOptions,
  setBulkEditUnsaved,
  setEditing,
}: EditPanelProps) => {
  const [selectedAnnotationEditOption, setSelectedAnnotationEditOption] =
    useState<AnnotationEditOptionType>(annotationEditOptions[0]);
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

  useEffect(() => {
    const annotationFilterType = {
      annotationState: selectedAnnotationEditOption.annotationState,
    };
    const annotationIds: number[] = [];
    Object.entries(annotationsMap).forEach(([_, annotations]) => {
      const filteredAnnotations = filterAnnotations({
        annotations,
        filter: annotationFilterType,
      });
      annotationIds.push(...filteredAnnotations.map((item) => item.id));
    });
    // Disable apply button if there are no changes to be made
    setEditing(annotationIds.length === 0);
    // Set states
    editPanelStateOptions.setEditPanelState({
      ...editPanelStateOptions.editPanelState,
      annotationFilterType,
    });
    setBulkEditUnsaved({
      ...bulkEditUnsaved,
      annotationIds: {
        annotationIdsToDelete: annotationIds,
      },
    });
  }, [selectedAnnotationEditOption, annotationsMap]);

  return (
    <PanelContainer>
      <SelectContainer>
        <Body level={2}>Annotation status</Body>
        <Select
          value={selectedAnnotationEditOption}
          onChange={setSelectedAnnotationEditOption}
          options={annotationEditOptions}
          closeMenuOnSelect
        />
      </SelectContainer>
    </PanelContainer>
  );
};
const PanelContainer = styled.div`
  display: grid;
  grid-auto-flow: column;
  justify-content: left;
  align-items: end;
  grid-gap: 8px;
`;
const SelectContainer = styled.div`
  display: grid;
  grid-gap: 6px;
  width: 255px;
`;
