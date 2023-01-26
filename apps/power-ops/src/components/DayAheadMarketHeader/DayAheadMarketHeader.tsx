import { Button, Dropdown, Icon, Menu, Modal } from '@cognite/cogs.js-v9';
import { formatDate } from 'utils/utils';
import { BidProcessConfiguration } from '@cognite/power-ops-api-types';
import { CommonHeader } from 'components/CommonHeader/CommonHeader';

import { VerticalSeparator, MethodItem, MethodButton } from './elements';
import { formatMethod } from './utils';

interface Props {
  bidProcessExternalId: string;
  startDate: string | undefined;
  priceAreaName: string;
  processConfigurations: BidProcessConfiguration[];
  showConfirmDownloadModal: boolean;
  downloading: boolean;
  onChangeShowConfirmDownloadModal: (isVisible: boolean) => void;
  onChangeProcessConfigurationExternalId: (
    processConfigurationExternalId: string
  ) => void;
  onDownloadMatrix: (bidProcessExternalId: string) => Promise<void>;
  onDownloadButtonClick: () => Promise<void>;
  showRightSide: boolean;
}

export const DayAheadMarketHeader = ({
  bidProcessExternalId,
  startDate,
  priceAreaName,
  downloading,
  processConfigurations,
  showConfirmDownloadModal,
  onChangeShowConfirmDownloadModal,
  onChangeProcessConfigurationExternalId,
  onDownloadMatrix,
  onDownloadButtonClick,
  showRightSide = true,
}: Props) => {
  return (
    <>
      <Modal
        getContainer={() =>
          document.getElementById('root') ?? document.documentElement
        }
        visible={showConfirmDownloadModal}
        title="Are you sure you want to download this bid?"
        okText="Download anyway"
        onCancel={() => onChangeShowConfirmDownloadModal(false)}
        onOk={async () => {
          onChangeShowConfirmDownloadModal(false);
          await onDownloadMatrix(bidProcessExternalId);
        }}
      >
        We have registered high shop run penalties for this bid and would advise
        against downloading and sending it. Are you sure you want to proceed?
      </Modal>
      <CommonHeader
        title={`Price Area ${priceAreaName}`}
        titleLabel={`Matrix generation started: ${startDate}`}
      >
        {showRightSide ? (
          <>
            <div>
              <Dropdown
                hideOnSelect
                content={
                  <Menu data-testid="method-selector-menu">
                    {processConfigurations.map((config, i) => (
                      <Menu.Item
                        toggled={
                          config.bidProcessEventExternalId ===
                          bidProcessExternalId
                        }
                        key={config.bidProcessEventExternalId}
                        onClick={() =>
                          onChangeProcessConfigurationExternalId(
                            config.bidProcessEventExternalId
                          )
                        }
                        data-testid={`method-selector-menu-item-${i}`}
                        css={{}}
                      >
                        <MethodItem>
                          <div>
                            {formatMethod(config.bidProcessConfiguration)}
                            <p>
                              Process started:{' '}
                              {config.bidProcessStartedDate &&
                                formatDate(
                                  config.bidProcessStartedDate.toLocaleString()
                                )}
                            </p>
                          </div>
                        </MethodItem>
                      </Menu.Item>
                    ))}
                  </Menu>
                }
              >
                <MethodButton type="tertiary" data-testid="method-button">
                  <div className="method-name">
                    <b>Method:&nbsp;</b>
                    {bidProcessExternalId === '' && 'Loading...'}
                    {formatMethod(
                      processConfigurations.find(
                        (config) =>
                          config.bidProcessEventExternalId ===
                          bidProcessExternalId
                      )?.bidProcessConfiguration ?? ''
                    )}
                  </div>
                  <Icon type="ChevronDown" />
                </MethodButton>
              </Dropdown>
            </div>
            <VerticalSeparator />
            <Button
              data-testid="download-button"
              icon="Download"
              type="primary"
              loading={downloading}
              disabled={bidProcessExternalId === ''}
              onClick={async () => {
                await onDownloadButtonClick();
              }}
            >
              Download
            </Button>
          </>
        ) : (
          <span />
        )}
      </CommonHeader>
    </>
  );
};
