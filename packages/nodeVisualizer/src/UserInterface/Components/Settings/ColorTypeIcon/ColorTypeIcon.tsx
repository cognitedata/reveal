import React from 'react';
import { ChromaIcon } from '@/UserInterface/Components/ChromaIcon/ChromaIcon';
import { ICommonSelectExtraOptionData } from '@/UserInterface/Components/Settings/Types';

export const ColorTypeIcon = (props: {
  data?: ICommonSelectExtraOptionData;
}) => {
  if (!props.data) {
    return null;
  }
  const { colorTypeIconData } = props.data;

  if (colorTypeIconData && colorTypeIconData.icon) {
    return (
      <div>
        <ChromaIcon
          src={colorTypeIconData.icon}
          color={colorTypeIconData.color}
          alt="color type icon"
          size={16}
        />
      </div>
    );
  }
  return null;
};
