import React, { useRef, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { Button, Colors, Badge } from '@cognite/cogs.js';
import { Popover } from 'lib/components';
import { ShoppingCartPreview } from 'app/containers/Exploration/ShoppingCart';
import ShoppingCartIcon from 'app/assets/shopping-cart.svg';
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
          <Popover
            trigger="click"
            content={<ShoppingCartPreview cart={cart} setCart={setCart} />}
            placement="bottom-end"
          >
            <Button style={{ height: '100%' }}>
              <img
                src={ShoppingCartIcon}
                alt=""
                style={{ height: 16, width: 16, marginRight: 8 }}
              />
              <span style={{ marginRight: 8 }}>Kit</span>
              <Badge
                background={Colors['greyscale-grey7'].hex()}
                text={`${cartCount}`}
              />
            </Button>
          </Popover>
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
