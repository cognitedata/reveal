import { HtmlElementProps } from '@platypus-app/types';
import { StyledPageContentLayout } from './elements';

type PageContentLayoutProps = {
  children: React.ReactNode;
};

export const PageContentLayout = ({ children }: PageContentLayoutProps) => {
  return <StyledPageContentLayout>{children}</StyledPageContentLayout>;
};

PageContentLayout.Header = ({
  children,
  ...rest
}: HtmlElementProps<HTMLDivElement>) => {
  return <div {...rest}>{children}</div>;
};

PageContentLayout.Body = ({
  children,
  ...rest
}: HtmlElementProps<HTMLDivElement>) => {
  return (
    <div {...rest} className="body">
      {children}
    </div>
  );
};
