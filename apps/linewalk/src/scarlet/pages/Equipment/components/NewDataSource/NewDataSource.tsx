import { useEffect, useState } from 'react';
import { Dropdown, Icon, Menu } from '@cognite/cogs.js';
import { DataPanelActionType, DetectionType } from 'scarlet/types';
import { useDataPanelContext } from 'scarlet/hooks';

import { NewCanvasDataSource } from '..';

import * as Styled from './style';

const options = [
  DetectionType.MANUAL,
  DetectionType.MANUAL_EXTERNAL,
  DetectionType.MANUAL_INPUT,
];

export const NewDataSource = () => {
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [currentOption, setCurrentOption] = useState<DetectionType>();
  const [isManualFallback, setIsManualFallback] = useState(false);
  const { dataPanelState, dataPanelDispatch } = useDataPanelContext();

  const onButtonClick = () => {
    setIsMenuVisible((isMenuVisible) => !isMenuVisible);
  };

  const selectOption = (option: DetectionType) => {
    setCurrentOption(option);
    setIsMenuVisible(false);
    switch (option) {
      case DetectionType.MANUAL: {
        dataPanelDispatch({
          type: DataPanelActionType.TOGGLE_NEW_DATA_SOURCE,
          isActive: true,
        });
        if (dataPanelState.newDetection) {
          dataPanelDispatch({
            type: DataPanelActionType.REMOVE_NEW_DETECTION,
          });
        }
        setIsManualFallback(true);
        break;
      }
      default:
        dataPanelDispatch({
          type: DataPanelActionType.SET_NEW_MANUAL_DETECTION,
          detectionType: option,
        });
        break;
    }
  };

  const deselectOption = () => {
    if (currentOption === DetectionType.MANUAL) {
      dataPanelDispatch({
        type: DataPanelActionType.TOGGLE_NEW_DATA_SOURCE,
        isActive: false,
      });
      setIsManualFallback(false);
    }
    setCurrentOption(undefined);
    dataPanelDispatch({
      type: DataPanelActionType.REMOVE_NEW_DETECTION,
    });
  };

  const reset = () => {
    setIsMenuVisible(false);
    deselectOption();
  };

  useEffect(() => {
    if (
      dataPanelState.isActiveNewDataSource &&
      currentOption !== DetectionType.MANUAL
    ) {
      selectOption(DetectionType.MANUAL);
    } else if (!dataPanelState.isActiveNewDataSource && isManualFallback) {
      deselectOption();
    }
  }, [dataPanelState.isActiveNewDataSource]);

  useEffect(() => reset, []);

  useEffect(() => {
    if (isManualFallback && dataPanelState.newDetection) {
      setIsManualFallback(false);
    }

    if (!dataPanelState.newDetection && currentOption && !isManualFallback) {
      reset();
    }
  }, [dataPanelState.newDetection]);

  return (
    <>
      <Dropdown
        visible={isMenuVisible}
        offset={[0, 5]}
        content={
          <Menu style={{ width: '410px' }}>
            {options.map((option) => (
              <Menu.Item
                key={option}
                onClick={() => selectOption(option)}
                disabled={currentOption === option}
              >
                {getLabel(option)}
              </Menu.Item>
            ))}
          </Menu>
        }
      >
        <Styled.NewSourceButton
          onClick={onButtonClick}
          icon="AddLarge"
          iconPlacement="left"
          type="link"
        >
          {getLabel(currentOption)}
          <Styled.Chevron>
            <Icon
              type={
                currentOption || isMenuVisible ? 'ChevronUp' : 'ChevronDown'
              }
              aria-label="Toggle new data source"
            />
          </Styled.Chevron>
        </Styled.NewSourceButton>
      </Dropdown>

      {isManualFallback && <NewCanvasDataSource />}
    </>
  );
};

const getLabel = (option?: DetectionType) => {
  switch (option) {
    case DetectionType.MANUAL:
      return 'Add new data source from canvas';
    case DetectionType.MANUAL_EXTERNAL:
      return 'Add external data source';
    case DetectionType.MANUAL_INPUT:
      return 'Manually input value';

    default:
      return 'Add new data source';
  }
};
