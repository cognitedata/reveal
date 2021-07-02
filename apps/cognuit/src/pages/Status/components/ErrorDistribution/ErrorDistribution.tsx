import { FC } from 'react';
import { Pie } from 'react-chartjs-2';
import { ErrorDistributionObject, Source } from 'typings/interfaces';
import EmptyTableMessage from 'components/Molecules/EmptyTableMessage/EmptyTableMessage';
import { useSourceErrorDistributionQuery } from 'services/endpoints/sources/query';
import { ThirdPartySystems } from 'types/globalTypes';

import { ChartContainer, Container } from './elements';

interface Props {
  afterTimestamp: number;
}

const ErrorDistribution: FC<Props> = ({ afterTimestamp }) => {
  const psColors = ['#2B3A88', '#4A67FB', '#DBE1FE', '#A4B2FC'];
  const owColors = ['#FF6918', '#FF8746', '#FFE1D1', '#FFB38B'];

  const { data: psData, isLoading: psLoading } =
    useSourceErrorDistributionQuery({
      source: Source.STUDIO,
      after: afterTimestamp,
    });

  const { data: owData, isLoading: owLoading } =
    useSourceErrorDistributionQuery({
      source: Source.OPENWORKS,
      after: afterTimestamp,
    });

  const renderPie = (pieData: ErrorDistributionObject[], source: string) => {
    const data = {
      labels: pieData.map((item) => `${item.name}: ${item.total_errors}`),
      datasets: [
        {
          data: pieData.map((item) => item.total_errors),
          backgroundColor: source === Source.STUDIO ? psColors : owColors,
          hoverBackgroundColor: source === Source.STUDIO ? psColors : owColors,
          borderWidth: 0,
        },
      ],
    };

    return (
      <Pie
        data={data}
        options={{
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 12,
            },
          },
        }}
        height={200}
      />
    );
  };

  return (
    <Container>
      {psLoading || owLoading ? (
        <EmptyTableMessage isLoading text="Loading" />
      ) : (
        <>
          {psData.length > 0 && (
            <ChartContainer>
              <h3>
                {ThirdPartySystems.PS} to {ThirdPartySystems.OW}
              </h3>
              {renderPie(psData, Source.STUDIO)}
            </ChartContainer>
          )}
          {owData.length > 0 && (
            <ChartContainer>
              <h3>
                {ThirdPartySystems.OW} to {ThirdPartySystems.PS}
              </h3>
              {renderPie(owData, Source.OPENWORKS)}
            </ChartContainer>
          )}
        </>
      )}
    </Container>
  );
};

export default ErrorDistribution;
