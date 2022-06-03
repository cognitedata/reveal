import type { Reducer } from 'react';
import { useEffect, useMemo, useReducer } from 'react';
import { Link, useMatch } from 'react-location';

import { ParentSizeModern } from '@visx/responsive';

import styled from 'styled-components/macro';

import { Button, Collapse, Skeleton, toast } from '@cognite/cogs.js';
import { useAuthContext } from '@cognite/react-container';
import type { CogniteEvent } from '@cognite/sdk';
import type { CalculationRunMetadata } from '@cognite/simconfig-api-sdk/rtk';

import type { CalculationResultDatum } from 'components/charts/CalculationResultChart';
import { CalculationResultChart } from 'components/charts/CalculationResultChart';
import { CalculationRunTypeIndicator } from 'components/models/CalculationList/CalculationRunTypeIndicator';
import { CalculationStatusIndicator } from 'components/models/CalculationList/CalculationStatusIndicator';
import { CalculationTimeLabel } from 'components/models/CalculationList/CalculationTimeLabel';
import type { ValueUnitType } from 'components/shared/PropertyGrid';
import { ValueUnitGrid } from 'components/shared/PropertyGrid';
import { recordsToDsv } from 'utils/stringUtils';

import type { AppLocationGenerics } from 'routes';

export function CalculationRunDetails() {
  const { client } = useAuthContext();
  const {
    params: { runId },
    search: { sourceQuery },
  } = useMatch<
    AppLocationGenerics & { Search: { sourceQuery: Record<string, string> } }
  >();
  const [state, dispatch] = useReducer<
    Reducer<CalculationRunState, CalculationRunAction>
  >(calculationRunReducer, getCalculationRunInitialState());

  useEffect(() => {
    async function loadCalculation() {
      if (!client) {
        return;
      }

      const getSequenceRows = async (
        externalId?: string,
        start?: number | string,
        end?: number | string
      ) =>
        (
          await client.sequences.retrieveRows({
            externalId: externalId ?? '',
            start: +(start ?? ''),
            end: +(end ?? ''),
          })
        ).items;

      const [run] = await client.events.retrieve([
        {
          id: +runId,
        },
      ]);

      dispatch({
        run,
        isChartEnabled: run.subtype === 'Rate by Nodal Analysis',
      });

      if (
        run.metadata?.outputResultsRowStart !==
        run.metadata?.outputResultsRowEnd
      ) {
        const outputResults = (
          await getSequenceRows(
            run.metadata?.outputResultsSequence,
            run.metadata?.outputResultsRowStart,
            +(run.metadata?.outputResultsRowEnd ?? 0) + 1
          )
        ).reduce<ValueUnitType>(
          (acc, [label, value, unit]) =>
            label && value && unit
              ? { ...acc, [label]: { value: +value, unit: unit.toString() } }
              : acc,
          {}
        );

        dispatch({ results: outputResults });
      }

      if (!state.isChartEnabled) {
        return;
      }

      // XXX Specific to Rate by Nodal Analysis:

      const outputCurves = await getSequenceRows(
        run.metadata?.outputCurvesSequence,
        run.metadata?.outputCurvesRowStart,
        +(run.metadata?.outputCurvesRowEnd ?? 0) + 1
      );
      const { columns } = outputCurves[0];

      const gasRateColumn =
        columns.find((column) =>
          column.name?.toLowerCase().startsWith('gas rate')
        )?.name ?? '';
      const iprColumn =
        columns.find((column) =>
          column.name?.toLowerCase().startsWith('ipr pressure')
        )?.name ?? '';
      const vlpColumn =
        columns.find((column) =>
          column.name?.toLowerCase().startsWith('vlp pressure')
        )?.name ?? '';

      const curveTable = outputCurves.map((row) =>
        row.reduce<Record<string, number>>(
          (acc, cur, i) => ({
            ...acc,
            [columns[i].name ?? 'n/a']: +(cur ?? 0),
          }),
          {}
        )
      );

      dispatch({
        curveTable,
        data: curveTable.map((row) => ({
          gasRate: row[gasRateColumn] || 0,
          ipr: row[iprColumn] || 0,
          vlp: row[vlpColumn] || 0,
        })),
        axisLabels: {
          x: gasRateColumn,
          y: iprColumn.replace('IPR', '').trim(),
        },
      });
    }
    void loadCalculation();
  }, [client, runId, state.isChartEnabled]);

  const chart = useMemo(
    () =>
      state.data.length ? (
        <ParentSizeModern>
          {({ width, height }) => (
            <CalculationResultChart
              data={state.data}
              height={height}
              width={width}
              xAxisLabel={state.axisLabels?.x}
              yAxisLabel={state.axisLabels?.y}
            />
          )}
        </ParentSizeModern>
      ) : (
        <Skeleton.Rectangle height="300px" />
      ),
    [state]
  );

  // XXX Specific to Rate by Nodal Analysis
  const mainResultFields = [
    'Solution Node Pressure',
    'Gas Rate',
    'Liquid Rate',
    'Oil Rate',
    'Water Rate',
  ];

  const results = state.results
    ? Object.entries(state.results).reduce<{
        main: ValueUnitType;
        additional: ValueUnitType;
      }>(
        ({ main, additional }, [key, value]) =>
          mainResultFields.includes(key)
            ? {
                additional,
                main: { ...main, [key]: value },
              }
            : {
                main,
                additional: { ...additional, [key]: value },
              },
        {
          main: {},
          additional: {},
        }
      )
    : undefined;

  if (!state.run || !state.run.metadata) {
    return (
      <CalculationDetailsContainer>
        <Skeleton.List lines={1} />
        <Skeleton.Rectangle height="300px" />
        <Skeleton.List lines={5} />
      </CalculationDetailsContainer>
    );
  }

  const metadata = state.run.metadata as unknown as CalculationRunMetadata;
  const timestamps = {
    calcTime: metadata.calcTime,
    createdTime: state.run.createdTime,
    endTime: state.run.endTime,
    lastUpdatedTime: state.run.lastUpdatedTime,
    startTime: state.run.startTime,
  };

  return (
    <CalculationDetailsContainer>
      <CalculationHeader>
        <h2>
          <strong>{metadata.modelName}</strong> {metadata.calcName}
        </h2>

        <div className="navigation">
          <Link
            to={`/model-library/models/${encodeURIComponent(
              metadata.simulator
            )}/${encodeURIComponent(metadata.modelName)}`}
          >
            <Button icon="DataSource" type="tertiary">
              View model
            </Button>
          </Link>
          <Link search={sourceQuery} to="..">
            <Button icon="ArrowLeft" type="secondary">
              Return to run browser
            </Button>
          </Link>
        </div>
      </CalculationHeader>

      <CalculationDetails>
        <CalculationRunTypeIndicator
          runType={metadata.runType}
          userEmail={metadata.userEmail}
        />

        <CalculationStatusIndicator
          status={metadata.status}
          statusMessage={metadata.statusMessage}
        />

        <span className="date">
          <CalculationTimeLabel {...timestamps} />
        </span>

        {state.curveTable.length && (
          <Button
            icon="Copy"
            size="small"
            type="tertiary"
            onClick={async () => {
              if (!state.curveTable.length) {
                return;
              }
              await navigator.clipboard.writeText(
                recordsToDsv(state.curveTable)
              );

              toast.info('Result curves (tab separated) copied to clipboard.');
            }}
          >
            Copy result curves to clipboard
          </Button>
        )}
      </CalculationDetails>

      {state.isChartEnabled ? (
        <>
          <div style={{ height: '300px' }}>{chart}</div>
          {results?.main ? <ValueUnitGrid entries={results.main} /> : null}
        </>
      ) : null}

      {results?.additional ? (
        <Collapse defaultActiveKey="additional-results">
          <Collapse.Panel
            extra={
              <Button
                icon="Copy"
                size="small"
                type="tertiary"
                onClick={async (ev) => {
                  ev.preventDefault();
                  ev.stopPropagation();
                  const resultsTable = Object.entries(results.additional).map(
                    ([
                      field,
                      { value, unit } = {
                        value: 'n/a',
                        unit: 'n/a',
                      },
                    ]) => ({ field, value, unit })
                  );
                  await navigator.clipboard.writeText(
                    recordsToDsv(resultsTable)
                  );

                  toast.info(
                    'Calculation results table (tab separated) copied to clipboard.'
                  );
                }}
              >
                Copy calculation results to clipboard
              </Button>
            }
            header="Additional calculation results"
            key="additional-results"
          >
            <ValueUnitGrid entries={results.additional} />
          </Collapse.Panel>
        </Collapse>
      ) : null}
    </CalculationDetailsContainer>
  );
}

interface CalculationRunState {
  data: (CalculationResultDatum & Record<string, number>)[];
  results?: ValueUnitType;
  run?: CogniteEvent;
  axisLabels?: {
    x?: string;
    y?: string;
  };
  curveTable: Record<string, number>[];
  isChartEnabled: boolean;
}

type CalculationRunAction = Partial<CalculationRunState>;

const calculationRunReducer = (
  state: CalculationRunState,
  action: CalculationRunAction
) => ({ ...state, ...action });

const getCalculationRunInitialState = (
  state?: CalculationRunState
): CalculationRunState => ({
  data: [],
  curveTable: [],
  isChartEnabled: false,
  ...state,
});

const CalculationDetailsContainer = styled.main`
  padding: 24px;
  h2 {
    display: flex;
    align-items: center;
    column-gap: 12px;
    span:last-of-type {
      flex: 1 1 auto;
    }
  }
`;

const CalculationHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  column-gap: 24px;
  h2 {
    margin: 0;
  }
  .navigation {
    column-gap: 12px;
    display: flex;
    align-items: center;
  }
`;

const CalculationDetails = styled.div`
  margin: 12px 0 24px 0;
  display: flex;
  align-items: center;
  column-gap: 6px;
  .cogs-tooltip__content {
    display: flex;
    align-items: center;
    column-gap: 6px;
  }
`;
