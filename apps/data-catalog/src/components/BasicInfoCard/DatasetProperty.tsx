import { Body, Flex } from '@cognite/cogs.js';
import { ReactNode } from 'react';
import styled from 'styled-components';

interface DatasetPropertyProps {
  label?: string | ReactNode;
  value: string | ReactNode;
}

const DatasetProperty = ({ label, value }: DatasetPropertyProps) => {
  return (
    <Item justifyContent="flex-start" direction="column" gap={6}>
      {label && (
        <Body level={2} className="mute">
          {label}
        </Body>
      )}
      {value}
    </Item>
  );
};

const Item = styled(Flex)`
  padding: 12px;
`;

export default DatasetProperty;
