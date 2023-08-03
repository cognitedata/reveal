/*!
 * Copyright 2023 Cognite AS
 */

import { Menu } from '@cognite/cogs.js';
import { type ReactElement, useState } from 'react';

export const OriginalCadColorContainer = (): ReactElement => {
  const [originalCadColor, setOriginalCadColor] = useState(false);

  return (
    <Menu.Item
      hasSwitch
      toggled={originalCadColor}
      onChange={() => {
        setOriginalCadColor((prevMode) => !prevMode);
      }}>
      Original CAD coloring
    </Menu.Item>
  );
};
