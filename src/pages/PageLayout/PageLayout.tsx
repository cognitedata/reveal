import React from 'react';
import AppHeader from 'components/navigation/AppHeader';
import LeftSidebar from 'components/navigation/LeftSidebar';
import { useClickAwayListener } from 'hooks/useClickAwayListener';
import { Content, Navigation } from './elements';

interface Props {
  children: React.ReactNode;
}

const PageLayout: React.FC<Props> = ({ children }: Props) => {
  const {
    ref,
    isComponentVisible,
    setIsComponentVisible,
  } = useClickAwayListener(false);

  const handleClick = () => {
    setIsComponentVisible(() => !isComponentVisible);
  };

  return (
    <>
      <Navigation ref={ref}>
        <AppHeader data-testid="app-header" handleClick={handleClick} />
        <LeftSidebar isOpen={isComponentVisible} />
      </Navigation>
      <Content data-testid="page-content">{children}</Content>
    </>
  );
};

export default PageLayout;
