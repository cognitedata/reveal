import React, { useContext } from 'react';
import { Row, Col, Button, Dropdown, Space } from 'antd';
import { Icon } from '@cognite/cogs.js';
import { ShoppingCartPreview } from 'app/containers/Exploration/ShoppingCart';
import ResourceSelectionContext from 'app/context/ResourceSelectionContext';
import { ResourceItem } from 'lib/types';
import { ExplorationSearchBar } from './ExplorationSearchBar';
import FilterToggleButton from './FilterToggleButton';

export const ExplorationNavbar = ({
  cart,
  setCart,
  toggleFilter,
}: {
  cart: ResourceItem[];
  setCart: (cart: ResourceItem[]) => void;
  toggleFilter: () => void;
}) => {
  const { mode, setMode } = useContext(ResourceSelectionContext);
  const cartCount = cart.length;

  let selectionContent: React.ReactNode = null;

  switch (mode) {
    case 'none': {
      selectionContent = (
        <Button
          size="large"
          icon={<Icon type="Plus" />}
          onClick={() => setMode('multiple')}
        >
          Start selection
        </Button>
      );
      break;
    }
    default: {
      selectionContent = (
        <Space size="small">
          <Dropdown
            trigger={['click']}
            overlay={<ShoppingCartPreview cart={cart} setCart={setCart} />}
          >
            <Button icon={<Icon type="Down" />} size="large">
              {`Selection (${cartCount})`}
            </Button>
          </Dropdown>
          <Button
            size="large"
            onClick={() => setMode('none')}
            icon={<Icon type="Close" />}
          />
        </Space>
      );
    }
  }

  return (
    <Row align="middle" style={{ marginTop: 16 }}>
      <Col flex="none">
        <FilterToggleButton toggleOpen={toggleFilter} />
      </Col>
      <Col flex="auto" style={{ margin: '0 16px' }}>
        <ExplorationSearchBar />
      </Col>
      <Col flex="none">{selectionContent}</Col>
    </Row>
  );
};
export default ExplorationNavbar;
