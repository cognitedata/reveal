import { Asset } from '@cognite/sdk';
import LinkedAssetsSidebar from 'components/LinkedAssetsSidebar/LinkedAssetsSidebar';
import { useAddRemoveTimeseries } from 'components/Search/hooks';
import { useNavigate } from 'hooks/navigation';
import { useComponentTranslations } from 'hooks/translations';
import useLinkedAssets from 'models/charts/linked-assets/hooks/useLinkedAssets';

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
      onAssetClick={(id) => move(`/${chartId}/files/${id}`)}
      onPAndIDClick={(id) => move(`/${chartId}/files/${id}`)}
      onTimeSeriesClick={onTimeseriesClick}
    />
  );
}

export default ConnectedLinkedAssetsSidebar;
