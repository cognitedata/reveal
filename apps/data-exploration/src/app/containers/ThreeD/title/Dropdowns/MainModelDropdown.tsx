import { Model3D } from '@cognite/sdk';

import { Image360SiteData } from '@data-exploration-app/containers/ThreeD/hooks';
import { MainThreeDModelMenuItem } from '@data-exploration-app/containers/ThreeD/title/MenuItems/MainThreeDModelMenuItem';
import { Revision3DWithIndex } from '@data-exploration-lib/domain-layer';

type MainModelDropdownProps = {
  model?: Model3D;
  revision?: Revision3DWithIndex;
  image360SiteData?: Image360SiteData;
};

const MainModelDropdown = ({
  model: mainModel,
  revision: mainRevision,
  image360SiteData: mainImage360SiteData,
}: MainModelDropdownProps): JSX.Element => {
  return (
    <MainThreeDModelMenuItem
      model={mainModel}
      image360SiteData={mainImage360SiteData}
      revision={mainRevision}
    />
  );
};

export default MainModelDropdown;
