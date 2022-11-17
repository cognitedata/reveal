import { Button } from '@cognite/cogs.js';
import { PropsWithChildren, useState } from 'react';

import { StyledPanel, Footer, Header } from './elements';

interface Props {
  open: boolean;
  onOpenCloseClick: () => void;
}

export const CommonSidebar = ({
  open = true,
  onOpenCloseClick,
  children,
}: PropsWithChildren<Props>) => {
  const [resize, setResize] = useState(false);

  return (
    <StyledPanel sidePanelOpened={open}>
      {open ? (
        children
      ) : (
        <Header>
          <Button
            type="secondary"
            aria-label="Open sidebar"
            icon="PanelRight"
            onClick={onOpenCloseClick}
          />
        </Header>
      )}
      <Footer onTransitionEnd={() => setResize(!resize)}>
        <Button
          type="secondary"
          aria-label="Show or hide sidebar"
          icon={open ? 'PanelLeft' : 'PanelRight'}
          onClick={onOpenCloseClick}
        >
          {open && 'Hide'}
        </Button>
      </Footer>
    </StyledPanel>
  );
};
