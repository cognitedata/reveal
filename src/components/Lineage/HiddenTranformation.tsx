import React from 'react';
import { Button } from '@cognite/cogs.js';
import Popover from 'antd/lib/popover';
import { useUpdateDataSetTransformations } from 'actions';
import { TransformationDetails, DataSet } from '../../utils/types';

interface HiddenTransformationProps {
  transformation: TransformationDetails;
  dataSet: DataSet;
}

const HiddenTransformation = ({
  transformation,
  dataSet,
}: HiddenTransformationProps) => {
  const { updateDataSetTransformations } = useUpdateDataSetTransformations();

  const message = (
    <p>
      Transformation of ID <strong>{transformation?.name}</strong> is not
      visible, this may be due to it being delete or private to another user.{' '}
      <Button
        type="link"
        onClick={() => updateDataSetTransformations(dataSet, transformation)}
      >
        Click here
      </Button>{' '}
      to remove this transformation from this data set.
    </p>
  );
  return (
    <Popover
      content={message}
      overlayStyle={{ width: '300px' }}
      placement="left"
    >
      <p style={{ fontStyle: 'italic' }}>{transformation?.name}</p>
    </Popover>
  );
};

export default HiddenTransformation;
