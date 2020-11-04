import React, { useRef, useContext } from 'react';
import { Button, Colors, Dropdown } from '@cognite/cogs.js';
import { ShoppingCartPreview } from 'app/containers/Exploration/ShoppingCart';
import styled from 'styled-components';
import ResourceSelectionContext from 'lib/context/ResourceSelectionContext';
import { ResourceItem } from 'lib/types';
import { ExplorationSearchBar } from './ExplorationSearchBar';

const Navbar = styled.div`
  display: flex;
  flex-direction: row;
  padding: 18px 26px 12px 0;
  background: #fff;
  border-bottom: 2px solid ${Colors['greyscale-grey2'].hex()};
`;

const CartDropdown = styled(Dropdown)`
  background: #fff;
  color: #000;
  box-shadow: 0px 0px 8px ${Colors['greyscale-grey3'].hex()};
  padding: 8px;
  .tippy-arrow {
    color: #fff;
  }
`;

export const ExplorationNavbar = ({
  cart,
  setCart,
}: {
  cart: ResourceItem[];
  setCart: (cart: ResourceItem[]) => void;
}) => {
  const { mode, setMode } = useContext(ResourceSelectionContext);
  const navbarRef = useRef<HTMLDivElement>(null);
  const cartCount = cart.length;

  let selectionContent: React.ReactNode = null;

  switch (mode) {
    case 'none': {
      selectionContent = (
        <Button icon="Plus" onClick={() => setMode('multiple')}>
          Start selection
        </Button>
      );
      break;
    }
    default: {
      selectionContent = (
        <>
          <CartDropdown
            content={<ShoppingCartPreview cart={cart} setCart={setCart} />}
            placement="bottom-end"
          >
            <Button
              icon="Down"
              iconPlacement="right"
              style={{ height: '100%' }}
            >
              {`Selection (${cartCount})`}
            </Button>
          </CartDropdown>
          <Button
            style={{ marginLeft: 8 }}
            onClick={() => setMode('none')}
            icon="Close"
          />
        </>
      );
    }
  }

  return (
    <Navbar ref={navbarRef}>
      <ExplorationSearchBar />
      <div style={{ zIndex: 2, marginLeft: 24, display: 'flex' }}>
        {selectionContent}
      </div>
    </Navbar>
  );
};
export default ExplorationNavbar;
