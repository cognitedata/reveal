import { FunctionComponent, PropsWithChildren } from 'react';
import { isOidcEnv } from 'utils/shared';

interface OidcCheckProps {}

export const OidcCheck: FunctionComponent<OidcCheckProps> = ({
  children,
}: PropsWithChildren<OidcCheckProps>) => {
  return <>{!isOidcEnv() && <>{children}</>}</>;
};
