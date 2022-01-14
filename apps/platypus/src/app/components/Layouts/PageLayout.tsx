import { HtmlElementProps } from '@platypus-app/types';
import { StyledPageLayout } from './elements';

type PageLayoutProps = {
  children: React.ReactNode;
};

export const PageLayout = ({ children }: PageLayoutProps) => {
  return <StyledPageLayout>{children}</StyledPageLayout>;
};

PageLayout.Navigation = ({
  children,
  ...rest
}: HtmlElementProps<HTMLDivElement>) => {
  return <div {...rest}>{children}</div>;
};

PageLayout.Content = ({
  children,
  ...rest
}: HtmlElementProps<HTMLDivElement>) => {
  return (
    <div {...rest} className="content">
      {children}
    </div>
  );
};
