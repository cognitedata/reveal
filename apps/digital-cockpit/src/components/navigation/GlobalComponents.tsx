import { CogsWrapper } from '@cognite/cogs.js';
import useHelpCenter from 'hooks/useHelpCenter';
import HelpCenter from './HelpCenter/HelpCenter';

const GlobalComponents = () => {
  const { isHelpCenterVisible, toggleHelpCenter } = useHelpCenter();

  return (
    <CogsWrapper>
      <HelpCenter isVisible={isHelpCenterVisible} onClose={toggleHelpCenter} />
    </CogsWrapper>
  );
};

export default GlobalComponents;
