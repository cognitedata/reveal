import React, { FunctionComponent, PropsWithChildren } from 'react';

interface RegisterExtpipeLayoutProps {
  backPath?: string;
}

export const RegisterExtpipeLayout: FunctionComponent<
  RegisterExtpipeLayoutProps
> = ({ children }: PropsWithChildren<RegisterExtpipeLayoutProps>) => {
  return <>{children}</>;
};
