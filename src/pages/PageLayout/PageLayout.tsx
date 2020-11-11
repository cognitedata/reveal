import React, { useState } from 'react';
import AppHeader from 'components/navigation/AppHeader';
import LeftSidebar from 'components/navigation/LeftSidebar';
import { Content } from './elements';

interface Props {
  children: React.ReactNode;
}

const PageLayout: React.FC<Props> = ({ children }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const handleClick = () => {
    setIsOpen(() => !isOpen);
  };

  return (
    <>
      <AppHeader handleClick={handleClick} />
      <div>
        <LeftSidebar isOpen={isOpen} />
        <Content data-testid="page-content">{children}</Content>
      </div>
    </>
  );
};

export default PageLayout;
