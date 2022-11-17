import { RKOMHeader } from 'components/RKOMHeader/RKOMHeader';
import {
  auctionOptions,
  blockOptions,
  firstDayofDefaultWeek,
  friday1200,
  productOptions,
  thursday1200,
  today,
} from 'pages/RKOM/utils';
import dayjs from 'dayjs';
import { useFetchPriceAreaOptions } from 'queries/useFetchPriceAreas';
import { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useFetchRKOMBids } from 'queries/useFetchRKOMBids';
import { RkomFilterType } from '@cognite/power-ops-api-types';
import { formatDate } from 'utils/utils';

type Props = {
  filter?: RkomFilterType;
  onDownloadButtonClick: () => void;
  onFiltersChange: (newFilterValues: RkomFilterType) => void;
  disabledDownload: boolean;
};

const RKOMHeaderContainer = ({
  onDownloadButtonClick,
  onFiltersChange,
  disabledDownload = true,
  filter,
}: Props) => {
  const history = useHistory();
  const { pathname, search } = useLocation();
  const { data: rkomBids, status: rkomBidsStatus } = useFetchRKOMBids(filter);
  const urlParams = new URLSearchParams(search);

  const { data: priceAreaOptions, status } = useFetchPriceAreaOptions();

  const [downloading, setDownloading] = useState(false);

  const [priceAreaValue, setPriceAreaValue] =
    useState<typeof priceAreaOptions[number]>();

  useEffect(() => {
    if (status !== 'success' || priceAreaOptions.length === 0) return;
    if (urlParams.get('priceAreaIds[]')) {
      const found = priceAreaOptions.find(
        (o) => o.value === urlParams.get('priceAreaIds[]')
      );
      if (found) {
        setPriceAreaValue(found);
        return;
      }
    }
    setPriceAreaValue(priceAreaOptions[0]);
  }, [status]);

  const [auctionValue, setAuctionValue] = useState<
    typeof auctionOptions[number]
  >(() => {
    // if it exists from URL, fill it up
    if (urlParams.get('auction')) {
      const found = auctionOptions.find(
        (o) => o.value === urlParams.get('auction')
      );
      if (found) return found;
    }

    // If today is after 12:00 Thursday and before 12:00 Friday, default auction is weekday
    return today >= thursday1200 && today < friday1200
      ? auctionOptions[0]
      : auctionOptions[1];
  });
  const [blockValue, setBlockValue] = useState<typeof blockOptions[number]>(
    () => {
      // if it exists from URL, fill it up
      if (urlParams.get('block')) {
        const found = blockOptions.find(
          (o) => o.value === urlParams.get('block')
        );
        if (found) return found;
      }
      return blockOptions[0];
    }
  );
  const [productValue, setProductValue] = useState<
    typeof productOptions[number]
  >(() => {
    if (urlParams.get('product')) {
      const found = productOptions.find(
        (o) => o.value === urlParams.get('product')
      );
      if (found) return found;
    }
    return productOptions[0];
  });
  const [deliveryWeekValue, setdeliveryWeekValue] = useState(() => {
    if (urlParams.get('startDate')) {
      return dayjs(urlParams.get('startDate'), 'YYYY-MM-DD').format(
        'YYYY-MM-DD'
      );
    }
    return firstDayofDefaultWeek.format('YYYY-MM-DD');
  });

  useEffect(() => {
    if (!priceAreaValue?.value) return;

    const newFilters = {
      auction: auctionValue.value,
      block: blockValue.value,
      product: productValue.value,
      startDate: deliveryWeekValue,
    };
    onFiltersChange({
      ...newFilters,
      priceAreaIds: [priceAreaValue.value],
      endDate: dayjs(deliveryWeekValue, 'YYYY-MM-DD')
        .endOf('week')
        .format('YYYY-MM-DD'),
    });
    history.push({
      pathname,
      search: new URLSearchParams({
        ...newFilters,
        'priceAreaIds[]': priceAreaValue.value,
      }).toString(),
    });
  }, [
    auctionValue,
    blockValue,
    productValue,
    deliveryWeekValue,
    priceAreaValue,
  ]);

  const handleDownloadButtonClick = async () => {
    setDownloading(true);
    await onDownloadButtonClick();
    setDownloading(false);
  };

  return (
    <RKOMHeader
      lastUpdated={
        rkomBidsStatus === 'success' && rkomBids.length > 0
          ? formatDate(rkomBids[rkomBids.length - 1].createdTime)
          : 'Loading...'
      }
      priceAreaOptions={priceAreaOptions}
      priceAreaValue={priceAreaValue}
      auctionValue={auctionValue}
      blockValue={blockValue}
      productValue={productValue}
      deliveryWeekValue={deliveryWeekValue}
      onPriceAreaValueChange={setPriceAreaValue}
      onAuctionValueChange={setAuctionValue}
      onBlockValueChange={setBlockValue}
      onProductValueChange={setProductValue}
      onDeliveryWeekValueChange={setdeliveryWeekValue}
      downloading={downloading}
      onDownloadButtonClick={handleDownloadButtonClick}
      disabledDownload={downloading || disabledDownload}
    />
  );
};

export default RKOMHeaderContainer;
