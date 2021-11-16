import React from 'react';
import styled from 'styled-components';
import { Colors, Detail, Flex, Title } from '@cognite/cogs.js';

type Props = {
  title: string;
  subtitle?: string;
};

export const TableHeader = (props: Props): JSX.Element => {
  const { title, subtitle } = props;
  return (
    <TitleSection direction="column">
      <Detail className="detail--db-name" strong>
        {title}
      </Detail>
      <Title level={5} style={{ fontWeight: 700, marginTop: '2px' }}>
        {subtitle}
      </Title>
    </TitleSection>
  );
};

const TitleSection = styled(Flex)`
  margin-left: 16px;
  .detail--db-name {
    color: ${Colors['greyscale-grey6'].hex()};
  }
`;
