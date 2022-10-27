import { Button, Flex, Title } from '@cognite/cogs.js';
import { MouseEventHandler } from 'react';

type SidePanelProps = {
  children: React.ReactNode;
  onCloseClick: MouseEventHandler<HTMLButtonElement>;
  title: React.ReactNode | string;
};

export const SidePanel = ({
  children,
  onCloseClick,
  title,
}: SidePanelProps) => {
  return (
    <Flex direction="column" style={{ height: '100%' }}>
      <Flex
        style={{ padding: '6px 2px 6px 24px' }}
        justifyContent="space-between"
        alignItems="center"
      >
        {typeof title === 'string' ? <Title level={6}>{title}</Title> : title}
        <Button icon="CloseLarge" type="ghost" onClick={onCloseClick}></Button>
      </Flex>
      <div style={{ padding: '24px', flexGrow: 1 }}>{children}</div>
    </Flex>
  );
};
