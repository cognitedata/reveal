import { Body, Detail, Icon, IconType } from '@cognite/cogs.js';

import { ListItemStyle } from './elements';

// In the future we should switch to using image and icons
export interface Props {
  mainText: string;
  subText: string;
  iconSrc: IconType;
  selected?: boolean;
  handleClick?: () => void;
}

export const ListItem: React.FC<Props> = ({
  iconSrc,
  selected = false,
  mainText,
  subText,
  handleClick,
}) => {
  return (
    <ListItemStyle onClick={handleClick} selected={selected}>
      <Icon size={30} type={iconSrc} />
      <div>
        <Body level={2} strong>
          {mainText}
        </Body>
        {subText ? <Detail>{subText}</Detail> : null}
      </div>
    </ListItemStyle>
  );
};
