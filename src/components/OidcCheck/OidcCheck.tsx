import React, { FunctionComponent, PropsWithChildren } from 'react';
import { isOidcEnv } from 'utils/utils';

interface OidcCheckProps {}

export const OidcCheck: FunctionComponent<OidcCheckProps> = ({
  children,
}: PropsWithChildren<OidcCheckProps>) => {
  return <>{!isOidcEnv() && <>{children}</>}</>;
};
