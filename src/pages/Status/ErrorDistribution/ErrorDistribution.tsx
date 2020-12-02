import React, { useState, useContext, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import ApiContext from '../../../contexts/ApiContext';
import {
  ErrorDistributionObject,
  GenericResponseObject,
} from '../../../typings/interfaces';
import EmptyTableMessage from '../../../components/Molecules/EmptyTableMessage/EmptyTableMessage';
import { ChartContainer, Container } from './elements';

type Props = {
  afterTimestamp: number;
};

const ErrorDistribution = ({ afterTimestamp }: Props) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [psData, setPsData] = useState<ErrorDistributionObject[]>([]);
  const [owData, setOwData] = useState<ErrorDistributionObject[]>([]);
  const { api } = useContext(ApiContext);

  const psColors = ['#2B3A88', '#4A67FB', '#DBE1FE', '#A4B2FC'];
  const owColors = ['#FF6918', '#FF8746', '#FFE1D1', '#FFB38B'];

  useEffect(() => {
    setIsLoading(true);
    api!.sources
      .getErrorDistribution('Studio', afterTimestamp)
      .then((response) => {
        if (response.length === 0 || !response[0].error) {
          setPsData(response as ErrorDistributionObject[]);
        }
        setIsLoading(false);
      });
    api!.sources
      .getErrorDistribution('Openworks', afterTimestamp)
      .then((response: ErrorDistributionObject[] | GenericResponseObject[]) => {
        if (response.length === 0 || !response[0].error) {
          setOwData(response as ErrorDistributionObject[]);
        }
        setIsLoading(false);
      });
  }, [afterTimestamp, api]);

  const renderPie = (pieData: ErrorDistributionObject[], source: string) => {
    const data = {
      labels: pieData.map((item) => `${item.name}: ${item.total_errors}`),
      datasets: [
        {
          data: pieData.map((item) => item.total_errors),
          backgroundColor: source === 'Studio' ? psColors : owColors,
          hoverBackgroundColor: source === 'Studio' ? psColors : owColors,
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
      {isLoading ? (
        <EmptyTableMessage isLoading text="Loading" />
      ) : (
        <>
          {psData.length > 0 && (
            <ChartContainer>
              <h3>Petrel Studio to Openworks</h3>
              {renderPie(psData, 'Studio')}
            </ChartContainer>
          )}
          {owData.length > 0 && (
            <ChartContainer>
              <h3>Openworks to Petrel Studio</h3>
              {renderPie(owData, 'Openworks')}
            </ChartContainer>
          )}
        </>
      )}
    </Container>
  );
};

export default ErrorDistribution;
