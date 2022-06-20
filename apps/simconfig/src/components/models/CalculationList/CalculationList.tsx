import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useMatch, useNavigate } from 'react-location';
import { useSelector } from 'react-redux';

import { parseISO } from 'date-fns';
import styled from 'styled-components/macro';

import {
  Button,
  Dropdown,
  Graphic,
  Icon,
  Label,
  Menu,
  Skeleton,
  Tooltip,
  toast,
} from '@cognite/cogs.js';
import { useAuthContext } from '@cognite/react-container';
import type {
  CalculationRun,
  CalculationTemplate,
  CalculationType,
  CalculationTypeUserDefined,
  DeletionStatus,
  Simulator,
} from '@cognite/simconfig-api-sdk/rtk';
import {
  useDeleteModelCalculationMutation,
  useGetModelCalculationListQuery,
  useGetModelFileQuery,
  useRunModelCalculationMutation,
} from '@cognite/simconfig-api-sdk/rtk';

import { GraphicContainer } from 'components/shared/elements';
import { CalculationDescriptionInfoDrawer } from 'pages/CalculationConfiguration/steps/infoDrawers/CalculationDescriptionInfoDrawer';
import { selectCapabilities } from 'store/capabilities/selectors';
import { selectProject } from 'store/simconfigApiProperties/selectors';
import { isBHPApproxMethodWarning } from 'utils/common';
import { TRACKING_EVENTS } from 'utils/metrics/constants';
import { trackUsage } from 'utils/metrics/tracking';
import { isSuccessResponse } from 'utils/responseUtils';

import { CalculationRunTypeIndicator } from './CalculationRunTypeIndicator';
import { CalculationScheduleIndicator } from './CalculationScheduleIndicator';
import { CalculationStatusIndicator } from './CalculationStatusIndicator';
import { STATUS_POLLING_INTERVAL } from './constants';
import DeleteConfirmModal from './DeleteConfirmModal';

import type { AppLocationGenerics } from 'routes';

type TriggeredRunInfo = Record<string, number>;
interface CalculationListProps {
  simulator: Simulator;
  modelName: string;
  showConfigured?: boolean;
}
export interface ModelCalculation {
  externalId: string;
  configuration: CalculationTemplate;
  latestRun?: CalculationRun;
  deletionStatus?: DeletionStatus;
}
export function CalculationList({
  simulator,
  modelName,
  showConfigured = true,
}: CalculationListProps) {
  const project = useSelector(selectProject);
  const navigate = useNavigate();
  const [runModelCalculations] = useRunModelCalculationMutation();
  const [deleteModelCalculation, { isSuccess: isDeleteSuccess }] =
    useDeleteModelCalculationMutation();
  const { authState } = useAuthContext();
  const [shouldPoll, setShouldPoll] = useState<boolean>(false);
  const [shouldPollOnDelete, setShouldPollOnDelete] = useState<boolean>(false);
  const [triggeredRuns, setTriggeredRuns] = useState<TriggeredRunInfo>();

  const [deletedExternalIds, setDeletedExternalIds] = useState<string[]>([]);

  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] =
    useState<boolean>(false);
  const [confirmDeleteCalucation, setConfirmDeleteCalucation] =
    useState<ModelCalculation | null>(null);

  const capabilities = useSelector(selectCapabilities);

  const isDeleteEnabled = useMemo(() => {
    const deleteFeature = capabilities.capabilities.find(
      (feature) => feature.name === 'Delete'
    );
    return deleteFeature?.capabilities?.every(
      (capability) => capability.enabled
    );
  }, [capabilities]);

  const {
    data: { definitions },
  } = useMatch<AppLocationGenerics>();

  const {
    data: modelCalculations,
    isFetching: isFetchingModelCalculations,
    isError: isErrorModelCalculations,
    refetch: refetchModelCalcList,
  } = useGetModelCalculationListQuery(
    {
      project,
      simulator,
      modelName,
    },
    {
      pollingInterval:
        shouldPoll || shouldPollOnDelete ? STATUS_POLLING_INTERVAL : undefined,
      refetchOnMountOrArgChange: true,
    }
  );

  const { data: modelFile, isFetching: isFetchingModelFile } =
    useGetModelFileQuery(
      { project, modelName, simulator },
      { skip: simulator === 'UNKNOWN' }
    );

  const isRunTriggered = useCallback(
    (externalId: string, lastUpdated?: Date | string) => {
      // if the run has not run before, or has not been triggered manually
      if (
        !lastUpdated ||
        triggeredRuns === undefined ||
        !(externalId in triggeredRuns)
      ) {
        return false;
      }
      const lastUpdatedDate =
        lastUpdated instanceof Date ? lastUpdated : parseISO(lastUpdated);
      // if its manually triggered and triggered time is later than last
      // updated time (ie run button pressed but new data not received yet)
      return (
        externalId in triggeredRuns &&
        triggeredRuns[externalId] >= lastUpdatedDate.getTime()
      );
    },
    [triggeredRuns]
  );

  // Check if any deletion is in progress from a different window/user/ refresh of page
  useEffect(() => {
    if (!isFetchingModelCalculations) {
      const isAnyCalcDeletionInProgress = Boolean(
        modelCalculations?.modelCalculationList.find(
          (calcConfig) =>
            'deletionStatus' in calcConfig &&
            !calcConfig.deletionStatus?.erroredResources?.length
        )
      );
      setShouldPollOnDelete(isAnyCalcDeletionInProgress);
    }
  }, [
    modelCalculations?.modelCalculationList,
    modelCalculations?.modelCalculationList.length,
    isFetchingModelCalculations,
  ]);

  // Refetch once deletion is complete
  useEffect(() => {
    if (isDeleteSuccess || isErrorModelCalculations) {
      refetchModelCalcList();
    }
  }, [isDeleteSuccess, refetchModelCalcList, isErrorModelCalculations]);

  useEffect(() => {
    if (!modelCalculations?.modelCalculationList) {
      return;
    }
    const hasReadyRunningOrTriggeredCalculation =
      !!modelCalculations.modelCalculationList.find(
        (calculation) =>
          calculation.latestRun?.metadata.status === 'ready' ||
          calculation.latestRun?.metadata.status === 'running' ||
          (calculation.latestRun?.lastUpdatedTime &&
            isRunTriggered(
              calculation.externalId,
              calculation.latestRun.lastUpdatedTime
            ))
      );

    if (hasReadyRunningOrTriggeredCalculation) {
      setShouldPoll(true);
      return;
    }

    setShouldPoll(false);
  }, [modelCalculations, isRunTriggered]);

  if (!isFetchingModelCalculations && !modelCalculations) {
    // Uninitialized state
    return null;
  }

  if (
    (isFetchingModelCalculations && !shouldPoll && !shouldPollOnDelete) ||
    !definitions ||
    !modelCalculations
  ) {
    return <Skeleton.List lines={4} borders />;
  }

  const calculationTypes = Object.keys(
    definitions.type.calculation
  ) as CalculationType[]; // Safe assertion

  const configuredCalculations = modelCalculations.modelCalculationList.map(
    (calculation) => calculation.configuration.calculationType
  );
  const nonConfiguredCalculations = calculationTypes.filter(
    (calculationType) =>
      !configuredCalculations.includes(calculationType) &&
      calculationType !== 'UserDefined'
  );

  const handleOnDeleteCalculationConfirm = async (
    isDeleteConfirmed: boolean,
    calculation: ModelCalculation
  ) => {
    // Close the model
    setIsDeleteConfirmModalOpen(false);

    // Not ready to delete
    if (!isDeleteConfirmed) {
      return;
    }

    // Used for showing "Deletion in progress"
    setDeletedExternalIds([...deletedExternalIds, calculation.externalId]);
    // Make the call to delete endpoint
    await deleteModelCalculation({
      project,
      simulator,
      modelName,
      calculationType: `${encodeURIComponent(
        calculation.configuration.calculationType
      )}` as CalculationType,
      userDefinedType: calculation.configuration.calcTypeUserDefined,
    });
  };

  const onRunClick =
    (
      calcType: CalculationType,
      calcTypeUserDefined: CalculationTypeUserDefined | undefined,
      externalId: string
    ) =>
    async () => {
      if (!authState?.email) {
        toast.error('No user email found, please refresh and try again');
        return;
      }

      trackUsage(TRACKING_EVENTS.MODEL_CALC_RUN_NOW, {
        calculationType: calcType,
        modelName: decodeURI(modelName),
        simulator,
      });

      const response = await runModelCalculations({
        modelName,
        project,
        simulator,
        runModelCalculationRequestModel: {
          userEmail: authState.email,
          calculationType: calcType,
          userDefinedType: calcTypeUserDefined,
        },
      });

      if (!isSuccessResponse(response)) {
        toast.error('Running calculation failed, try again');
        return;
      }
      setTriggeredRuns({
        ...triggeredRuns,
        [externalId]: new Date().getTime(),
      });
      setShouldPoll(true);
    };

  if (showConfigured) {
    const configuredCalculations = modelCalculations.modelCalculationList
      .slice()
      .sort(
        (
          { configuration: { calculationName: a } }: ModelCalculation,
          { configuration: { calculationName: b } }: ModelCalculation
        ) => a.localeCompare(b)
      );
    return !configuredCalculations.length ? (
      <GraphicContainer>
        <Graphic type="RuleMonitoring" /> No configured calculations
      </GraphicContainer>
    ) : (
      <ConfiguredCalculationList>
        {configuredCalculations.map((calculation) => (
          <React.Fragment key={calculation.externalId}>
            <Button
              className="run-calculation"
              disabled={
                calculation.latestRun?.metadata.status === 'ready' ||
                !!(
                  calculation.latestRun?.lastUpdatedTime &&
                  isRunTriggered(
                    calculation.externalId,
                    calculation.latestRun.lastUpdatedTime
                  )
                )
              }
              icon="Play"
              loading={calculation.latestRun?.metadata.status === 'running'}
              size="small"
              type="secondary"
              onClick={onRunClick(
                calculation.configuration.calculationType,
                calculation.configuration.calcTypeUserDefined,
                calculation.externalId
              )}
            >
              {calculation.latestRun?.metadata.status === 'running'
                ? 'Running'
                : 'Run now'}
            </Button>
            <span className="name">
              {calculation.configuration.calculationName}
              <CalculationDescriptionInfoDrawer
                calculation={calculation.configuration.calculationType}
              />
              {(calculation.deletionStatus &&
                !calculation.deletionStatus.erroredResources?.length) ||
              deletedExternalIds.includes(calculation.externalId) ? (
                <Label size="medium" variant="danger">
                  <Icon type="Loader" />
                  &nbsp;&nbsp; Deletion in progress
                </Label>
              ) : undefined}

              {!isFetchingModelFile &&
              modelFile?.metadata &&
              isBHPApproxMethodWarning(
                simulator,
                modelFile.metadata,
                calculation.configuration
              ) ? (
                <Tooltip
                  content={
                    <span>
                      This calculation uses PROSPER&apos;s &apos;BHP from
                      WHP&apos; calculation, which may not produce valid results
                      when the temperature model is not &apos;Rough
                      Approximation&apos;
                    </span>
                  }
                  position="right"
                  elevated
                  wrapped
                >
                  <Label icon="WarningTriangle" variant="warning" />
                </Tooltip>
              ) : undefined}
            </span>
            <span className="schedule">
              <CalculationScheduleIndicator
                schedule={calculation.configuration.schedule}
              />
            </span>
            <span className="run-type">
              <CalculationRunTypeIndicator
                runType={calculation.latestRun?.metadata.runType}
                userEmail={calculation.latestRun?.metadata.userEmail}
              />
            </span>
            <span className="status">
              <CalculationStatusIndicator
                status={calculation.latestRun?.metadata.status}
                statusMessage={calculation.latestRun?.metadata.statusMessage}
              />
            </span>
            <span className="menu">
              <Dropdown
                content={
                  <Menu>
                    <Menu.Item
                      onClick={() => {
                        if (calculation.configuration.calcTypeUserDefined) {
                          navigate({
                            to: `${encodeURIComponent(
                              calculation.configuration.calculationType
                            )}/${encodeURIComponent(
                              calculation.configuration.calcTypeUserDefined
                            )}`,
                          });
                        } else {
                          navigate({
                            to: encodeURIComponent(
                              calculation.configuration.calculationType
                            ),
                          });
                        }
                      }}
                    >
                      <Icon type="Info" /> Calculation details
                    </Menu.Item>
                    <Menu.Item
                      onClick={() => {
                        const { modelName, simulator, calculationType } =
                          calculation.configuration;

                        trackUsage(
                          TRACKING_EVENTS.MODEL_CALC_VIEW_RUN_HISTORY,
                          {
                            calculationType,
                            modelName,
                            simulator,
                          }
                        );

                        navigate({
                          to: '/calculations/runs',
                          search: {
                            modelName,
                            simulator,
                            calculationType,
                          },
                        });
                      }}
                    >
                      <Icon type="History" /> Calculation run history
                    </Menu.Item>
                    <Menu.Divider />
                    <Menu.Item
                      onClick={() => {
                        trackUsage(TRACKING_EVENTS.MODEL_CALC_EDIT, {
                          modelName: decodeURI(modelName),
                          simulator,
                          calculationType:
                            calculation.configuration.calculationType,
                        });
                        if (calculation.configuration.calcTypeUserDefined) {
                          navigate({
                            to: `${encodeURIComponent(
                              calculation.configuration.calculationType
                            )}/${encodeURIComponent(
                              calculation.configuration.calcTypeUserDefined
                            )}/configuration`,
                          });
                        } else {
                          navigate({
                            to: `${encodeURIComponent(
                              calculation.configuration.calculationType
                            )}/configuration`,
                          });
                        }
                      }}
                    >
                      <Icon type="Settings" /> Edit configuration
                    </Menu.Item>
                    {isDeleteEnabled ? (
                      <Menu.Item
                        onClick={() => {
                          setConfirmDeleteCalucation(calculation);
                          setIsDeleteConfirmModalOpen(true);
                        }}
                      >
                        <Icon type="Delete" /> Delete configuration
                      </Menu.Item>
                    ) : undefined}
                  </Menu>
                }
              >
                <Button
                  aria-label="Actions"
                  disabled={!!calculation.deletionStatus}
                  icon="EllipsisHorizontal"
                  size="small"
                />
              </Dropdown>
            </span>
          </React.Fragment>
        ))}
        <DeleteConfirmModal
          calculationConfig={confirmDeleteCalucation}
          handleModalConfirm={handleOnDeleteCalculationConfirm}
          isModelOpen={isDeleteConfirmModalOpen}
        />
      </ConfiguredCalculationList>
    );
  }

  return !nonConfiguredCalculations.length ? (
    <GraphicContainer>
      <Graphic type="RuleCreating" /> No non-configured calculations
    </GraphicContainer>
  ) : (
    <NonConfiguredCalculationList>
      {nonConfiguredCalculations
        .sort((a: CalculationType, b: CalculationType) => a.localeCompare(b))
        .map((calculationType) => (
          <React.Fragment key={calculationType}>
            <Link
              to={`${encodeURIComponent(calculationType)}/configuration`}
              onClick={() => {
                trackUsage(TRACKING_EVENTS.MODEL_CACL_CONFIG, {
                  modelName: decodeURI(modelName),
                  simulator,
                  calculationType,
                });
              }}
            >
              <Button
                className="configure-calculation"
                icon="Settings"
                size="small"
                type="tertiary"
              >
                Configure
              </Button>
            </Link>

            <span className="name">
              {definitions.type.calculation[calculationType]}
              <CalculationDescriptionInfoDrawer calculation={calculationType} />
            </span>
          </React.Fragment>
        ))}
    </NonConfiguredCalculationList>
  );
}

const ConfiguredCalculationList = styled.div`
  display: grid;
  grid-template-columns: 100px 1fr auto auto auto auto;
  grid-gap: 12px;
  align-items: center;
  .run-calculation {
    font-size: var(--cogs-detail-font-size);
  }
  .run-type,
  .run-type > * {
    display: flex;
    align-items: center;
  }
`;

const NonConfiguredCalculationList = styled.div`
  display: grid;
  grid-template-columns: 100px auto;
  grid-gap: 12px;
  align-items: center;
  .configure-calculation {
    font-size: var(--cogs-detail-font-size);
  }
`;
