import { Flex, Graphic, Title } from '@cognite/cogs.js';

export const Error = ({
  message,
  children,
}: {
  message?: string;
  children?: React.ReactNode;
}) => (
  <Flex gap={10} direction="column" alignItems="center">
    <Graphic type="Search" />
    <Title level={4}>{message}</Title>
    {children}
  </Flex>
);
