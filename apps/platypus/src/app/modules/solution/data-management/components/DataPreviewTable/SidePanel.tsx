import { Button, Flex, Title } from '@cognite/cogs.js';
import { HtmlElementProps } from '@platypus-app/types';
import { MouseEventHandler } from 'react';

interface SidePanelProps
  extends Omit<HtmlElementProps<HTMLDivElement>, 'title'> {
  children: React.ReactNode;
  onCloseClick: MouseEventHandler<HTMLButtonElement>;
  title: React.ReactNode | string;
}

export const SidePanel = ({
  children,
  onCloseClick,
  title,
  ...rest
}: SidePanelProps) => {
  return (
    <Flex
      direction="column"
      style={{ height: '100%' }}
      data-cy="data-preview-side-panel"
      {...rest}
    >
      <Flex
        style={{ padding: '6px 2px 6px 24px' }}
        justifyContent="space-between"
        alignItems="center"
      >
        {typeof title === 'string' ? <Title level={6}>{title}</Title> : title}
        <Button
          icon="CloseLarge"
          type="ghost"
          onClick={onCloseClick}
          aria-label="side-panel-close-button"
        />
      </Flex>
      <Flex style={{ padding: '24px', flexGrow: 1 }} direction="column">
        {children}
      </Flex>
    </Flex>
  );
};
