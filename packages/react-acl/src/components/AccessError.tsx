import * as React from 'react';
import isFunction from 'lodash/isFunction';
import startCase from 'lodash/startCase';
import { Icon } from '@cognite/cogs.js';

import { ErrorList, ErrorParagraph } from '../elements';
import { AccessCheckResultItem } from '../types';

interface Props {
  item: AccessCheckResultItem;
}
export const AccessError: React.FC<Props> = ({ item }) => {
  return (
    <div data-testid={`access-list-item-${item.name}`}>
      <ErrorParagraph>
        <Icon type="ErrorFilled" style={{ color: '#D51A46' }} />
        <div>{startCase(item.name)}:</div>
      </ErrorParagraph>
      <div>
        <ErrorList>
          {isFunction(item.error) ? item.error() : item.error}
        </ErrorList>
        <ErrorList>
          <strong>Missing: </strong>- {item.missing.join(', ')}
        </ErrorList>
      </div>
    </div>
  );
};
