import React, { useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { Button, Colors, Badge } from '@cognite/cogs.js';
import { Popover } from 'components/Common';
import {
  ShoppingCart,
  ShoppingCartPreview,
} from 'containers/Exploration/ShoppingCart';
import ShoppingCartIcon from 'assets/shopping-cart.svg';
import { GlobalSearchField } from 'containers/GlobalSearch';
import styled from 'styled-components';

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
  showSearch,
}: {
  cart: ShoppingCart;
  setCart: (cart: ShoppingCart) => void;
  showSearch?: boolean;
}) => {
  const history = useHistory();
  const navbarRef = useRef<HTMLDivElement>(null);

  const cartCount = Object.values(cart).reduce(
    (prev, item) => prev + Object.values(item).length,
    0
  );

  return (
    <Navbar ref={navbarRef}>
      <Button
        variant="ghost"
        icon="ArrowLeft"
        onClick={() => history.goBack()}
      />
      <GlobalSearchField
        offsetTop={
          navbarRef && navbarRef.current
            ? navbarRef.current.getBoundingClientRect().y +
              navbarRef.current.clientHeight +
              2
            : 0
        }
        showSearch={showSearch}
      />
      <Popover
        trigger="click"
        content={<ShoppingCartPreview cart={cart} setCart={setCart} />}
        placement="bottom-end"
      >
        <Button type="primary" style={{ marginLeft: 24 }}>
          <img
            src={ShoppingCartIcon}
            alt=""
            style={{ height: 16, width: 16, marginRight: 8 }}
          />
          <span style={{ marginRight: 8 }}>Kit</span>
          <Badge inverted text={`${cartCount}`} />
        </Button>
      </Popover>
    </Navbar>
  );
};
