import { CogniteEvent, DoubleDatapoint } from '@cognite/sdk';
import { useState, useEffect, useContext } from 'react';
import { Button, Tooltip, Detail } from '@cognite/cogs.js';
import { useAuthContext } from '@cognite/react-container';
import { Column } from 'react-table';
import { useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import {
  TableData,
  SequenceRow,
  PriceAreaWithData,
  MatrixWithData,
} from 'types';
import { calculateScenarioProduction, roundWithDec } from 'utils/utils';
import { SnifferEvent } from '@cognite/power-ops-api-types';
import { EventStreamContext } from 'providers/eventStreamProvider';

import { getFormattedBidMatrixData, copyMatrixToClipboard } from './utils';
import {
  StyledDiv,
  StyledHeader,
  StyledBidMatrix,
  StyledTable,
  MainPanel,
  StyledTitle,
  StyledInfobar,
} from './elements';

export const mainScenarioTableHeaderConfig = [
  {
    Header: 'Base Price',
    accessor: 'base',
  },
  {
    Header: 'Production',
    accessor: 'production',
  },
];

const BidMatrix = ({ priceArea }: { priceArea: PriceAreaWithData }) => {
  const { client } = useAuthContext();
  const { eventStore } = useContext(EventStreamContext);

  const { plantExternalId } = useParams<{ plantExternalId?: string }>();

  const [currentMatrix, setCurrentMatrix] = useState<MatrixWithData | null>();
  const [matrixHeaderConfig, setMatrixHeaderConfig] =
    useState<Column<TableData>[]>();
  const [matrixData, setMatrixData] = useState<TableData[]>();
  const [mainScenarioData, setMainScenarioData] = useState<TableData[]>();
  const [bidDate, setBidDate] = useState<dayjs.Dayjs>(dayjs(priceArea.bidDate));
  const [newMatrixAvailable, setNewMatrixAvailable] = useState<boolean>(false);

  const [copied, setCopied] = useState<boolean>(false);
  const [tooltipContent, setTooltipContent] =
    useState<string>('Copy to clipboard');

  const updateMatrixData = async (
    matrix: MatrixWithData,
    scenariopPriceTsExternalId: string
  ) => {
    if (!matrix.sequenceRows?.length) return;
    setCurrentMatrix(matrix);

    const { columns, data } = await getFormattedBidMatrixData(
      matrix.sequenceRows
    );
    setMatrixHeaderConfig(columns);
    setMatrixData(data);

    if (!priceArea.bidDate) return;

    const priceTs = await client?.datapoints.retrieve({
      items: [{ externalId: scenariopPriceTsExternalId }],
      start: bidDate.startOf('day').valueOf(),
      end: bidDate.endOf('day').valueOf(),
    });

    if (!priceTs?.length) return;

    const scenarioPricePerHour = (priceTs?.[0]?.datapoints ||
      []) as DoubleDatapoint[];

    const scenarioData = await formatScenarioData(
      scenarioPricePerHour,
      matrix.sequenceRows
    );

    setMainScenarioData(scenarioData);
  };

  const formatScenarioData = async (
    scenarioPricePerHour: DoubleDatapoint[],
    sequenceRows: SequenceRow[]
  ): Promise<{ id: number; base: number; production: number }[]> => {
    const dataArray: { id: number; base: number; production: number }[] = [];
    const production = calculateScenarioProduction(
      scenarioPricePerHour,
      sequenceRows
    );

    if (scenarioPricePerHour.length && production?.length) {
      for (
        let index = 0;
        index < Math.min(scenarioPricePerHour.length, production.length);
        index++
      ) {
        if (
          Number.isFinite(scenarioPricePerHour[index]?.value) &&
          Number.isFinite(production?.[index]?.value)
        )
          dataArray.push({
            id: index,
            base: roundWithDec(scenarioPricePerHour[index].value as number),
            production: roundWithDec(production[index].value as number),
          });
      }
    }
    return dataArray;
  };

  const isNewBidMatrixAvailable = async (
    processFinishEvent: CogniteEvent
  ): Promise<void> => {
    const parentProcessEventExternalId =
      processFinishEvent.metadata?.event_external_id;

    if (!parentProcessEventExternalId || !client) {
      return;
    }

    const [parentProcessEvent] = await client.events.retrieve([
      { externalId: parentProcessEventExternalId },
    ]);
    if (
      parentProcessEvent.type === 'POWEROPS_BID_PROCESS' &&
      parentProcessEvent.externalId !== priceArea.bidProcessExternalId
    ) {
      setNewMatrixAvailable(true);
    }
  };

  const processEvent = async (e: SnifferEvent): Promise<void> => {
    if (!e.id) return;

    const event = (await client?.events.retrieve([{ id: e.id }]))?.[0];
    if (!event) return;

    switch (event.type) {
      case 'POWEROPS_PROCESS_FINISHED':
        isNewBidMatrixAvailable(event);
        break;
    }
  };

  const getMatrixTitle = () => {
    if (plantExternalId !== 'total') {
      const plant = priceArea.plants?.find(
        (p) => p.externalId === plantExternalId
      );
      return plant?.displayName || plantExternalId;
    }
    return 'Total';
  };

  useEffect(() => {
    if (plantExternalId && priceArea) {
      setBidDate(dayjs(priceArea.bidDate));
      const priceExternalId = priceArea.priceScenarios.find(
        (scenario) => scenario.externalId === priceArea.mainScenarioExternalId
      )?.externalId;
      if (!priceExternalId) return;

      if (plantExternalId === 'total') {
        const matrixes = priceArea.totalMatrixesWithData;
        const production = priceArea.priceScenarios.find(
          (scenario) => scenario.externalId === priceArea.mainScenarioExternalId
        )?.totalProduction;

        // TODO(POWEROPS-223):
        // For now, we select always the first method available
        if (matrixes?.[0] && production?.[0]?.shopProductionExternalId) {
          updateMatrixData(matrixes[0], priceExternalId);
        }
      } else {
        const plant = priceArea.plants?.find(
          (p) => p.externalId === plantExternalId
        );
        // TODO(POWEROPS-111):
        // Rename plant variable to .name instead of .externalId
        const plantMatrixes = priceArea.plantMatrixesWithData?.find(
          (p) => p.plantName === plant?.name
        );
        const production = priceArea.priceScenarios
          .find(
            (scenario) =>
              scenario.externalId === priceArea.mainScenarioExternalId
          )
          ?.plantProduction.find(
            (p) => p.plantName === plant?.name
          )?.production;
        // TODO(POWEROPS-223):
        // For now, we select always the first method available
        if (
          plantMatrixes?.matrixesWithData[0] &&
          production?.[0]?.shopProductionExternalId
        ) {
          updateMatrixData(plantMatrixes?.matrixesWithData[0], priceExternalId);
        }
      }
    }
  }, [priceArea, plantExternalId]);

  useEffect(() => {
    const subscription = eventStore?.subscribe((event) => {
      processEvent(event);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [processEvent]);

  return (
    <MainPanel>
      {newMatrixAvailable && (
        <StyledInfobar className="new-matrix">
          A new matrix is available. We recommend that you update this page.
          <Button
            type="tertiary"
            size="small"
            icon="Refresh"
            iconPlacement="right"
            onClick={() => window.location.reload()}
          >
            Update matrix
          </Button>
        </StyledInfobar>
      )}
      <div className="main">
        <StyledDiv className="bidmatrix">
          <StyledHeader>
            <div>
              <span>
                <StyledTitle level={5}>
                  Bidmatrix: {getMatrixTitle()}
                </StyledTitle>
                {/* <Label size="small" variant="unknown">
                {matrix?.method}
              </Label> */}
              </span>
              <Detail>{`Generated for: ${bidDate.format('DD/MMM/YYYY Z')} - ${
                currentMatrix?.externalId
              }`}</Detail>
            </div>
            <Tooltip position="left" visible={copied} content={tooltipContent}>
              <Button
                aria-label="Copy Bidmatrix"
                icon="Copy"
                onClick={async () => {
                  const isCopied =
                    matrixHeaderConfig && matrixData
                      ? await copyMatrixToClipboard(
                          matrixHeaderConfig,
                          matrixData
                        )
                      : false;

                  // Change tooltip state
                  setCopied(true);

                  if (isCopied) setTooltipContent('Copied!');
                  else setTooltipContent('Unable to copy');
                }}
                onMouseEnter={() => {
                  setCopied(true);
                  setTooltipContent('Copy to clipboard');
                }}
                onMouseLeave={() => setCopied(false)}
              />
            </Tooltip>
          </StyledHeader>
          <StyledBidMatrix>
            {matrixHeaderConfig && matrixData && (
              <StyledTable
                tableHeader={matrixHeaderConfig}
                tableData={matrixData}
                className="bidmatrix"
              />
            )}
          </StyledBidMatrix>
        </StyledDiv>
        <StyledDiv className="price-scenario">
          <StyledHeader>
            <div>
              <span>
                <StyledTitle level={5}>Price Scenario</StyledTitle>
              </span>
              <Detail>
                {/* TODO(POWEROPS-297): Replace with water value */}
                <div style={{ height: '16px' }} />
                {/* <Label size="small" variant="unknown">
                Water value
                  155 NOK
                </Label> */}
              </Detail>
            </div>
          </StyledHeader>
          <StyledBidMatrix>
            {mainScenarioTableHeaderConfig && mainScenarioData && (
              <StyledTable
                tableHeader={mainScenarioTableHeaderConfig}
                tableData={mainScenarioData || []}
                className="price-scenario"
              />
            )}
          </StyledBidMatrix>
        </StyledDiv>
      </div>
    </MainPanel>
  );
};

export default BidMatrix;
