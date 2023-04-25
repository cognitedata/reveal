import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import formatISO9075 from 'date-fns/formatISO9075';
import parseISO from 'date-fns/parseISO';
import styled from 'styled-components/macro';

import { Button, Icon, Skeleton, Tooltip, toast } from '@cognite/cogs.js';
import type {
  CogniteApiError,
  ModelFile,
} from '@cognite/simconfig-api-sdk/rtk';
import {
  useGetModelBoundaryConditionListQuery,
  useGetModelFileQuery,
} from '@cognite/simconfig-api-sdk/rtk';

import { useSimulatorConfig } from 'hooks/useSimulatorConfig';
import {
  selectAuthHeaders,
  selectBaseUrl,
  selectProject,
} from 'store/simconfigApiProperties/selectors';
import { downloadModelFile } from 'utils/fileDownload';
import { TRACKING_EVENTS } from 'utils/metrics/constants';
import { trackUsage } from 'utils/metrics/tracking';

import {
  BoundaryConditionTable,
  ProcessingStatus,
} from './BoundaryConditionTable';

interface ModelVersionDetailsProps {
  modelFile: ModelFile;
}
interface InteralError {
  status?: number;
  data?: { error?: CogniteApiError };
  error?: CogniteApiError;
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

  const simulatorConfigDetails = useSimulatorConfig({ simulator, project });

  const pollingOptions = {
    pollingInterval: !isProcessingReady
      ? PROCESSING_POLLING_INTERVAL
      : undefined,
  };
  const {
    data: boundaryConditions,
    isFetching: isFetchingBoundaryConditions,
    isSuccess: isSuccessBoundaryConditions,
    isError: isErrorBoundaryConditions,
    error: errorMessageBoundaryConditions,
  } = useGetModelBoundaryConditionListQuery(
    {
      project,
      simulator,
      modelName,
      version,
    },
    {
      ...pollingOptions,
      skip: !simulatorConfigDetails?.isBoundaryConditionsEnabled,
    }
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

    if (
      hasBoundaryConditions ||
      hasCalculationFailed ||
      !isErrorBoundaryConditions
    ) {
      setIsProcessingReady(true);
    }
  }, [boundaryConditions, modelFileItem, isErrorBoundaryConditions]);

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
      {simulatorConfigDetails?.isBoundaryConditionsEnabled &&
      !errorMessageBoundaryConditions ? (
        <BoundaryConditionsContainer>
          <BoundaryConditionTable
            boundaryConditions={boundaryConditions?.modelBoundaryConditionList}
            modelFile={modelFileItem}
          />
        </BoundaryConditionsContainer>
      ) : undefined}

      {isErrorBoundaryConditions ? (
        <ProcessingStatus icon="WarningTriangleFilled" variant="warning">
          {
            (errorMessageBoundaryConditions as InteralError).data?.error
              ?.message
          }
        </ProcessingStatus>
      ) : undefined}

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
          </div>
          <div className="actions">
            {simulatorConfigDetails?.isBoundaryConditionsEnabled ? (
              <div className="charts-link">
                <Button
                  disabled={!boundaryConditions?.chartsUrl}
                  href={boundaryConditions?.chartsUrl}
                  icon="LineChart"
                  size="small"
                  target="_blank"
                  type="link"
                >
                  View in Charts
                </Button>
              </div>
            ) : null}

            <div className="download-link">
              <Button
                disabled={isModelFileDownloading}
                icon="Download"
                loading={isModelFileDownloading}
                size="small"
                type="link"
                onClick={onDownloadClicked}
              >
                Download
              </Button>
            </div>
            {Object.keys(additionalMetadata).length ? (
              <div className="more-info">
                <ModelMetaTooltip
                  content={Object.keys(additionalMetadata).map((key) => (
                    <AdditionalMetadataContainer key={key}>
                      <dl>
                        <dt className="dont-break-out">{key}</dt>
                        <dd className="dont-break-out">
                          {additionalMetadata[key]}
                        </dd>
                      </dl>
                    </AdditionalMetadataContainer>
                  ))}
                  position="right"
                  visible={isAdditionMetaInfoTooltipEnabled}
                  elevated
                  interactive
                  inverted
                  wrapped
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
                  />
                </ModelMetaTooltip>
              </div>
            ) : undefined}
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
      display: flex;
      align-items: center;
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

const ModelMetaTooltip = styled(Tooltip)`
  &.cogs-tooltip-wrapped {
    .tippy-content {
      max-width: 300px;
      width: 300px;
      max-height: 400px;
      overflow: auto;
    }
  }
`;
const AdditionalMetadataContainer = styled.div`
  padding: 5px;

  > dl {
    padding: 2px;
    display: grid;
    grid-template-columns: 1.5fr 1fr;
    margin: 0;
    align-items: start;

    > dt {
      margin-right: 1rem;
    }

    > dd {
      margin: 0;
    }
  }
`;
