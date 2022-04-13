import { Datapoints } from '@cognite/sdk';
import { useState, useEffect } from 'react';
import { Button, Tooltip, Label, Detail } from '@cognite/cogs.js';
import { useAuthContext } from '@cognite/react-container';
import { Column } from 'react-table';
import { useParams } from 'react-router-dom';
import {
  Matrix,
  PriceArea,
  ProductionValues,
} from '@cognite/power-ops-api-types';
import { TableData } from 'types';

import {
  getBidMatrixData,
  formatBidMatrixData,
  copyMatrixToClipboard,
} from './utils';
import {
  StyledDiv,
  StyledHeader,
  StyledBidMatrix,
  StyledTable,
  MainPanel,
  StyledTitle,
} from './elements';

export const tableHeaderConfig = [
  {
    Header: 'Base Price',
    accessor: 'base',
  },
  {
    Header: 'Prod',
    accessor: 'production',
  },
];

const BidMatrix = ({ priceArea }: { priceArea: PriceArea }) => {
  const { client } = useAuthContext();

  const { plantExternalId } = useParams<{ plantExternalId?: string }>();
  const [sequenceCols, setSequenceCols] = useState<Column<TableData>[]>();
  const [sequenceData, setSequenceData] = useState<TableData[]>();
  const [matrix, setMatrix] = useState<Matrix | null>();
  const [mainScenarioData, setMainScenarioData] = useState<TableData[]>();

  const currentdate = new Date();
  currentdate.setDate(currentdate.getDate() + 1);
  const tomorrow = currentdate.toLocaleDateString();

  const [copied, setCopied] = useState<boolean>(false);
  const [tooltipContent, setTooltipContent] =
    useState<string>('Copy to clipboard');

  const updateMatrixData = async (matrixExternalId: string) => {
    const sequenceRows = await getBidMatrixData(client, matrixExternalId);
    if (!sequenceRows?.length) return;

    const { columns, data } = await formatBidMatrixData(sequenceRows);
    setSequenceCols(columns);
    setSequenceData(data);
  };

  const formatMainScenarioData = async (productionValues: ProductionValues) => {
    const datapoints = await client?.datapoints.retrieve({
      items: [
        { externalId: productionValues.marketProductionExternalId },
        { externalId: productionValues.calculatedProductionExternalId },
      ],
    });

    if (datapoints) {
      const [prices, productions] = datapoints as Datapoints[];
      if (prices?.datapoints.length && productions?.datapoints.length) {
        const dataArray = [];
        for (
          let index = 0;
          index <
          Math.min(prices.datapoints.length, productions.datapoints.length);
          index++
        ) {
          if (
            prices?.datapoints?.[index]?.value &&
            productions?.datapoints?.[index]?.value
          )
            dataArray.push({
              id: index,
              base: Math.round(prices.datapoints[index].value as number),
              production: Math.round(
                productions.datapoints[index].value as number
              ),
            });
        }
        setMainScenarioData(dataArray);
      }
    }
  };

  useEffect(() => {
    if (matrix?.externalId) updateMatrixData(matrix?.externalId);
  }, [matrix]);

  useEffect(() => {
    if (plantExternalId && priceArea) {
      if (plantExternalId === 'total') {
        const matrixes = priceArea.totalMatrixes;
        const productionValues = priceArea.priceScenarios.find(
          (scenario) => scenario.id === priceArea.mainScenarioId
        )?.totalProductionValues;

        // TODO(POWEROPS-223):
        // For now, we select always the first method available
        if (matrixes?.[0]) setMatrix(matrixes[0]);
        if (productionValues?.[0]) formatMainScenarioData(productionValues[0]);
      } else {
        const plant = priceArea.plants?.find(
          (p) => p.externalId === plantExternalId
        );
        const plantMatrixes = priceArea.plantMatrixes?.find(
          (p) => p.plantId === plant?.id
        );
        const productionValues = priceArea.priceScenarios
          .find((scenario) => scenario.id === priceArea.mainScenarioId)
          ?.plantProductionValues.find(
            (p) => p.plantId === plant?.id
          )?.productionValues;
        // TODO(POWEROPS-223):
        // For now, we select always the first method available
        if (plantMatrixes?.matrixes[0]) setMatrix(plantMatrixes?.matrixes[0]);
        if (productionValues?.[0]) formatMainScenarioData(productionValues[0]);
      }
    }
  }, [priceArea, plantExternalId]);

  return (
    <MainPanel>
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
                  sequenceCols && sequenceData
                    ? await copyMatrixToClipboard(sequenceCols, sequenceData)
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
          {sequenceCols && sequenceData && (
            <StyledTable
              tableHeader={sequenceCols}
              tableData={sequenceData}
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
              Water value
              <Label size="small" variant="unknown">
                155 NOK
              </Label>
            </Detail>
          </div>
        </StyledHeader>
        <StyledBidMatrix>
          <StyledTable
            tableHeader={tableHeaderConfig}
            tableData={mainScenarioData || []}
            className="price-scenario"
          />
        </StyledBidMatrix>
      </StyledDiv>
    </MainPanel>
  );
};

export default BidMatrix;
