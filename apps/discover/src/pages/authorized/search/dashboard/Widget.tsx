import * as React from 'react';

import styled from 'styled-components/macro';

import { Title } from '@cognite/cogs.js';

import { sizes, FlexRow, Flex } from 'styles/layout';

const SubTitle = styled(Flex)`
  padding: 0 ${sizes.extraSmall};
`;
const WidgetHeader = styled(FlexRow)`
  align-items: baseline;
  margin-bottom: ${sizes.normal};
`;
const WidgetContent = styled(FlexRow)`
  justify-content: space-between;
  align-items: center;
`;

const WidgetWrapper = styled.div`
  border-radius: 12px;
  border: 2px solid var(--cogs-graphics-info);
  background: var(--cogs-white);
  height: 134px;
  width: 272px;
  padding: ${sizes.normal};
  margin: ${sizes.small};
`;

interface Props {
  title: string;
  subtitle: string;
}
export const Widget: React.FC<React.PropsWithChildren<Props>> = ({
  title,
  subtitle,
  children,
}) => {
  return (
    <WidgetWrapper>
      <WidgetHeader>
        <Title level={4}>{title}</Title>
        <SubTitle>{subtitle}</SubTitle>
      </WidgetHeader>
      <WidgetContent>{children}</WidgetContent>
    </WidgetWrapper>
  );
};
