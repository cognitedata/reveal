import { Button, Title, TopBar } from '@cognite/cogs.js';
import { useHistory } from 'react-router-dom';
import { StyledTopBar } from './elements';

type HtmlElementProps<T extends HTMLElement> = React.DetailedHTMLProps<
  React.HTMLAttributes<T>,
  T
>;

export interface ToolbarProps extends HtmlElementProps<HTMLElement> {
  backPathname?: string;
}

export const PageToolbar = ({
  children,
  title,
  backPathname,
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
        <Title level={5}>{title}</Title>
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
