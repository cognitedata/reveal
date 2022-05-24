import { Button, Label } from '@cognite/cogs.js';
import { useAuthContext } from '@cognite/react-container';
import { downloadBidMatrices, formatDate } from 'utils/utils';
import { PriceAreaWithData } from 'types';
import { useEffect, useState } from 'react';
import { CogniteClient } from '@cognite/sdk';

import { Header, StyledTitle } from './elements';

export const useBidMatrixProcessStartDate = (
  externalId: string | undefined,
  client: CogniteClient | undefined
) => {
  const [startDate, setStartDate] = useState<string>('');

  const getStartDate = (): void => {
    if (!client || !externalId) return;

    client.events
      .retrieve([{ externalId }], {
        ignoreUnknownIds: true,
      })
      .then(([event]) => {
        setStartDate(formatDate(event.createdTime));
      });
  };

  useEffect(() => getStartDate(), []);

  return { startDate, getStartDate };
};

export const PortfolioHeader = ({
  priceArea,
}: {
  priceArea: PriceAreaWithData;
}) => {
  const { client } = useAuthContext();
  const { authState } = useAuthContext();

  const [downloading, setDownloading] = useState<boolean>(false);

  const { startDate, getStartDate } = useBidMatrixProcessStartDate(
    priceArea?.bidProcessExternalId,
    client
  );

  useEffect(() => {
    if (priceArea?.bidProcessExternalId) {
      getStartDate();
    }
  }, [priceArea]);

  return (
    <Header>
      <div>
        <StyledTitle level={5}>Price Area {priceArea.name}</StyledTitle>
        <Label size="small" variant="unknown">
          {`Matrix generation started: ${startDate}`}
        </Label>
      </div>
      <Button
        icon="Download"
        type="primary"
        loading={downloading}
        onClick={async () => {
          setDownloading(true);
          await downloadBidMatrices(
            priceArea,
            client?.project,
            authState?.token
          );
          setDownloading(false);
        }}
      >
        Download
      </Button>
    </Header>
  );
};
