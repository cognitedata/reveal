import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import styled from 'styled-components';

import { unwrapResult } from '@reduxjs/toolkit';
import { Radio, RadioChangeEvent } from 'antd';

import { Body, Detail, Select } from '@cognite/cogs.js';

import { useThunkDispatch } from '../../../../store';
import { PopulateAnnotationTemplates } from '../../../../store/thunks/Annotation/PopulateAnnotationTemplates';
import { ClearButton } from '../../../Explorer/Components/ClearButton';
import { AnnotationFilterType, VisionFilterItemProps } from '../../types';

const annotationStateOptions: { [key: string]: string } = {
  approved: 'True (verified annotations)',
  rejected: 'False (rejected annotations)',
  suggested: 'Suggested (suggested annotations)',
};

export const AnnotationFilter = ({
  filter,
  setFilter,
}: VisionFilterItemProps) => {
  const { annotation } = filter;
  const dispatch = useThunkDispatch();

  const [annotationLabels, setAnnotationLabels] = useState<
    { value: string; label: string }[]
  >([]);

  const setAnnotationText = (newAnnotation: any) => {
    let updatedAnnotation: AnnotationFilterType | undefined = {};
    updatedAnnotation = {
      ...annotation,
      annotationLabelOrText: newAnnotation.label,
    };

    // To clear filter
    if (
      annotation?.annotationState === undefined &&
      updatedAnnotation.annotationLabelOrText === undefined
    )
      updatedAnnotation = undefined;

    setFilter({
      ...filter,
      annotation: updatedAnnotation,
    });
  };
  const handleAnnotationStateChange = (e: RadioChangeEvent) => {
    setFilter({
      ...filter,
      annotation: { ...annotation, annotationState: e.target.value },
    });
  };

  const handleOnStateClear = () => {
    setFilter({
      ...filter,
      annotation: { ...annotation, annotationState: undefined },
    });
  };

  const getValue = (annotationLabelOrText?: string) => {
    if (annotationLabelOrText)
      return [{ label: annotationLabelOrText, value: annotationLabelOrText }];
    return [];
  };

  useEffect(() => {
    (async () => {
      const savedConfigurationsResponse = await dispatch(
        PopulateAnnotationTemplates()
      );
      const savedConfiguration = unwrapResult(savedConfigurationsResponse);
      const {
        predefinedKeypointCollections: predefinedKeypoints,
        predefinedShapes,
      } = savedConfiguration;
      const keypointOptions = predefinedKeypoints.map((keypoint) => ({
        value: keypoint.collectionName,
        label: keypoint.collectionName,
      }));
      const shapeOptions = predefinedShapes.map((shape) => ({
        value: shape.shapeName,
        label: shape.shapeName,
      }));
      setAnnotationLabels([...keypointOptions, ...shapeOptions]);
    })();
  }, []);

  return (
    <Container>
      <SearchContainer>
        <Body level={3}>Search annotations</Body>
        {/* using Multi select to enable un-select option and logically accept last option */}
        <div>
          <Select
            value={getValue(annotation?.annotationLabelOrText)}
            onChange={setAnnotationText}
            options={annotationLabels}
            isClearable
            closeMenuOnSelect
            isMulti={false}
          />
        </div>
      </SearchContainer>
      <StatusContainer>
        <HeaderContainer>
          <Body level={3}>Annotation status</Body>
          <ClearButton
            clear={handleOnStateClear}
            disableClear={!annotation?.annotationState}
          >
            Clear
          </ClearButton>
        </HeaderContainer>
        <RadioContainer>
          {Object.keys(annotationStateOptions).map((key) => (
            <Radio
              name="annotationState"
              value={key}
              checked={annotation?.annotationState === key}
              onChange={handleAnnotationStateChange}
              key={key}
            >
              {' '}
              <Detail>{annotationStateOptions[key]}</Detail>
            </Radio>
          ))}
        </RadioContainer>
      </StatusContainer>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  gap: 16px;
  flex-direction: column;
`;
const HeaderContainer = styled.div`
  display: flex;
  gap: 8px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const SearchContainer = styled.div`
  display: grid;
  grid-gap: 6px;
  height: 62px;
`;

const StatusContainer = styled.div`
  display: flex;
  gap: 8px;
  flex-direction: column;
`;
const RadioContainer = styled.div`
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border: 0.5px solid rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  padding: 10px;
  gap: 8px;
`;
