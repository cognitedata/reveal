import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import formatISO9075 from 'date-fns/formatISO9075';
import parseISO from 'date-fns/parseISO';
import styled from 'styled-components/macro';

import { Button, Icon, Skeleton, Tooltip, toast } from '@cognite/cogs.js';
import type { ModelFile } from '@cognite/simconfig-api-sdk/rtk';
import {
  useGetModelBoundaryConditionListQuery,
  useGetModelFileQuery,
} from '@cognite/simconfig-api-sdk/rtk';

import {
  selectAuthHeaders,
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
  const headers = useSelector(selectAuthHeaders);
  const baseUrl = useSelector(selectBaseUrl);

  const [isModelFileDownloading, setIsModelFileDownloading] = useState(false);
  const [isProcessingReady, setIsProcessingReady] = useState(false);
  const [
    isAdditionMetaInfoTooltipEnabled,
    setIsAdditionMetaInfoTooltipEnabled,
  ] = useState(false);

  const { metadata } = modelFile;
  const { simulator, modelName, version } = metadata;
  const pollingOptions = {
    pollingInterval: !isProcessingReady
      ? PROCESSING_POLLING_INTERVAL
      : undefined,
  };
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
    pollingOptions
  );
  const { data: modelFileItem } = useGetModelFileQuery(
    {
      project,
      modelName: modelFile.name,
      simulator,
      version: modelFile.metadata.version,
    },
    pollingOptions
  );

  useEffect(() => {
    const hasBoundaryConditions =
      boundaryConditions?.modelBoundaryConditionList.length;
    const hasCalculationFailed =
      modelFileItem?.metadata.errorMessage !== undefined;

    if (hasBoundaryConditions || hasCalculationFailed) {
      setIsProcessingReady(true);
    }
  }, [boundaryConditions, modelFileItem]);

  useEffect(() => {
    if (isProcessingReady) {
      trackUsage(TRACKING_EVENTS.MODEL_VERSION_DEAILS, {
        modelName: decodeURI(modelName),
        modelVersion: version,
        simulator,
      });
    }
  }, [modelName, isProcessingReady, simulator, version]);

  const additionalMetadata = useMemo(() => {
    const metadataKeys = [
      'dataModelVersion',
      'modelName',
      'modelType',
      'simulator',
      'description',
      'fileName',
      'unitSystem',
      'userEmail',
      'version',
      'nextVersion',
      'previousVersion',
      'dataType',
      'errorMessage',
    ];

    return Object.fromEntries(
      Object.entries(modelFile.metadata).filter(
        ([key]) => !metadataKeys.includes(key)
      )
    );
  }, [modelFile.metadata]);

  if (isFetchingBoundaryConditions && !isSuccessBoundaryConditions) {
    return <Skeleton.List lines={2} />;
  }

  const onDownloadClicked = async () => {
    if (!headers || !baseUrl) {
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
    await downloadModelFile(headers, project, baseUrl, modelFile.metadata);
    setIsModelFileDownloading(false);
  };

  return (
    <ModelVersionDetailsContainer>
      <BoundaryConditionsContainer>
        <BoundaryConditionTable
          boundaryConditions={boundaryConditions?.modelBoundaryConditionList}
          modelFile={modelFileItem}
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
            <div className="file-name">
              <Icon type="Document" />
              {modelFile.metadata.fileName}
            </div>
            {Object.keys(additionalMetadata).length ? (
              <div className="more-info">
                <Tooltip
                  content={Object.keys(additionalMetadata).map((key) => (
                    <AdditionalMetadataContainer key={key}>
                      <dl>
                        <dt>{key}</dt>
                        <dd>{additionalMetadata[key]}</dd>
                      </dl>
                    </AdditionalMetadataContainer>
                  ))}
                  position="right-top"
                  visible={isAdditionMetaInfoTooltipEnabled}
                  elevated
                  interactive
                  inverted
                  onClickOutside={() => {
                    setIsAdditionMetaInfoTooltipEnabled(false);
                  }}
                >
                  <Button
                    icon="Info"
                    type="link"
                    onClick={() => {
                      setIsAdditionMetaInfoTooltipEnabled(true);
                    }}
                  >
                    More Info{' '}
                  </Button>
                </Tooltip>
              </div>
            ) : undefined}
          </div>
          <div className="actions">
            <div className="charts-link">
              <Button
                disabled={!boundaryConditions?.chartsUrl}
                href={boundaryConditions?.chartsUrl}
                icon="LineChart"
                size="small"
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
                size="small"
                type="primary"
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
      flex-flow: row wrap;
      gap: 12px;
      .user-email,
      .file-name,
      .more-info,
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

const AdditionalMetadataContainer = styled.div`
  padding: 5px;
  > dl {
    padding: 2px;
    display: grid;
    grid-template-columns: 1.5fr 1fr;
    margin: 0;
    align-items: center;
    > dd {
      margin: 0;
    }
  }
`;
