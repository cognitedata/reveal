import { Button, Title, TopBar } from '@cognite/cogs.js';
import { HtmlElementProps } from '@platypus-app/types';
import { useHistory } from 'react-router-dom';
import { StyledTopBar } from './elements';

export interface ToolbarProps extends HtmlElementProps<HTMLElement> {
  titleLevel?: number;
  backPathname?: string;
  behindTitle?: React.ReactNode;
}

export const PageToolbar = ({
  children,
  title,
  titleLevel = 5,
  backPathname,
  behindTitle,
}: ToolbarProps) => {
  const history = useHistory();
  const onBackRouteClick = () => {
    history.push({
      pathname: backPathname,
    });
  };

  return (
    <StyledTopBar>
      <TopBar.Left>
        {backPathname && (
          <Button
            icon="ArrowBack"
            type="ghost"
            onClick={() => {
              onBackRouteClick();
            }}
          />
        )}
        <Title data-cy="page-title" level={titleLevel}>
          {title}
        </Title>
        {behindTitle && <div>{behindTitle}</div>}
      </TopBar.Left>
      {children && <TopBar.Right>{children}</TopBar.Right>}
    </StyledTopBar>
  );
};

PageToolbar.Tools = ({
  children,
  ...rest
}: HtmlElementProps<HTMLDivElement>) => {
  return <TopBar.Right {...rest}>{children}</TopBar.Right>;
};
