import { Button, Title } from '@cognite/cogs.js';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components/macro';

type HtmlElementProps<T extends HTMLElement> = React.DetailedHTMLProps<
  React.HTMLAttributes<T>,
  T
>;

export interface ToolbarProps extends HtmlElementProps<HTMLElement> {
  backPathname?: string;
}

export const Toolbar = ({ children, title, backPathname }: ToolbarProps) => {
  const history = useHistory();
  const onBackRouteClick = () => {
    history.push({
      pathname: backPathname,
    });
  };

  return (
    <StyledToolbar>
      <StyledTitle>
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
      </StyledTitle>
      {children}
    </StyledToolbar>
  );
};

Toolbar.Tools = ({ children, ...rest }: HtmlElementProps<HTMLDivElement>) => {
  return <div {...rest}>{children}</div>;
};

const StyledToolbar = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: solid 1px var(--cogs-greyscale-grey3);
`;

const StyledTitle = styled.div`
  display: flex;
  align-items: center;
`;
