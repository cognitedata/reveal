import React from 'react';
import { Flex, Icon } from '@cognite/cogs.js';
import Popover from 'antd/lib/popover';
import { TransformationDetails } from '../../utils/types';

interface HiddenTransformationProps {
  transformation: TransformationDetails;
}

const HiddenTransformation = ({
  transformation,
}: HiddenTransformationProps) => {
  const message = (
    <div>
      Transformation of ID <strong>{transformation?.name}</strong> is not
      visible. This may be due to it being deleted or private to another user.
    </div>
  );
  return (
    <Flex alignItems="center" style={{ fontStyle: 'italic' }}>
      <Popover
        content={message}
        overlayStyle={{ width: '300px' }}
        placement="left"
      >
        <Icon
          type="WarningTriangle"
          style={{ cursor: 'help', marginRight: '4px' }}
        />
      </Popover>
      {transformation?.name}
    </Flex>
  );
};

export default HiddenTransformation;
