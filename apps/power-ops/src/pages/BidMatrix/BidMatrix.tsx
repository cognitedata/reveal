import { DoubleDatapoint } from '@cognite/sdk';
import { useState, useEffect } from 'react';
import { Button, Tooltip, Detail } from '@cognite/cogs.js';
import { useAuthContext } from '@cognite/react-container';
import { Column } from 'react-table';
import { useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import {
  TableData,
  SequenceRow,
  PriceAreaWithData,
  MatrixWithData,
} from 'types';
import { calculateScenarioProduction, roundWithDec } from 'utils/utils';

import { formatBidMatrixData, copyMatrixToClipboard } from './utils';
import {
  StyledDiv,
  StyledHeader,
  StyledBidMatrix,
  StyledTable,
  Main,
  StyledTitle,
} from './elements';

dayjs.extend(utc);

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

  const { plantExternalId } = useParams<{ plantExternalId?: string }>();
  const [matrixHeaderConfig, setSequenceCols] = useState<Column<TableData>[]>();
  const [matrixData, setSequenceData] = useState<TableData[]>();
  const [matrix, setMatrix] = useState<MatrixWithData | null>();
  const [mainScenarioData, setMainScenarioData] = useState<TableData[]>();
  const [bidDate, setBidDate] = useState<Date>();

  const currentdate = new Date();
  currentdate.setDate(currentdate.getDate() + 1);
  const tomorrow = currentdate.toLocaleDateString();

  const [copied, setCopied] = useState<boolean>(false);
  const [tooltipContent, setTooltipContent] =
    useState<string>('Copy to clipboard');

  const updateMatrixData = async (
    matrix: MatrixWithData,
    scenariopPriceTsExternalId: string
  ) => {
    if (!matrix.sequenceRows?.length) return;
    setMatrix(matrix);

    const { columns, data } = await formatBidMatrixData(matrix.sequenceRows);
    setSequenceCols(columns);
    setSequenceData(data);

    if (!priceArea.bidDate) return;

    const tomorrow = dayjs.utc(bidDate).utcOffset(2, true).add(1, 'day');
    const priceTs = await client?.datapoints.retrieve({
      items: [{ externalId: scenariopPriceTsExternalId }],
      start: tomorrow.startOf('day').valueOf(),
      end: tomorrow.endOf('day').valueOf(),
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

  useEffect(() => {
    if (plantExternalId && priceArea) {
      setBidDate(priceArea.bidDate);
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
          (p) => p.plantExternalId === plant?.name
        );
        const production = priceArea.priceScenarios
          .find(
            (scenario) =>
              scenario.externalId === priceArea.mainScenarioExternalId
          )
          ?.plantProduction.find(
            (p) => p.plantExternalId === plant?.externalId
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

  return (
    <Main>
      <StyledDiv className="bidmatrix">
        <StyledHeader>
          <div>
            <span>
              <StyledTitle level={5}>
                Bidmatrix: {matrix?.externalId?.split('.')[0] || 'Not found'}
              </StyledTitle>
              {/* <Label size="small" variant="unknown">
                {matrix?.method}
              </Label> */}
            </span>
            <Detail>{`Generated for: ${tomorrow}`}</Detail>
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
            {/* TODO(POWEROPS-297):
            Replace with water value */}
            <div style={{ height: '16px' }} />
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
    </Main>
  );
};

export default BidMatrix;
