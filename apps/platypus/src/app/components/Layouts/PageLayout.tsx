import { StyledPageLayout } from './elements';

type HtmlElementProps<T extends HTMLElement> = React.DetailedHTMLProps<
  React.HTMLAttributes<T>,
  T
>;

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
