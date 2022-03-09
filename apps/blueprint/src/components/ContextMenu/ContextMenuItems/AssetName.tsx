import { Label } from '@cognite/cogs.js';

import { AssetNameWrapper } from './elements';

type AssetNameProps = {
  assetName?: string;
};

const AssetName = ({ assetName }: AssetNameProps) => {
  return (
    <AssetNameWrapper>
      <Label icon="Tag" size="small">
        {assetName}
      </Label>
    </AssetNameWrapper>
  );
};

export default AssetName;
