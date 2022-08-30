import { CogniteEvent, DoubleDatapoint } from '@cognite/sdk';
import { useState, useEffect, useContext, MouseEvent } from 'react';
import { Button, Tooltip, Detail } from '@cognite/cogs.js';
import { useAuthContext } from '@cognite/react-container';
import { Column } from 'react-table';
import { useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { TableData, BidProcessResultWithData, MatrixWithData } from 'types';
import { EVENT_TYPES, DEFAULT_CONFIG } from '@cognite/power-ops-api-types';
import { EventStreamContext } from 'providers/eventStreamProvider';
import { HeadlessTable } from 'components/HeadlessTable';
import { useMetrics } from '@cognite/metrics';

import {
  StyledTitle,
  StyledDiv,
  StyledHeader,
  StyledBidMatrixTable,
  StyledPriceScenarioTable,
  Main,
  StyledInfobar,
} from './elements';
import {
  formatBidMatrixData,
  copyMatrixToClipboard,
  formatScenarioData,
  isNewBidMatrixAvailable,
} from './utils';

dayjs.extend(utc);
dayjs.extend(timezone);

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

export const BidMatrix = ({
  bidProcessResult,
}: {
  bidProcessResult: BidProcessResultWithData;
}) => {
  const metrics = useMetrics('bid-matrix');
  const { client } = useAuthContext();
  const { eventStore } = useContext(EventStreamContext);

  const { plantExternalId } = useParams<{ plantExternalId?: string }>();

  const [currentMatrix, setCurrentMatrix] = useState<MatrixWithData | null>();
  const [matrixHeaderConfig, setMatrixHeaderConfig] =
    useState<Column<TableData>[]>();
  const marketConfig: { [key: string]: string } = {
    tick_size:
      bidProcessResult.marketConfiguration?.tick_size ||
      DEFAULT_CONFIG.DECIMAL_POINTS,
    timezone:
      bidProcessResult.marketConfiguration?.timezone ||
      DEFAULT_CONFIG.TIME_ZONE,
  };
  const [matrixData, setMatrixData] = useState<TableData[]>();
  const [mainScenarioData, setMainScenarioData] = useState<TableData[]>();
  const [bidDate, setBidDate] = useState<dayjs.Dayjs>(
    dayjs(bidProcessResult.bidDate).tz(marketConfig.timezone)
  );
  const [newMatrixAvailable, setNewMatrixAvailable] = useState<boolean>(false);

  const [copied, setCopied] = useState<boolean>(false);
  const [tooltipContent, setTooltipContent] =
    useState<string>('Copy to clipboard');

  const updateMatrixData = async (
    matrix: MatrixWithData,
    scenarioPriceTsExternalId: string
  ) => {
    if (!matrix.columnHeaders?.length && matrix.dataRows?.length) return;
    setCurrentMatrix(matrix);

    if (matrix?.columnHeaders && matrix?.dataRows) {
      const { columns, data } = await formatBidMatrixData(
        matrix,
        marketConfig.tick_size
      );

      setMatrixHeaderConfig(columns);
      setMatrixData(data);

      if (!bidProcessResult.bidDate) return;

      const priceTs = await client?.datapoints.retrieve({
        items: [{ externalId: scenarioPriceTsExternalId }],
        start: bidDate.startOf('day').valueOf(),
        end: bidDate.endOf('day').valueOf(),
      });

      if (!priceTs?.length) return;

      const [{ datapoints: scenarioPricePerHour }] = priceTs;

      const scenarioData = await formatScenarioData(
        scenarioPricePerHour as DoubleDatapoint[],
        matrix
      );

      setMainScenarioData(scenarioData);
    }
  };

  const processEvent = async (event: CogniteEvent): Promise<void> => {
    if (event.type === EVENT_TYPES.PROCESS_FINISHED) {
      const status = isNewBidMatrixAvailable(
        event,
        bidProcessResult.bidProcessExternalId || ''
      );
      setNewMatrixAvailable(status);
    }
  };

  const getMatrixTitle = () => {
    if (plantExternalId !== 'total') {
      const plant = bidProcessResult.plants?.find(
        (p) => p.externalId === plantExternalId
      );
      return plant?.displayName || plantExternalId;
    }
    return 'Total';
  };

  const handleCopyBidMatrixClick = async (_e: MouseEvent) => {
    const isCopied =
      matrixHeaderConfig && matrixData
        ? await copyMatrixToClipboard(matrixHeaderConfig, matrixData)
        : false;

    setCopied(true);

    if (isCopied) setTooltipContent('Copied!');
    else setTooltipContent('Unable to copy');

    metrics.track('click-copy-bid-matrix-button', {
      matrixExternalId: currentMatrix?.externalId,
    });
  };

  const reloadMatrixData = async (_e: MouseEvent) => {
    metrics.track('click-reload-bid-matrix-button', {
      priceAreaExternalId: bidProcessResult.priceAreaExternalId,
    });
    window.location.reload();
  };

  useEffect(() => {
    if (plantExternalId && bidProcessResult) {
      setBidDate(dayjs(bidProcessResult.bidDate).tz(marketConfig.timezone));
      const priceExternalId = bidProcessResult.priceScenarios.find(
        (scenario) =>
          scenario.priceTsExternalId === bidProcessResult.mainScenarioExternalId
      )?.priceTsExternalId;
      if (!priceExternalId) return;

      const bidMatrix =
        plantExternalId === 'total'
          ? bidProcessResult.totalMatrixWithData
          : bidProcessResult.plantMatrixesWithData?.find(
              (p) =>
                p.plantName ===
                bidProcessResult.plants?.find(
                  (plant) => plant.externalId === plantExternalId
                )?.name
            )?.matrixWithData;

      if (bidMatrix) {
        updateMatrixData(bidMatrix, priceExternalId);
      }
    }
  }, [bidProcessResult, plantExternalId]);

  useEffect(() => {
    const subscription = eventStore?.subscribe(({ event }) => {
      processEvent(event);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [processEvent]);

  return (
    <Main>
      {newMatrixAvailable && (
        <StyledInfobar className="new-matrix">
          A new matrix is available. We recommend that you update this page.
          <Button
            type="tertiary"
            size="small"
            icon="Refresh"
            iconPlacement="right"
            onClick={reloadMatrixData}
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
                  Bid matrix: {getMatrixTitle()}
                </StyledTitle>
              </span>
              <Detail>{`Generated for ${bidDate.format('MMM DD, YYYY')} - ${
                currentMatrix?.externalId
              }`}</Detail>
            </div>
            <Tooltip position="left" visible={copied} content={tooltipContent}>
              <Button
                aria-label="Copy Bidmatrix"
                icon="Copy"
                onClick={handleCopyBidMatrixClick}
                onMouseEnter={() => {
                  setCopied(true);
                  setTooltipContent('Copy to clipboard');
                }}
                onMouseLeave={() => setCopied(false)}
              />
            </Tooltip>
          </StyledHeader>
          <StyledBidMatrixTable>
            {matrixHeaderConfig && matrixData && (
              <HeadlessTable
                tableHeader={matrixHeaderConfig}
                tableData={matrixData}
                className="bidmatrix"
              />
            )}
          </StyledBidMatrixTable>
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
          <StyledPriceScenarioTable>
            {mainScenarioTableHeaderConfig && mainScenarioData && (
              <HeadlessTable
                tableHeader={mainScenarioTableHeaderConfig}
                tableData={mainScenarioData || []}
                className="price-scenario"
              />
            )}
          </StyledPriceScenarioTable>
        </StyledDiv>
      </div>
    </Main>
  );
};
