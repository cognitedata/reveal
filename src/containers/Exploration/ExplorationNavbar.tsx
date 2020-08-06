import React, { useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { Button, Colors } from '@cognite/cogs.js';
import { CountLabel, Popover } from 'components/Common';
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
}: {
  cart: ShoppingCart;
  setCart: (cart: ShoppingCart) => void;
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
      />
      <Popover
        trigger="click"
        content={<ShoppingCartPreview cart={cart} setCart={setCart} />}
        placement="bottomRight"
      >
        <Button type="primary" style={{ marginLeft: 24 }}>
          <img
            src={ShoppingCartIcon}
            alt=""
            style={{ height: 16, width: 16, marginRight: 8 }}
          />
          <span style={{ marginRight: 8 }}>Kit</span>
          <CountLabel
            backgroundColor={Colors['midblue-5'].hex()}
            color={Colors.white.hex()}
            value={cartCount}
          />
        </Button>
      </Popover>
    </Navbar>
  );
};
