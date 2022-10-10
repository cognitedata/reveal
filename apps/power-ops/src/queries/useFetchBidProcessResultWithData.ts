import { BidProcessResult } from '@cognite/power-ops-api-types';
import { useFetchBidProcessResult } from 'queries/useFetchBidProcessResult';
import { useQuery } from 'react-query';
import { BidMatrixData, BidProcessResultWithData } from 'types';
import { fetchBidMatricesData } from 'utils/utils';
import { useAuthenticatedAuthContext } from '@cognite/react-container';

const getMatrixData = async (
  matrixExternalId: string,
  project: string,
  token: string
): Promise<BidMatrixData> => {
  const { data: serverData } = await fetchBidMatricesData(
    [matrixExternalId],
    project,
    token,
    'json'
  );
  const formattedData = {
    headerRow: serverData.headerRow,
    dataRows: serverData.dataRows,
  };
  return formattedData;
};

const fetchBidProcessResultWithData = async (
  project: string,
  token: string,
  bidProcessResult: BidProcessResult
): Promise<BidProcessResultWithData> => {
  const totalMatrixData = await getMatrixData(
    bidProcessResult.totalMatrix!.externalId,
    project,
    token
  );
  const bidProcessResultWithData: BidProcessResultWithData = {
    ...bidProcessResult,
    totalMatrixWithData: totalMatrixData,
    plantMatrixesWithData: bidProcessResult.plantMatrixes
      ? await Promise.all(
          bidProcessResult.plantMatrixes.map(async (plant) => {
            const plantMatrixData = await getMatrixData(
              plant.matrix!.externalId,
              project,
              token
            );
            return {
              ...plant,
              matrixWithData: plantMatrixData,
            };
          })
        )
      : [],
  };
  return bidProcessResultWithData;
};

export const useFetchBidProcessResultWithData = (
  priceAreaExternalId: string,
  bidProcessEventExternalId: string
) => {
  const { project, token } = useAuthenticatedAuthContext();
  const { data: bidProcessResult } = useFetchBidProcessResult(
    priceAreaExternalId,
    bidProcessEventExternalId
  );
  return useQuery({
    queryKey: [
      project,
      'bid-process-result-with-data',
      priceAreaExternalId,
      bidProcessEventExternalId,
    ],
    queryFn: () =>
      fetchBidProcessResultWithData(project, token, bidProcessResult!),
    enabled: Boolean(bidProcessResult),
  });
};
