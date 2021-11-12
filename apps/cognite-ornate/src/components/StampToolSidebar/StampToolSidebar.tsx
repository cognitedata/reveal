import HotWork from '../../assets/HotWork.png';
import SafeMechanicalLifting from '../../assets/SafeMechanicalLifting.png';
import ConfinedSpace from '../../assets/ConfinedSpace.png';

import { StampToolItem, StampToolSidebarWrapper } from './elements';

export const STAMPS: { url: string; name: string }[] = [
  {
    name: 'Safe Mechanical Lifting',
    url: SafeMechanicalLifting,
  },
  {
    name: 'Confined Space',
    url: ConfinedSpace,
  },
  {
    name: 'Hot Work',
    url: HotWork,
  },
];

type StampToolSidebarProps = {
  activeStamp: string;
  onSelectStamp: (nextStampURL: string) => void;
};

const StampToolSidebar = ({
  activeStamp,
  onSelectStamp,
}: StampToolSidebarProps) => {
  return (
    <StampToolSidebarWrapper>
      {STAMPS.map((stamp) => (
        <StampToolItem
          key={stamp.name}
          style={{
            background:
              activeStamp === stamp.url ? 'var(--cogs-primary)' : 'white',
          }}
          onClick={(e) => {
            e.stopPropagation();
            onSelectStamp(stamp.url);
          }}
          onMouseUp={(e) => {
            e.stopPropagation();
          }}
        >
          <img src={stamp.url} alt={stamp.name} />
        </StampToolItem>
      ))}
    </StampToolSidebarWrapper>
  );
};

export default StampToolSidebar;
