import { useNavigate } from 'react-router-dom';

import { HtmlElementProps } from '@platypus-app/types';

import { Body, Button, Flex, Title } from '@cognite/cogs.js';

export enum Size {
  SMALL = 'SMALL',
  LARGE = 'LARGE',
}
export interface ToolbarProps extends HtmlElementProps<HTMLElement> {
  backPathname?: string;
  behindTitle?: React.ReactNode;
  size?: Size;
}

export const PageToolbar = ({
  children,
  title,
  backPathname,
  behindTitle,
  size = Size.LARGE,
}: ToolbarProps) => {
  const navigate = useNavigate();
  const onBackRouteClick = () => {
    if (backPathname) {
      navigate(backPathname);
    } else {
      // this is a react router dom's builtin constructor to go back in history.
      navigate(-1);
    }
  };

  return (
    <Flex
      justifyContent="space-between"
      alignItems="center"
      style={{
        borderBottom: '1px solid var(--cogs-border-default)',
        flexShrink: 0,
        height: size === Size.LARGE ? '56px' : '40px',
        padding: size === Size.LARGE ? '0 10px 0 16px' : '0 10px 0 16px',
      }}
    >
      <Flex alignItems="center">
        {backPathname && (
          <Button
            icon="ChevronLeft"
            type="ghost"
            onClick={() => {
              onBackRouteClick();
            }}
          />
        )}
        {size === Size.LARGE ? (
          <Title data-cy="page-title" level={5}>
            {title}
          </Title>
        ) : (
          <Body level={2} data-cy="page-title" strong>
            {title}
          </Body>
        )}

        {behindTitle && <div>{behindTitle}</div>}
      </Flex>
      {children}
    </Flex>
  );
};
