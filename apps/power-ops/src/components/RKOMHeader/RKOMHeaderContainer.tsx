import { RKOMHeader } from 'components/RKOMHeader/RKOMHeader';
import {
  auctionOptions,
  blockOptions,
  getFirstDayofDefaultWeek,
  getLocalizedWeekDays,
  productOptions,
} from 'pages/RKOM/utils';
import dayjs from 'dayjs';
import { useFetchPriceAreaOptions } from 'queries/useFetchPriceAreas';
import { useEffect, useState, useMemo } from 'react';
import { useHistory, useLocation } from 'react-router-dom-v5';
import { useFetchRKOMBids } from 'queries/useFetchRKOMBids';
import { RkomFilterType } from '@cognite/power-ops-api-types';
import { formatDate } from 'utils/utils';
import { useFetchRKOMConfig } from 'queries/useFetchRKOMConfiguration';

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
  const urlParams = new URLSearchParams(search);

  const { data: rkomConfig } = useFetchRKOMConfig();
  const { data: rkomBids, status: rkomBidsStatus } = useFetchRKOMBids(filter);
  const { data: priceAreaOptions, status } = useFetchPriceAreaOptions();

  const { today, friday1200, thursday1200 } = useMemo(
    () => getLocalizedWeekDays(rkomConfig?.marketConfiguration),
    [rkomConfig]
  );

  const firstDayofDefaultWeek = useMemo(
    () =>
      getFirstDayofDefaultWeek(rkomConfig?.marketConfiguration).format(
        'YYYY-MM-DD'
      ),
    [rkomConfig]
  );

  const [downloading, setDownloading] = useState(false);

  const [priceAreaValue, setPriceAreaValue] =
    useState<typeof priceAreaOptions[number]>();

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
    return urlParams.get('startDate')
      ? dayjs(urlParams.get('startDate'), 'YYYY-MM-DD').format('YYYY-MM-DD')
      : firstDayofDefaultWeek;
  });

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
    onDownloadButtonClick();
    setDownloading(false);
  };

  return rkomConfig ? (
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
      rkomMarketConfig={rkomConfig}
    />
  ) : null;
};

export default RKOMHeaderContainer;
