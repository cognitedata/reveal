import { Button, Label } from '@cognite/cogs.js';
import { useAuthContext } from '@cognite/react-container';
import { downloadBidMatrices } from 'utils/utils';
import { PriceAreaWithData } from 'types';
import { useState } from 'react';

import { Header, StyledTitle } from './elements';

export const PortfolioHeader = ({
  priceArea,
}: {
  priceArea: PriceAreaWithData;
}) => {
  const { client } = useAuthContext();
  const { authState } = useAuthContext();

  const startDate = priceArea
    ? new Date(priceArea?.totalMatrixes?.[0].startTime).toLocaleString()
    : undefined;

  const [downloading, setDownloading] = useState<boolean>(false);

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
