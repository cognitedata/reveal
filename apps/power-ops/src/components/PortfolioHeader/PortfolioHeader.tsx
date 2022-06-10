import { Button, Dropdown, Icon, Label, Menu } from '@cognite/cogs.js';
import { useAuthContext } from '@cognite/react-container';
import { downloadBidMatrices, formatDate } from 'utils/utils';
import { PriceAreaWithData } from 'types';
import { useContext, useEffect, useState } from 'react';
import { CogniteClient } from '@cognite/sdk';
import { PriceAreasContext } from 'providers/priceAreaProvider';

import {
  Header,
  VerticalSeparator,
  StyledTitle,
  MethodItem,
  MethodButton,
} from './elements';
import { formatMethod } from './utils';

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

  const {
    allProcessConfigurations,
    bidProcessEventExternalId,
    bidProcessConfigurationChanged,
  } = useContext(PriceAreasContext);

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
      <div className="right-side">
        <Dropdown
          content={
            <Menu>
              {allProcessConfigurations?.map((config) => (
                <Menu.Item
                  selected={
                    config.bidProcessEventExternalId ===
                    bidProcessEventExternalId
                  }
                  key={config.bidProcessEventExternalId}
                  onClick={() =>
                    bidProcessConfigurationChanged(
                      config.bidProcessEventExternalId
                    )
                  }
                >
                  <MethodItem>
                    <div>
                      {formatMethod(config.configurationName)}
                      <p>
                        Process finished:{' '}
                        {new Date(
                          config.bidProcessFinshedDate
                        ).toLocaleTimeString('en-IT')}
                      </p>
                    </div>
                    {config.bidProcessEventExternalId ===
                      bidProcessEventExternalId && <Icon type="Checkmark" />}
                  </MethodItem>
                </Menu.Item>
              ))}
            </Menu>
          }
        >
          <MethodButton type="tertiary">
            <div className="method-name">
              <b>Method:&nbsp;</b>
              {formatMethod(
                allProcessConfigurations?.find(
                  (config) =>
                    config.bidProcessEventExternalId ===
                    bidProcessEventExternalId
                )?.configurationName || ''
              )}
            </div>
            <Icon type="ChevronDown" />
          </MethodButton>
        </Dropdown>
        <VerticalSeparator />
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
      </div>
    </Header>
  );
};
