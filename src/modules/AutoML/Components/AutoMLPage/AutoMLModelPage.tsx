/* eslint-disable no-nested-ternary */
/* eslint-disable @cognite/no-number-z-index */
import React, { useEffect, useState } from 'react';
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
import { AutoMLAPI } from 'src/api/vision/autoML/AutoMLAPI';
import { AutoMLTrainingJob } from 'src/api/vision/autoML/types';
import { AutoMLModelNameBadge } from 'src/modules/AutoML/Components/AutoMLModelNameBadge';
import { useUserCapabilities } from 'src/hooks/useUserCapabilities';
import { AutoMLMetricsOverview } from './AutoMLMetricsOverview';
import { AutoMLCharts } from './AutoMLCharts';

export const AutoMLModelPage = (props: {
  selectedModelId?: number;
  downloadingModel?: boolean;
  handleDownload: () => void;
  handleOnDelete: () => void;
  handleOnContextualize: (model: AutoMLTrainingJob | undefined) => void;
  handleOnGetPredictionURL: () => void;
}) => {
  const [hideDropDown, setHideDropDown] = useState<boolean>(true);
  const [model, setModel] = useState<AutoMLTrainingJob>();

  const getModel = async () => {
    if (props.selectedModelId) {
      const item = await AutoMLAPI.getAutoMLModel(props.selectedModelId);
      setModel(item);
    }
  };

  useEffect(() => {
    getModel();
  }, [props.selectedModelId]);

  const { data: hasCapabilities, isFetched } = useUserCapabilities([
    {
      acl: 'visionModelAcl',
      actions: ['WRITE'],
    },
  ]);
  const deleteDisabled = props.downloadingModel || !hasCapabilities;

  const MenuContent = (
    <Menu
      style={{
        color: 'black' /* typpy styles make color to be white here ... */,
      }}
    >
      <Menu.Item
        onClick={() => {
          props.handleOnContextualize(model);
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
      <Menu.Item
        onClick={() => {
          props.handleDownload();
          setHideDropDown(true);
        }}
      >
        <Icon type="Download" style={{ marginRight: 17 }} />
        <Detail strong style={{ color: 'inherit' }}>
          Download model
        </Detail>
      </Menu.Item>
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
      {model && props.selectedModelId === model?.jobId ? ( // TODO: use id
        <Container>
          <Header>
            <AutoMLModelNameBadge name={model.name} disabled />
            <ActionContainer>
              <Dropdown visible={!hideDropDown} content={MenuContent}>
                <Button
                  type="primary"
                  icon="ChevronDownCompact"
                  aria-label="dropdown button"
                  disabled={
                    model.status !== 'Completed' || props.downloadingModel
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
                  icon="Trash"
                  disabled={deleteDisabled}
                  loading={!isFetched}
                >
                  Delete model
                </Button>
              </Popconfirm>
            </ActionContainer>
          </Header>
          <AutoMLMetricsOverview model={model} />
          <AutoMLCharts model={model} />
        </Container>
      ) : props.selectedModelId ? (
        <StyledIcon data-testid="model-page-loading" type="Loading" />
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

const StyledIcon = styled(Icon)`
  display: flex;
  justify-items: center;
  align-content: center;
`;
