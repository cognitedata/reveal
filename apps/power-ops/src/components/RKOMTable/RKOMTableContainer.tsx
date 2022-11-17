import { Loader } from '@cognite/cogs.js';
import { RkomFilterType } from '@cognite/power-ops-api-types';
import { CommonError } from 'components/CommonError/CommonError';
import { Main } from 'components/RKOMTable/elements';
import { RKOMTable } from 'components/RKOMTable/RKOMTable';
import dayjs from 'dayjs';
import { useFetchRKOMBids } from 'queries/useFetchRKOMBids';
import { RKOMTableData } from 'types';
import { formatDate } from 'utils/utils';

type Props = {
  filter?: RkomFilterType;
  onSelectBid: (bids: Record<string, string>) => void;
};

export const RKOMTableContainer = ({ onSelectBid, filter }: Props) => {
  const { data: rkomBids, status, refetch } = useFetchRKOMBids(filter);

  if (status === 'loading')
    return <Loader infoTitle="Loading RKOM Bids" darkMode={false} />;

  if (status === 'error')
    return (
      <Main style={{ justifyContent: 'center' }}>
        <CommonError
          title="Oops!"
          buttonText="Reload Data"
          onButtonClick={() => refetch()}
        >
          We weren’t able to fetch any data.
          <br />
          Try reloading the page.
        </CommonError>
      </Main>
    );

  if (rkomBids.length === 0)
    return (
      <Main style={{ justifyContent: 'center' }}>
        <CommonError title="No results found">
          We weren’t able to find any RKOM bids.
          <br />
          Try adjusting the applied filters.
        </CommonError>
      </Main>
    );

  return (
    <Main>
      <RKOMTable
        data={rkomBids.reduce((data, bid) => {
          let waterCourseIndex = data.findIndex(
            (row) => row.name === bid.watercourseName
          );
          if (waterCourseIndex === -1) {
            data.push({
              name: bid.watercourseName,
              subRows: [],
            });
            waterCourseIndex = data.length - 1;
          }
          data[waterCourseIndex]?.subRows.push({
            watercourseName: bid.watercourseName,
            name: bid.configurationName,
            generationDate: formatDate(bid.createdTime),
            bidDate: dayjs(bid.bidDate).format('MMM DD, YYYY'),
            minimumPrice: String(bid.priceMinimum),
            premiumPrice: String(bid.pricePremium),
            subRows: [
              {
                sequenceExternalId: bid.sequenceExternalId,
              },
            ],
          });

          return data;
        }, [] as RKOMTableData)}
        onSelectBid={onSelectBid}
      />
    </Main>
  );
};
