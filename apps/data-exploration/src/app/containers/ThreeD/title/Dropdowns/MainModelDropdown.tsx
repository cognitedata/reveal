import { Model3D } from '@cognite/sdk';

import {
  Revision3DWithIndex,
  Image360SiteData,
} from '@data-exploration-lib/domain-layer';

import { MainThreeDModelMenuItem } from '../MenuItems/MainThreeDModelMenuItem';

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
