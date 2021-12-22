import { useSelector } from 'react-redux';

import formatISO9075 from 'date-fns/formatISO9075';
import parseISO from 'date-fns/parseISO';
import styled from 'styled-components/macro';

import { Button, Icon, Skeleton } from '@cognite/cogs.js';
import { useGetModelBoundaryConditionListQuery } from '@cognite/simconfig-api-sdk/rtk';
import type { ModelFile } from '@cognite/simconfig-api-sdk/rtk';

import { selectProject } from 'store/simconfigApiProperties/selectors';

import { BoundaryConditionTable } from './BoundaryConditionTable';

interface ModelVersionDetailsProps {
  modelFile: ModelFile;
}

export function ModelVersionDetails({ modelFile }: ModelVersionDetailsProps) {
  const project = useSelector(selectProject);

  const { simulator, modelName, version } = modelFile.metadata;

  const { data: boundaryConditions, isFetching: isFetchingBoundaryConditions } =
    useGetModelBoundaryConditionListQuery({
      project,
      simulator,
      modelName,
      version,
    });

  if (isFetchingBoundaryConditions) {
    return <Skeleton.List lines={2} />;
  }

  return (
    <ModelVersionDetailsContainer>
      <BoundaryConditionsContainer>
        <BoundaryConditionTable
          boundaryConditions={boundaryConditions?.modelBoundaryConditionList}
          modelFile={modelFile}
        />
      </BoundaryConditionsContainer>
      <ModelVersionProperties>
        <div className="info-stack">
          <div className="info">
            <div className="user-email">
              <Icon type="User" />
              {modelFile.metadata.userEmail}
            </div>
            <div className="time">
              <Icon type="Clock" />
              {formatISO9075(parseISO(modelFile.createdTime))}
            </div>
          </div>
          <div className="actions">
            <div className="download-link">
              <Button href="" icon="Download" target="_blank">
                Download
              </Button>
            </div>
            <div className="charts-link">
              <Button href="" icon="LineChart" target="_blank" type="primary">
                View in Charts
              </Button>
            </div>
          </div>
        </div>
      </ModelVersionProperties>
    </ModelVersionDetailsContainer>
  );
}

const ModelVersionDetailsContainer = styled.div`
  display: flex;
  flex-flow: column nowrap;
  gap: 12px;
`;

const ModelVersionProperties = styled.main`
  border-top: 1px solid var(--cogs-border-default);
  padding-top: 6px;
  .info-stack {
    display: flex;
    align-items: center;
    gap: 6px;
    .info {
      display: flex;
      align-items: center;
      flex: 1 1 auto;
      overflow: hidden;
      gap: 12px;
      .user-email,
      .time {
        overflow: hidden;
        flex: 0 0 auto;
        display: flex;
        align-items: center;
        gap: 6px;
      }
    }
    .actions {
      flex: 0 0 auto;
      display: flex;
      align-items: center;
      gap: 12px;
    }
  }
  .charts-link,
  .download-link {
    margin: 6px 0;
    .cogs-btn {
      display: flex;
      text-align: center;
      align-items: center;
      white-space: nowrap;
    }
  }
`;

const BoundaryConditionsContainer = styled.aside`
  overflow: hidden;
`;
