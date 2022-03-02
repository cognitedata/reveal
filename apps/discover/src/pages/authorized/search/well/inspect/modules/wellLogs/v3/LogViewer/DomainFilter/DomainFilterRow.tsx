import React from 'react';

import { Input } from '@cognite/cogs.js';

import { NumberInputWrapper, Row, Seperator } from './elements';
import { DomainFilterRowProps } from './types';

export const DomainFilterRow: React.FC<DomainFilterRowProps> = ({
  domainListItem,
  onChangeDomain,
}) => {
  const { columnExternalId, min, max } = domainListItem;

  return (
    <Row key={columnExternalId} data-testid="domain-filter-row">
      <NumberInputWrapper>
        <Input
          title={columnExternalId}
          type="number"
          value={min}
          onChange={(event) =>
            onChangeDomain(columnExternalId, 'min', Number(event.target.value))
          }
          data-testid="domain-min-value"
        />
      </NumberInputWrapper>

      <Seperator />

      <NumberInputWrapper>
        <Input
          title="&nbsp;"
          type="number"
          value={max}
          onChange={(event) =>
            onChangeDomain(columnExternalId, 'max', Number(event.target.value))
          }
          data-testid="domain-max-value"
        />
      </NumberInputWrapper>
    </Row>
  );
};
