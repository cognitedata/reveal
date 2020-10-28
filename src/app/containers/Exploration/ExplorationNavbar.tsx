import React, { useRef, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { Button, Colors, Dropdown } from '@cognite/cogs.js';
import { ShoppingCartPreview } from 'app/containers/Exploration/ShoppingCart';
import styled from 'styled-components';
import ResourceSelectionContext from 'lib/context/ResourceSelectionContext';
import { ResourceItem } from 'lib/types';
import { ExplorationSearchBar } from './ExplorationSearchBar';

const Navbar = styled.div`
  display: flex;
  flex-direction: row;
  padding: 18px 26px 12px;
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
  const history = useHistory();
  const { mode, setMode } = useContext(ResourceSelectionContext);
  const navbarRef = useRef<HTMLDivElement>(null);

  const { pathname } = history.location;

  const cleanPathname = pathname.substr(
    0,
    pathname.charAt(pathname.length - 1) === '/'
      ? pathname.length - 1
      : undefined
  );

  const [, , , , resourceId] = cleanPathname.split('/');

  const disableDropdown = !resourceId;

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
      <Button
        variant="ghost"
        icon="ArrowLeft"
        onClick={() => history.goBack()}
      />
      <ExplorationSearchBar
        offsetTop={
          navbarRef && navbarRef.current
            ? navbarRef.current.getBoundingClientRect().y +
              navbarRef.current.clientHeight +
              2
            : 0
        }
        disableDropdown={disableDropdown}
      />
      <div style={{ zIndex: 2, marginLeft: 24, display: 'flex' }}>
        {selectionContent}
      </div>
    </Navbar>
  );
};
