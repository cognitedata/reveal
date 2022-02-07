import AssetSearch from 'components/explorer/AssetSearch';
import { useParams, useHistory } from 'react-router-dom';
import AssetHierarchy from 'components/explorer/AssetHierarchy';
import { Asset } from '@cognite/sdk';
import AssetTabs, { AssetTabKey } from 'components/explorer/AssetTabs';

import { ExplorerWrapper } from './elements';

const Explorer = () => {
  const history = useHistory();
  const { assetId, tab: activeTab } =
    useParams<{ assetId: string; tab: string }>();

  const onAssetSelect = (asset: Asset) => {
    history.push(`/explore/${asset.id}/${activeTab}`);
  };
  const onTabChange = (nextTab: AssetTabKey) => {
    history.push(`/explore/${assetId}/${nextTab}`);
  };

  const renderMain = () => {
    if (!assetId) {
      return <>Recently viewed assets</>;
    }
    return (
      <AssetTabs
        assetId={{ id: Number(assetId) }}
        activeTabKey={activeTab as AssetTabKey}
        onTabChange={onTabChange}
      />
    );
  };
  return (
    <ExplorerWrapper>
      <aside>
        <h3>Asset Hierarchy</h3>
        <AssetSearch
          onSelect={onAssetSelect}
          cleanStateComponent={<AssetHierarchy onSelect={onAssetSelect} />}
        />
      </aside>
      <main>{renderMain()}</main>
    </ExplorerWrapper>
  );
};

export default Explorer;
