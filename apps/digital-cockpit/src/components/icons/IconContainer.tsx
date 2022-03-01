import styled from 'styled-components';
import { Graphic, Icon, IconType } from '@cognite/cogs.js';

const Wrapper = styled.div`
  background: var(--cogs-greyscale-grey2);
  width: 24px;
  height: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 4px;
  padding: 4px;

  .graphic-white {
    position: relative;
    top: 2px;
    path,
    rect {
      fill: white !important;
    }
  }
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
    icon: <Graphic type="Cognite" style={{ width: 20 }} />,
    background: 'transparent',
  },
  'App.Charts': {
    icon: <Icon type="LineChart" style={{ width: 20 }} />,
    background: 'linear-gradient(225deg, #FF6917 0%, #FB2474 100%)',
    color: 'white',
  },
  'App.Blueprint': {
    icon: <Icon type="Image" style={{ width: 20 }} />,
    background: 'linear-gradient(45.51deg, #23D8ED 0.87%, #4967FB 100%)',
    color: 'white',
  },
  'App.BestDay': {
    icon: (
      <Graphic type="BestDay" className="graphic-white" style={{ width: 20 }} />
    ),
    background: '#FF6918',
  },
  'App.Maintain': {
    icon: (
      <Graphic
        type="Maintain"
        className="graphic-white"
        style={{ width: 20 }}
      />
    ),
    background: '#FC2574',
  },
  'App.InField': {
    icon: (
      <Graphic type="InField" className="graphic-white" style={{ width: 20 }} />
    ),
    background: '#24D8ED',
  },
  'App.Discover': {
    icon: (
      <Graphic
        type="Discover"
        className="graphic-white"
        style={{ width: 20 }}
      />
    ),
    background: '#C945DB',
  },
};

type IconContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  type: IconType | SpecialIconType;
};

const IconContainer = ({ type, style, ...rest }: IconContainerProps) => {
  const specialIcon = specialIcons[type as SpecialIconType];
  if (specialIcon) {
    return (
      <Wrapper
        style={{
          ...style,
          background: specialIcon.background,
          color: specialIcon.color,
        }}
        className="icon-container"
        {...rest}
      >
        {specialIcon.icon}
      </Wrapper>
    );
  }

  return (
    <Wrapper style={style} className="icon-container" {...rest}>
      <Icon type={type as IconType} />
    </Wrapper>
  );
};

export default IconContainer;
