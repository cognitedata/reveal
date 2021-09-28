import React, { FunctionComponent, PropsWithChildren } from 'react';

interface RegisterIntegrationLayoutProps {
  backPath?: string;
}

export const RegisterIntegrationLayout: FunctionComponent<RegisterIntegrationLayoutProps> = ({
  children,
}: PropsWithChildren<RegisterIntegrationLayoutProps>) => {
  return <>{children}</>;
};
