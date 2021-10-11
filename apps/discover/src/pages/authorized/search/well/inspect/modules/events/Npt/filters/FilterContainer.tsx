import React from 'react';

import { Row, Col } from '@cognite/cogs.js';

import { NPTEvent } from 'modules/wellSearch/types';

import { NPTCodeFilter } from './NPTCodeFilter';
import { NPTDetailCodeFilter } from './NPTDetailCodeFilter';
import { NPTDurationFilter } from './NPTDurationFilter';
import { NPTFilterByName } from './NPTFilterByName';

export const FilterContainer: React.FC<{
  events: NPTEvent[];
  isVisible: boolean;
}> = React.memo(({ events, isVisible }) => {
  if (!isVisible) {
    return null;
  }

  return (
    <Row>
      <Col span={5}>
        <NPTFilterByName />
      </Col>

      <Col span={7}>
        <NPTDurationFilter events={events} />
      </Col>

      <Col span={6}>
        <NPTCodeFilter events={events} />
      </Col>

      <Col span={6}>
        <NPTDetailCodeFilter events={events} />
      </Col>
    </Row>
  );
});
