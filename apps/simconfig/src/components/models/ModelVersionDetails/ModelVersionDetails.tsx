import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import formatISO9075 from 'date-fns/formatISO9075';
import parseISO from 'date-fns/parseISO';
import styled from 'styled-components/macro';

import { Button, Icon, Skeleton, toast } from '@cognite/cogs.js';
import type { ModelFile } from '@cognite/simconfig-api-sdk/rtk';
import { useGetModelBoundaryConditionListQuery } from '@cognite/simconfig-api-sdk/rtk';

import {
  selectAuthToken,
  selectBaseUrl,
  selectProject,
} from 'store/simconfigApiProperties/selectors';
import { downloadModelFile } from 'utils/fileDownload';
import { TRACKING_EVENTS } from 'utils/metrics/constants';
import { trackUsage } from 'utils/metrics/tracking';

import { BoundaryConditionTable } from './BoundaryConditionTable';

interface ModelVersionDetailsProps {
  modelFile: ModelFile;
}

const PROCESSING_POLLING_INTERVAL = 2000; // 2 seconds

export function ModelVersionDetails({ modelFile }: ModelVersionDetailsProps) {
  const project = useSelector(selectProject);
  const token = useSelector(selectAuthToken);
  const baseUrl = useSelector(selectBaseUrl);

  const [isModelFileDownloading, setIsModelFileDownloading] = useState(false);
  const [isProcessingReady, setIsProcessingReady] = useState(false);

  const { metadata } = modelFile;
  const { simulator, modelName, version } = metadata;

  const {
    data: boundaryConditions,
    isFetching: isFetchingBoundaryConditions,
    isSuccess: isSuccessBoundaryConditions,
  } = useGetModelBoundaryConditionListQuery(
    {
      project,
      simulator,
      modelName,
      version,
    },
    {
      pollingInterval: !isProcessingReady
        ? PROCESSING_POLLING_INTERVAL
        : undefined,
    }
  );

  useEffect(() => {
    if (boundaryConditions?.modelBoundaryConditionList.length) {
      setIsProcessingReady(true);
    }
  }, [boundaryConditions]);

  useEffect(() => {
    if (isProcessingReady) {
      trackUsage(TRACKING_EVENTS.MODEL_VERSION_DEAILS, {
        modelName: decodeURI(modelName),
        modelVersion: version,
        simulator,
      });
    }
  }, [modelName, isProcessingReady, simulator, version]);

  if (isFetchingBoundaryConditions && !isSuccessBoundaryConditions) {
    return <Skeleton.List lines={2} />;
  }

  const onDownloadClicked = async () => {
    if (!token || !baseUrl) {
      toast.error(
        'An error occured while downloading the file, please reload the page and try again.'
      );
      return;
    }

    trackUsage(TRACKING_EVENTS.MODEL_VERSION_DOWNLOAD, {
      modelName: decodeURI(modelName),
      modelVersion: version,
      simulator,
    });

    setIsModelFileDownloading(true);
    await downloadModelFile(token, project, baseUrl, modelFile.metadata);
    setIsModelFileDownloading(false);
  };

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
            <div className="charts-link">
              <Button
                disabled={!boundaryConditions?.chartsUrl}
                href={boundaryConditions?.chartsUrl}
                icon="LineChart"
                target="_blank"
                type="tertiary"
              >
                View in Charts
              </Button>
            </div>
            <div className="download-link">
              <Button
                disabled={isModelFileDownloading}
                icon="Download"
                loading={isModelFileDownloading}
                type="tertiary"
                onClick={onDownloadClicked}
              >
                Download
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
