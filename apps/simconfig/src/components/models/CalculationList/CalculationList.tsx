import React, { useContext, useEffect, useState } from 'react';
import { Link, useMatch, useNavigate } from 'react-location';
import { useSelector } from 'react-redux';

import styled from 'styled-components/macro';

import {
  Button,
  Dropdown,
  Graphic,
  Icon,
  Menu,
  Skeleton,
  toast,
} from '@cognite/cogs.js';
import type {
  CalculationType,
  Simulator,
} from '@cognite/simconfig-api-sdk/rtk';
import {
  useGetModelCalculationListQuery,
  useRunModelCalculationMutation,
} from '@cognite/simconfig-api-sdk/rtk';

import { GraphicContainer } from 'components/shared/elements';
import { CdfClientContext } from 'providers/CdfClientProvider';
import { selectProject } from 'store/simconfigApiProperties/selectors';
import { TRACKING_EVENTS } from 'utils/metrics/constants';
import { trackUsage } from 'utils/metrics/tracking';
import { isSuccessResponse } from 'utils/responseUtils';

import { CalculationRunTypeIndicator } from './CalculationRunTypeIndicator';
import { CalculationScheduleIndicator } from './CalculationScheduleIndicator';
import { CalculationStatusIndicator } from './CalculationStatusIndicator';
import { STATUS_POLLING_INTERVAL } from './constants';

import type { AppLocationGenerics } from 'routes';

interface CalculationListProps {
  simulator: Simulator;
  modelName: string;
  showConfigured?: boolean;
}

export function CalculationList({
  simulator,
  modelName,
  showConfigured = true,
}: CalculationListProps) {
  const project = useSelector(selectProject);
  const navigate = useNavigate();
  const [runModelCalculations] = useRunModelCalculationMutation();
  const { authState } = useContext(CdfClientContext);
  const [shouldPoll, setShouldPoll] = useState<boolean>(false);

  const {
    data: { definitions },
  } = useMatch<AppLocationGenerics>();

  const { data: modelCalculations, isFetching: isFetchingModelCalculations } =
    useGetModelCalculationListQuery(
      {
        project,
        simulator,
        modelName,
      },
      { pollingInterval: shouldPoll ? STATUS_POLLING_INTERVAL : undefined }
    );

  useEffect(() => {
    if (!modelCalculations?.modelCalculationList) {
      return;
    }
    const hasReadyOrRunningCalculation =
      !!modelCalculations.modelCalculationList.find(
        (calculation) =>
          calculation.latestRun?.metadata.status === 'ready' ||
          calculation.latestRun?.metadata.status === 'running'
      );

    if (hasReadyOrRunningCalculation) {
      setShouldPoll(true);
      return;
    }

    setShouldPoll(false);
  }, [modelCalculations]);

  if (!isFetchingModelCalculations && !modelCalculations) {
    // Uninitialized state
    return null;
  }

  if (
    (isFetchingModelCalculations && !shouldPoll) ||
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
    (calculationType) => !configuredCalculations.includes(calculationType)
  );

  const onRunClick = (calcType?: CalculationType) => async () => {
    if (!authState?.email) {
      toast.error('No user email found, please refresh and try again');
      return;
    }

    if (!calcType) {
      toast.error('Missing metadata, please refresh and try again');
      return;
    }

    const response = await runModelCalculations({
      modelName,
      project,
      simulator,
      runModelCalculationRequestModel: {
        userEmail: authState.email,
        calculationType: calcType,
      },
    });
    if (!isSuccessResponse(response)) {
      toast.error('Running calculation failed, try again');
    }
    setShouldPoll(true);
  };

  if (showConfigured) {
    return !modelCalculations.modelCalculationList.length ? (
      <GraphicContainer>
        <Graphic type="RuleMonitoring" /> No configured calculations
      </GraphicContainer>
    ) : (
      <ConfiguredCalculationList>
        {modelCalculations.modelCalculationList.map((calculation) => (
          <React.Fragment key={calculation.externalId}>
            <Button
              className="run-calculation"
              disabled={calculation.latestRun?.metadata.status === 'ready'}
              icon="Play"
              loading={calculation.latestRun?.metadata.status === 'running'}
              size="small"
              type="secondary"
              onClick={onRunClick(calculation.configuration.calculationType)}
            >
              {calculation.latestRun?.metadata.status === 'running'
                ? 'Running'
                : 'Run now'}
            </Button>
            <span className="name">
              {calculation.configuration.calculationName}
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
                        navigate({
                          to: encodeURIComponent(
                            calculation.configuration.calculationType
                          ),
                        });
                      }}
                    >
                      <Icon type="Info" /> Calculation details
                    </Menu.Item>
                    <Menu.Item
                      onClick={() => {
                        navigate({
                          to: '/calculations/runs',
                          search: {
                            modelName: calculation.configuration.modelName,
                            simulator: calculation.configuration.simulator,
                            calculationType:
                              calculation.configuration.calculationType,
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
                        navigate({
                          to: `${encodeURIComponent(
                            calculation.configuration.calculationType
                          )}/configuration`,
                        });
                      }}
                    >
                      <Icon type="Settings" /> Edit configuration
                    </Menu.Item>
                  </Menu>
                }
              >
                <Button
                  aria-label="Actions"
                  icon="EllipsisHorizontal"
                  size="small"
                />
              </Dropdown>
            </span>
          </React.Fragment>
        ))}
      </ConfiguredCalculationList>
    );
  }

  return !nonConfiguredCalculations.length ? (
    <GraphicContainer>
      <Graphic type="RuleCreating" /> No non-configured calculations
    </GraphicContainer>
  ) : (
    <NonConfiguredCalculationList>
      {nonConfiguredCalculations.map((calculationType) => (
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
