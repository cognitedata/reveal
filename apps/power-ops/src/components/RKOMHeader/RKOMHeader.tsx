import { Button, Select } from '@cognite/cogs.js';
import { CommonHeader } from 'components/CommonHeader/CommonHeader';
import { DeliveryWeekSelect } from 'components/DeliveryWeekSelect/DeliveryWeekSelect';
import { auctionOptions, blockOptions, productOptions } from 'pages/RKOM/utils';

import { VerticalSeparator } from './elements';

type Props = {
  priceAreaOptions: {
    value: string;
    label: string;
  }[];
  lastUpdated: string;
  priceAreaValue:
    | {
        value: string;
        label: string;
      }
    | undefined;
  auctionValue: typeof auctionOptions[number];
  blockValue: typeof blockOptions[number];
  productValue: typeof productOptions[number];
  deliveryWeekValue: string;
  onPriceAreaValueChange: (priceAreaValue: {
    value: string;
    label: string;
  }) => void;
  onAuctionValueChange: (auctionValue: typeof auctionOptions[number]) => void;
  onBlockValueChange: (blockValue: typeof blockOptions[number]) => void;
  onProductValueChange: (productValue: typeof productOptions[number]) => void;
  onDeliveryWeekValueChange: (deliveryWeekValue: string) => void;
  downloading: boolean;
  onDownloadButtonClick: () => void;
  disabledDownload: boolean;
};

export const RKOMHeader = ({
  priceAreaOptions,
  lastUpdated,
  priceAreaValue,
  auctionValue,
  blockValue,
  productValue,
  deliveryWeekValue,
  onPriceAreaValueChange,
  onAuctionValueChange,
  onBlockValueChange,
  onProductValueChange,
  onDeliveryWeekValueChange,
  downloading,
  onDownloadButtonClick,
  disabledDownload = true,
}: Props) => (
  <CommonHeader title="RKOM" titleLabel={`Last Updated: ${lastUpdated}`}>
    <Select
      data-testid="price-area-select"
      theme="grey"
      title="Price Area:"
      value={priceAreaValue}
      disableTyping
      options={priceAreaOptions}
      onChange={(val: typeof priceAreaOptions[number]) =>
        onPriceAreaValueChange(val)
      }
      required
    />
    <Select
      data-testid="auction-select"
      theme="grey"
      title="Auction:"
      value={auctionValue}
      disableTyping
      options={auctionOptions}
      onChange={(val: typeof auctionOptions[number]) =>
        onAuctionValueChange(val)
      }
      required
    />
    <Select
      data-testid="block-select"
      theme="grey"
      title="Block:"
      value={blockValue}
      disableTyping
      options={blockOptions}
      onChange={(val: typeof blockOptions[number]) => onBlockValueChange(val)}
      required
    />
    <Select
      data-testid="product-select"
      theme="grey"
      title="Product:"
      value={productValue}
      disableTyping
      options={productOptions}
      onChange={(val: typeof productOptions[number]) =>
        onProductValueChange(val)
      }
      required
    />
    <DeliveryWeekSelect
      data-testid="delivery-week-select"
      value={deliveryWeekValue}
      onChange={onDeliveryWeekValueChange}
    />
    <VerticalSeparator />
    <Button
      data-testid="download-button"
      icon="Download"
      type="primary"
      loading={downloading}
      disabled={disabledDownload}
      onClick={onDownloadButtonClick}
    >
      Download
    </Button>
  </CommonHeader>
);
