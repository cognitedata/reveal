import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';

import { TopBar as CogsTopBar } from '@cognite/cogs.js';

type Props = {
  tenant?: string;
  dropdownActionMenuItems?: JSX.Element[];
  appSwitchedEnabled?: boolean;
};

export const TopBar: FC<Props> = ({ tenant }) => {
  const navigate = useNavigate();
  return (
    <CogsTopBar>
      <CogsTopBar.Left>
        <CogsTopBar.Logo title="Cognite" />

        <CogsTopBar.Navigation
          links={[
            {
              name: 'Explore',
              onClick: () => {
                navigate('/explore');
              },
            },
            {
              name: 'Canvas',
              onClick: () => {
                navigate('/canvas');
              },
            },
          ]}
        />
      </CogsTopBar.Left>

      <CogsTopBar.Right>
        <CogsTopBar.AppSwitcher
          data-testid="topbar_app_switcher"
          tenant={tenant}
        />
      </CogsTopBar.Right>
    </CogsTopBar>
  );
};
