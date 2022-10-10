import { Button, Dropdown, Icon, Label, Menu } from '@cognite/cogs.js';
import { formatDate } from 'utils/utils';
import { BidProcessConfiguration } from '@cognite/power-ops-api-types';
import { useState } from 'react';

import {
  Header,
  VerticalSeparator,
  StyledTitle,
  MethodItem,
  MethodButton,
} from './elements';
import { formatMethod } from './utils';

interface Props {
  bidProcessExternalId: string;
  startDate: string | undefined;
  priceAreaName: string;
  processConfigurations: BidProcessConfiguration[];
  onChangeProcessConfigurationExternalId: (
    processConfigurationExternalId: string
  ) => void;
  onDownloadMatrix: (bidProcessExternalId: string) => Promise<void>;
}

export const PortfolioHeader = ({
  bidProcessExternalId,
  startDate,
  priceAreaName,
  processConfigurations,
  onChangeProcessConfigurationExternalId,
  onDownloadMatrix,
}: Props) => {
  const [downloading, setDownloading] = useState(false);
  return (
    <Header>
      <div>
        <StyledTitle level={5}>Price Area {priceAreaName}</StyledTitle>
        <Label size="small" variant="unknown">
          {startDate && <>Matrix generation started: {startDate}</>}
        </Label>
      </div>
      <div className="right-side">
        <Dropdown
          content={
            <Menu>
              {processConfigurations.map((config) => (
                <Menu.Item
                  selected={
                    config.bidProcessEventExternalId === bidProcessExternalId
                  }
                  key={config.bidProcessEventExternalId}
                  onClick={() =>
                    onChangeProcessConfigurationExternalId(
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
                      bidProcessExternalId && <Icon type="Checkmark" />}
                  </MethodItem>
                </Menu.Item>
              ))}
            </Menu>
          }
        >
          <MethodButton type="tertiary">
            <div className="method-name">
              <b>Method:&nbsp;</b>
              {bidProcessExternalId === '' && 'Loading...'}
              {formatMethod(
                processConfigurations.find(
                  (config) =>
                    config.bidProcessEventExternalId === bidProcessExternalId
                )?.bidProcessConfiguration ?? ''
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
          disabled={bidProcessExternalId === ''}
          onClick={async () => {
            setDownloading(true);
            await onDownloadMatrix(bidProcessExternalId);
            setDownloading(false);
          }}
        >
          Download
        </Button>
      </div>
    </Header>
  );
};
