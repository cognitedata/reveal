import styled from 'styled-components';
import { Graphic, Icon, IconType } from '@cognite/cogs.js';

const Wrapper = styled.div`
  background: var(--cogs-greyscale-grey2);
  width: 24px;
  height: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 2px;
  padding: 4px;
`;

export type SpecialIconType =
  | 'App.Charts'
  | 'App.Blueprint'
  | 'App.BestDay'
  | 'App.Maintain'
  | 'App.InField'
  | 'App.Discover'
  | 'Cognite';

export const specialIcons: Record<
  SpecialIconType,
  { icon: React.ReactNode; background?: string; color?: string }
> = {
  Cognite: {
    icon: <Graphic type="Cognite" />,
    background: 'transparent',
  },
  'App.Charts': {
    icon: <Icon type="LineChart" />,
    background: 'linear-gradient(225deg, #FF6917 0%, #FB2474 100%)',
    color: 'white',
  },
  'App.Blueprint': {
    icon: <Icon type="Image" />,
    background: 'linear-gradient(45.51deg, #23D8ED 0.87%, #4967FB 100%)',
    color: 'white',
  },
  'App.BestDay': {
    icon: <Graphic type="BestDay" />,
    background: 'transparent',
  },
  'App.Maintain': {
    icon: <Graphic type="Maintain" />,
    background: 'transparent',
  },
  'App.InField': {
    icon: <Graphic type="InField" />,
    background: 'transparent',
  },
  'App.Discover': {
    icon: <Graphic type="Discover" />,
    background: 'transparent',
  },
};

type IconContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  type: IconType | SpecialIconType;
};

const IconContainer = ({ type, style }: IconContainerProps) => {
  const specialIcon = specialIcons[type as SpecialIconType];
  if (specialIcon) {
    return (
      <Wrapper
        style={{
          ...style,
          background: specialIcon.background,
          color: specialIcon.color,
        }}
      >
        {specialIcon.icon}
      </Wrapper>
    );
  }

  return (
    <Wrapper style={style}>
      <Icon type={type as IconType} />
    </Wrapper>
  );
};

export default IconContainer;
