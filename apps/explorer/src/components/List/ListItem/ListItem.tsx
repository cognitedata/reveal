import { Body, Detail, Icon, IconType } from '@cognite/cogs.js';

import { ListItemStyle, ListItemTextWrapper } from './elements';

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
      <Icon size={20} type={iconSrc} />
      <ListItemTextWrapper>
        <Body level={2} strong>
          {mainText}
        </Body>
        <Detail>{subText}</Detail>
      </ListItemTextWrapper>
    </ListItemStyle>
  );
};
