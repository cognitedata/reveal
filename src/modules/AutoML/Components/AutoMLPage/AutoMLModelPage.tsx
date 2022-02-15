/* eslint-disable no-nested-ternary */
/* eslint-disable @cognite/no-number-z-index */
import React, { useEffect, useState } from 'react';
import { Button, Icon, Popconfirm, Title } from '@cognite/cogs.js';
import styled from 'styled-components';
import { AutoMLAPI } from 'src/api/autoML/AutoMLAPI';
import { AutoMLTrainingJob } from 'src/api/autoML/types';
import { AutoMLModelNameBadge } from 'src/modules/AutoML/Components/AutoMLModelNameBadge';
import { useUserCapabilities } from 'src/hooks/useUserCapabilities';
import { AutoMLMetricsOverview } from './AutoMLMetricsOverview';
import { AutoMLCharts } from './AutoMLCharts';

export const AutoMLModelPage = (props: {
  selectedModelId?: number;
  downloadingModel?: boolean;
  handleDownload: () => void;
  handleOnDelete: () => void;
}) => {
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

  return (
    <>
      {model && props.selectedModelId === model?.jobId ? ( // TODO: use id
        <Container>
          <Header>
            <AutoMLModelNameBadge name={model.name} disabled />
            <ActionContainer>
              <Button
                type="primary"
                icon="Download"
                onClick={props.handleDownload}
                loading={props.downloadingModel}
                disabled={model.status !== 'Completed'}
              >
                Download model
              </Button>
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
