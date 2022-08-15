// take in a name prop
// if the currently selected SearchFilter equals the name prop
// show the filters, otherwise show nothing

import { useRecoilValue } from 'recoil';
import { searchFiltersAtom } from 'recoil/search/searchFiltersAtom';

interface Props {
  filterName: string;
}

export const SubSearchFilterWrapper: React.FC<
  React.PropsWithChildren<Props>
> = ({ filterName, children }) => {
  const selectedFilter = useRecoilValue(searchFiltersAtom);

  if (filterName !== selectedFilter) {
    return null;
  }

  return <>{children}</>;
};
