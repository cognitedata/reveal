// Stuff related to selections/shopping cart is commented out for the moment while waiting for
// design input
import React from 'react';
import { Colors } from '@cognite/cogs.js';
import {
  Row,
  Col, // Button, Dropdown, Space
} from 'antd';
// import { Icon } from '@cognite/cogs.js';
// import { ShoppingCartPreview } from 'app/containers/Exploration/ShoppingCart';
// import ResourceSelectionContext from 'app/context/ResourceSelectionContext';
// import { ResourceItem } from 'lib/types';
import styled from 'styled-components';
import { ExplorationSearchBar } from './ExplorationSearchBar';
import FilterToggleButton from './FilterToggleButton';

export const ExplorationNavbar = ({
  // cart,
  // setCart,
  toggleFilter,
}: {
  // cart: ResourceItem[];
  // setCart: (cart: ResourceItem[]) => void;
  toggleFilter: () => void;
}) => {
  // const { mode, setMode } = useContext(ResourceSelectionContext);
  // const cartCount = cart.length;

  // let selectionContent: React.ReactNode = null;

  // switch (mode) {
  //   case 'none': {
  //     selectionContent = (
  //       <Button
  //         size="large"
  //         icon={<Icon type="Plus" />}
  //         onClick={() => setMode('multiple')}
  //       >
  //         Start selection
  //       </Button>
  //     );
  //     break;

  //   }
  //   default: {
  //     selectionContent = (
  //       <Space size="small">
  //         <Dropdown
  //           trigger={['click']}
  //           overlay={<ShoppingCartPreview cart={cart} setCart={setCart} />}
  //         >
  //           <Button icon={<Icon type="Down" />} size="large">
  //             {`Selection (${cartCount})`}
  //           </Button>
  //         </Dropdown>
  //         <Button
  //           size="large"
  //           onClick={() => setMode('none')}
  //           icon={<Icon type="Close" />}
  //         />
  //       </Space>
  //     );
  //   }
  // }

  return (
    <SearchInputContainer>
      <Row align="middle">
        <Col flex="none">
          <FilterToggleButton toggleOpen={toggleFilter} />
        </Col>
        <Col flex="auto" style={{ margin: '0 16px' }}>
          <ExplorationSearchBar />
        </Col>
      </Row>
    </SearchInputContainer>
  );
};

const SearchInputContainer = styled.div`
  border-right: 1px solid ${Colors['greyscale-grey3'].hex()};
  margin-right: 16px;
  padding-top: 16px;
  padding-bottom: 16px;
`;

export default ExplorationNavbar;
