/* eslint-disable no-nested-ternary */
/* eslint-disable @cognite/no-number-z-index */
import React, { useState } from 'react';
import {
  Button,
  Detail,
  Dropdown,
  Icon,
  Menu,
  Popconfirm,
  Title,
} from '@cognite/cogs.js';
import styled from 'styled-components';
import {
  AutoMLExportFormat,
  AutoMLTrainingJob,
} from 'src/api/vision/autoML/types';
import { AutoMLModelNameBadge } from 'src/modules/AutoML/Components/AutoMLModelNameBadge';
import { useUserCapabilities } from 'src/hooks/useUserCapabilities';
import { AutoMLMetricsOverview } from './AutoMLMetricsOverview';
import { AutoMLCharts } from './AutoMLCharts';

export const AutoMLModelPage = (props: {
  isLoadingJob: boolean;
  model?: AutoMLTrainingJob;
  downloadingModel?: boolean;
  handleDownload: (exportFormat: AutoMLExportFormat) => void;
  handleOnDelete: () => void;
  handleOnContextualize: (model: AutoMLTrainingJob | undefined) => void;
  handleOnGetPredictionURL: () => void;
}) => {
  const [hideDropDown, setHideDropDown] = useState<boolean>(true);

  const { data: hasCapabilities, isFetched } = useUserCapabilities([
    {
      acl: 'visionModelAcl',
      actions: ['WRITE'],
    },
  ]);
  const deleteDisabled = props.downloadingModel || !hasCapabilities;

  const modelDownloadContent = () => {
    function getMenuItem(exportFormat: AutoMLExportFormat) {
      const menuName =
        exportFormat === AutoMLExportFormat.tflite
          ? 'TensorFlow Lite'
          : 'TensorFlow SavedModel';
      return (
        <Menu.Item
          onClick={() => {
            props.handleDownload(exportFormat);
            setHideDropDown(true);
          }}
        >
          {menuName}
        </Menu.Item>
      );
    }
    return (
      <Menu>
        {getMenuItem(AutoMLExportFormat.tflite)}
        {getMenuItem(AutoMLExportFormat.protobuf)}
      </Menu>
    );
  };

  const MenuContent = (
    <Menu
      style={{
        color: 'black' /* typpy styles make color to be white here ... */,
      }}
    >
      <Menu.Item
        onClick={() => {
          props.handleOnContextualize(props.model);
          setHideDropDown(true);
        }}
      >
        <div style={{ display: 'flex' }}>
          <Icon type="Scan" style={{ marginRight: 17 }} />
          <Detail strong style={{ color: 'inherit' }}>
            Quick test
          </Detail>
        </div>
      </Menu.Item>
      <Menu.Submenu content={modelDownloadContent()}>
        <>
          <Icon type="Download" style={{ marginRight: 17 }} />
          <Detail strong style={{ color: 'inherit' }}>
            Download model
          </Detail>
        </>
      </Menu.Submenu>
      <Menu.Item
        onClick={() => {
          props.handleOnGetPredictionURL();
          setHideDropDown(true);
        }}
      >
        <Icon type="World" style={{ marginRight: 17 }} />
        <Detail strong style={{ color: 'inherit' }}>
          Prediction URL
        </Detail>
      </Menu.Item>
    </Menu>
  );

  return (
    <>
      {props.model ? (
        <Container>
          <Header>
            <AutoMLModelNameBadge name={props.model.name} disabled />
            <ActionContainer>
              <Dropdown visible={!hideDropDown} content={MenuContent}>
                <Button
                  type="primary"
                  icon="ChevronDownSmall"
                  aria-label="dropdown button"
                  disabled={
                    props.model.status !== 'Completed' || props.downloadingModel
                  }
                  loading={props.downloadingModel}
                  iconPlacement="right"
                  onClick={() => setHideDropDown(!hideDropDown)}
                >
                  Try model
                </Button>
              </Dropdown>

              <Popconfirm
                icon="WarningFilled"
                placement="bottom-end"
                onConfirm={props.handleOnDelete}
                content="Are you sure you want to permanently delete this model?"
              >
                <Button
                  type="ghost-danger"
                  icon="Delete"
                  disabled={deleteDisabled}
                  loading={!isFetched}
                >
                  Delete model
                </Button>
              </Popconfirm>
            </ActionContainer>
          </Header>
          <AutoMLMetricsOverview model={props.model} />
          <AutoMLCharts model={props.model} />
        </Container>
      ) : props.isLoadingJob ? (
        <LoadingMessageContainer>
          Retrieving model data. This may take a few seconds...
          <Icon data-testid="model-page-loading" type="Loader" />
        </LoadingMessageContainer>
      ) : (
        <StyledTitle data-testid="model-page-placeholder" level={4}>
          Select a model to see model data
        </StyledTitle>
      )}
    </>
  );
};

const Container = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  padding: 16px;
`;

const Header = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  padding-bottom: 16px;
`;

const ActionContainer = styled.div`
  display: flex;
  width: 100%;
  justify-content: flex-end;
  gap: 5px;
`;

const StyledTitle = styled(Title)`
  display: flex;
  width: 100%;
  height: 100%;
  color: '#00000073';
  justify-content: center;
  align-items: center;
`;

const LoadingMessageContainer = styled.div`
  display: flex;
  height: 100%;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;
