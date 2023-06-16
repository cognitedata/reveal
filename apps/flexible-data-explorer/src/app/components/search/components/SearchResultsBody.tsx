import { PropsWithChildren } from 'react';

interface Props {
  empty?: boolean;
}
export const SearchResultsBody: React.FC<PropsWithChildren<Props>> = ({
  children,
  empty,
}) => {
  if (empty) {
    return null;
  }

  return <>{children}</>;
};
