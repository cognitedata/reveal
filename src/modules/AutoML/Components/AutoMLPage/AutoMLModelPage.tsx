/* eslint-disable no-nested-ternary */
/* eslint-disable @cognite/no-number-z-index */
import React, { useEffect, useState } from 'react';
import { Button, Icon, Title } from '@cognite/cogs.js';
import styled from 'styled-components';
import { AutoMLAPI } from 'src/api/autoML/AutoMLAPI';
import { AutoMLTrainingJob } from 'src/api/autoML/types';
import { AutoMLModelNameBadge } from 'src/modules/AutoML/Components/AutoMLModelNameBadge';
import { AutoMLMetricsOverview } from './AutoMLMetricsOverview';

export const AutoMLModelPage = (props: { selectedModelId?: number }) => {
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

  return (
    <>
      {model && props.selectedModelId === model?.jobId ? ( // TODO: use id
        <Container>
          <Header>
            <>
              <AutoMLModelNameBadge name={model.name} disabled />
              <Button type="primary" icon="Download" disabled>
                {/* TODO: handle model download once API is ready */}
                Collect model
              </Button>
            </>
          </Header>
          <AutoMLMetricsOverview model={model} />
          {/* TODO: add metric graphs */}
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
