import { Button, Dropdown, Icon, Label, Menu } from '@cognite/cogs.js';
import { useAuthContext } from '@cognite/react-container';
import { downloadBidMatrices, formatDate } from 'utils/utils';
import { DEFAULT_CONFIG } from '@cognite/power-ops-api-types';
import { BidProcessResultWithData } from 'types';
import { MouseEvent, useContext, useEffect, useState } from 'react';
import { CogniteClient } from '@cognite/sdk';
import { PriceAreasContext } from 'providers/priceAreaProvider';
import { useMetrics } from '@cognite/metrics';

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
  client: CogniteClient | undefined,
  timeZone: string | undefined
) => {
  const [startDate, setStartDate] = useState<string>('');

  const getStartDate = (): void => {
    if (!client || !externalId) return;

    client.events
      .retrieve([{ externalId }], {
        ignoreUnknownIds: true,
      })
      .then(([event]) => {
        setStartDate(
          formatDate(event.createdTime, timeZone || DEFAULT_CONFIG.TIME_ZONE)
        );
      });
  };

  useEffect(() => getStartDate(), []);

  return { startDate, getStartDate };
};

export const PortfolioHeader = ({
  bidProcessResult,
}: {
  bidProcessResult: BidProcessResultWithData;
}) => {
  const metrics = useMetrics('portfolio');

  const { client, authState } = useAuthContext();

  const {
    allProcessConfigurations,
    bidProcessEventExternalId,
    bidProcessConfigurationChanged,
  } = useContext(PriceAreasContext);

  const [downloading, setDownloading] = useState<boolean>(false);

  const { startDate, getStartDate } = useBidMatrixProcessStartDate(
    bidProcessResult?.bidProcessExternalId,
    client,
    bidProcessResult.marketConfiguration?.timezone
  );

  const downloadMatrix = async (_e: MouseEvent) => {
    setDownloading(true);
    await downloadBidMatrices(
      bidProcessResult,
      client?.project,
      authState?.token
    );
    setDownloading(false);
    metrics.track(`click-download-matrices-button`, {
      bidProcessExternalId: bidProcessResult.bidProcessExternalId,
    });
  };

  const selectProcessConfiguration = async (
    _e: MouseEvent,
    selectedConfigurationExternalId: string
  ) => {
    bidProcessConfigurationChanged(selectedConfigurationExternalId);
    metrics.track(`click-process-configuration-dropdown`, {
      selectedConfiguration: selectedConfigurationExternalId,
    });
  };

  useEffect(() => {
    if (bidProcessResult?.bidProcessExternalId) {
      getStartDate();
    }
  }, [bidProcessResult]);

  return (
    <Header>
      <div>
        <StyledTitle level={5}>
          Price Area {bidProcessResult.priceAreaName}
        </StyledTitle>
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
                  onClick={(e) =>
                    selectProcessConfiguration(
                      e,
                      config.bidProcessEventExternalId
                    )
                  }
                >
                  <MethodItem>
                    <div>
                      {formatMethod(config.bidProcessConfiguration)}
                      <p>
                        Process finished:{' '}
                        {formatDate(
                          config.bidProcessFinishedDate.toLocaleString()
                        )}
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
                )?.bidProcessConfiguration || ''
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
          onClick={downloadMatrix}
        >
          Download
        </Button>
      </div>
    </Header>
  );
};
