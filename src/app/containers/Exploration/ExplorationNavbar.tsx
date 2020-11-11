// Stuff related to selections/shopping cart is commented out for the moment while waiting for
// design input
import React from 'react';
import {
  Row,
  Col, // Button, Dropdown, Space
} from 'antd';
// import { Icon } from '@cognite/cogs.js';
// import { ShoppingCartPreview } from 'app/containers/Exploration/ShoppingCart';
// import ResourceSelectionContext from 'app/context/ResourceSelectionContext';
// import { ResourceItem } from 'lib/types';
import styled from 'styled-components';
import { lightGrey } from 'lib/utils/Colors';
import { ExplorationSearchBar } from './ExplorationSearchBar';

export const ExplorationNavbar = ({
  // cart,
  // setCart,
  beforeSearchInput,
}: {
  // cart: ResourceItem[];
  // setCart: (cart: ResourceItem[]) => void;
  beforeSearchInput?: React.ReactElement;
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
    <SearchInputContainer align="middle">
      {beforeSearchInput && <Col flex="none">{beforeSearchInput}</Col>}
      <Col
        flex="auto"
        style={
          beforeSearchInput
            ? {
                margin: '0 16px',
                paddingLeft: 16,
                borderLeft: `1px solid ${lightGrey}`,
              }
            : undefined
        }
      >
        <ExplorationSearchBar />
      </Col>
    </SearchInputContainer>
  );
};

const SearchInputContainer = styled(Row)`
  border-right: 1px solid ${lightGrey};
  border-bottom: 1px solid ${lightGrey};
  margin-right: 16px;
  padding-top: 16px;
  padding-bottom: 16px;
`;

export default ExplorationNavbar;
