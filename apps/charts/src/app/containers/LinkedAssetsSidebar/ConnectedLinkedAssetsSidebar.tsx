import { Asset } from '@cognite/sdk';
import LinkedAssetsSidebar from '@charts-app/components/LinkedAssetsSidebar/LinkedAssetsSidebar';
import { useAddRemoveTimeseries } from '@charts-app/components/Search/hooks';
import { useNavigate } from 'react-router-dom';
import { useComponentTranslations } from '@charts-app/hooks/translations';
import useLinkedAssets from '@charts-app/hooks/charts/linked-assets/hooks/useLinkedAssets';
import { createInternalLink } from '@charts-app/utils/link';

type Props = {
  onClose: () => void;
  /** Array with asset IDs */
  assets: Asset[];
  chartId: string;
};

function ConnectedLinkedAssetsSidebar({ onClose, chartId, assets }: Props) {
  const move = useNavigate();
  const linkedAssets = useLinkedAssets(assets);
  const onTimeseriesClick = useAddRemoveTimeseries();
  const t = useComponentTranslations(LinkedAssetsSidebar);
  return (
    <LinkedAssetsSidebar
      highlight=""
      title={t['Linked assets']}
      exactMatchLabel={t['Exact match on external id']}
      viewAllLabel={t['View all']}
      onClose={onClose}
      assets={linkedAssets}
      onAssetClick={(id) => move(createInternalLink(`${chartId}/files/${id}`))}
      onPAndIDClick={(id) => move(createInternalLink(`${chartId}/files/${id}`))}
      onTimeSeriesClick={onTimeseriesClick}
    />
  );
}

export default ConnectedLinkedAssetsSidebar;
