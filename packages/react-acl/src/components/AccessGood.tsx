import * as React from 'react';
import startCase from 'lodash/startCase';
import { Icon } from '@cognite/cogs.js';

import { AccessCheckResultItem } from '../types';
import { GoodParagraph } from '../elements';

interface Props {
  item: AccessCheckResultItem;
}
export const AccessGood: React.FC<Props> = ({ item }) => {
  return (
    <div data-testid={`access-list-item-${item.name}`}>
      <GoodParagraph>
        <Icon type="CheckmarkFilled" style={{ color: '#18AF8E' }} />
        <div>{startCase(item.name)}</div>
      </GoodParagraph>
    </div>
  );
};
