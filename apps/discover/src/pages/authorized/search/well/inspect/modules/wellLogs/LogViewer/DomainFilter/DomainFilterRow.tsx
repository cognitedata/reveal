import * as React from 'react';

import { Input } from '@cognite/cogs.js';

import { NumberInputWrapper, Row, Seperator } from './elements';
import { DomainFilterRowProps } from './types';

export const DomainFilterRow: React.FC<DomainFilterRowProps> = ({
  domainListItem,
  onChangeDomain,
}) => {
  const { columnExternalId, min, max } = domainListItem;
  const [tempValMin, setTempValMin] = React.useState(`${min}`);
  const [tempValMax, setTempValMax] = React.useState(`${max}`);

  const handleDomainChange = (value: string, updateType: 'min' | 'max') => {
    switch (updateType) {
      case 'min':
        setTempValMin(value);
        break;
      case 'max':
        setTempValMax(value);
        break;
    }
    if (!Number.isNaN(Number(value))) {
      onChangeDomain(columnExternalId, updateType, Number(value));
    }
  };

  return (
    <Row key={columnExternalId} data-testid="domain-filter-row">
      <NumberInputWrapper>
        <Input
          title={columnExternalId}
          type="number"
          value={tempValMin}
          onChange={(event) => {
            handleDomainChange(event.target.value, 'min');
          }}
          data-testid="domain-min-value"
        />
      </NumberInputWrapper>

      <Seperator />

      <NumberInputWrapper>
        <Input
          title="&nbsp;"
          type="number"
          value={tempValMax}
          onChange={(event) => {
            handleDomainChange(event.target.value, 'max');
          }}
          data-testid="domain-max-value"
        />
      </NumberInputWrapper>
    </Row>
  );
};
