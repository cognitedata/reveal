import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import styled from 'styled-components';

import { Select, Body, Detail } from '@cognite/cogs.js';

import { VisionDetectionModelType } from '../../../api/vision/detectionModels/types';
import { RootState } from '../../../store/rootReducer';

import * as gaugeReaderDetails from './ModelDetails/gaugeReaderDetails';
import * as objectDetectionModelDetails from './ModelDetails/ObjectDetectionModelDetails';
import * as ocrModelDetails from './ModelDetails/OcrModelDetails';
import * as peopleDetectionModelDetails from './ModelDetails/PeopleDetectionModelDetails';
import * as tagDetectionModelDetails from './ModelDetails/TagDetectionModelDetails';

type SelectOption = {
  label: any;
  value: number;
  modelType?: VisionDetectionModelType;
  content: any;
};

const BadgeWrapper = (modelName: string, badge: JSX.Element) => {
  return (
    <StyledBadgeRow>
      {badge}
      <Detail strong>{` ${modelName}`}</Detail>
    </StyledBadgeRow>
  );
};

export const ModelConfiguration = () => {
  const availableDetectionModels = useSelector(
    (state: RootState) => state.processSlice.availableDetectionModels
  );

  const [currentModelSettings, setCurrentModelSettings] = useState(0);

  const enabledDetectionModels = availableDetectionModels;
  const modelSelectOptions: SelectOption[] = enabledDetectionModels.map(
    // eslint-disable-next-line consistent-return
    (item, index) => {
      let labelAndContent;
      const hideText = true;
      switch (item.type) {
        case VisionDetectionModelType.OCR:
          labelAndContent = {
            label: BadgeWrapper(
              item.modelName,
              ocrModelDetails.badge(item.modelName, hideText)
            ),
            content: ocrModelDetails.content(index),
          };
          break;

        case VisionDetectionModelType.TagDetection:
          labelAndContent = {
            label: BadgeWrapper(
              item.modelName,
              tagDetectionModelDetails.badge(item.modelName, hideText)
            ),
            content: tagDetectionModelDetails.content(index),
          };
          break;

        case VisionDetectionModelType.ObjectDetection:
          labelAndContent = {
            label: BadgeWrapper(
              item.modelName,
              objectDetectionModelDetails.badge(item.modelName, hideText)
            ),
            content: objectDetectionModelDetails.content(index),
          };
          break;

        case VisionDetectionModelType.PeopleDetection:
          labelAndContent = {
            label: BadgeWrapper(
              item.modelName,
              peopleDetectionModelDetails.badge(item.modelName, hideText)
            ),
            content: peopleDetectionModelDetails.content(index),
          };
          break;

        case VisionDetectionModelType.GaugeReader:
          labelAndContent = {
            label: BadgeWrapper(
              item.modelName,
              gaugeReaderDetails.badge(item.modelName, hideText)
            ),
            content: gaugeReaderDetails.content(index),
          };
          break;
      }
      return { ...labelAndContent, value: index, modelType: item.type };
    }
  );

  const options = modelSelectOptions;

  return (
    <>
      <Container>
        <ModelSelectContainer>
          <Body> Annotation Model</Body>
          <SelectContainer>
            <Select
              closeMenuOnSelect
              value={options.filter(
                (item) => item.value === currentModelSettings
              )}
              onChange={(option: any) => {
                // We handle model creation here instead of in an onClick for
                // the button. This is because the user may be able to click
                // outside the dropdown, yet inside the dropdown select.
                setCurrentModelSettings(option.value);
              }}
              options={options}
              disableTyping
            />
          </SelectContainer>
        </ModelSelectContainer>
        <ModelSettingsContainer>
          {
            modelSelectOptions.find(
              (item) => item.value === currentModelSettings
            )?.content
          }
        </ModelSettingsContainer>
      </Container>
    </>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  border: 1px solid #d9d9d9;
  background: white;
  border-radius: 10px;
`;

const ModelSelectContainer = styled.div`
  display: grid;
  grid-gap: 6px;
  margin-top: 22px;
  margin-left: 22px;
  height: 62px;
`;
const SelectContainer = styled.div`
  width: 255px;
`;

const ModelSettingsContainer = styled.div`
  display: grid;
  width: 100%;
  background: white;
  padding-left: 15px;
  padding-bottom: 15px;
  border-radius: 10px;
`;

const StyledBadgeRow = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
  justify-items: center;
  .cogs-icon {
    margin-right: 0;
  }
`;
