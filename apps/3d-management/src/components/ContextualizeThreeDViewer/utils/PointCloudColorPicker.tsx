import React, { useState } from 'react';

import { Menu } from '@cognite/cogs.js';
import { PointColorType } from '@cognite/reveal';

type Props = {
  onChange: (colorType: PointColorType) => void;
};

export const ColorTypeSelector = ({ onChange }: Props): React.ReactElement => {
  const [classificationColor, setClassificationColor] = useState(false);

  const handleToggle = () => {
    const newColorType = classificationColor
      ? PointColorType.Rgb
      : PointColorType.Classification;

    setClassificationColor((prevMode) => !prevMode);
    onChange(newColorType);
  };

  return (
    <>
      <Menu.Item
        hasSwitch
        toggled={classificationColor}
        onChange={handleToggle}
      >
        View Classification
      </Menu.Item>
    </>
  );
};
