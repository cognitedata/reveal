import { useMemo } from 'react';

import { UserProfile } from '../UserProfileProvider';
import caseInsensitiveIncludes from '../utils/caseInsensitiveIncludes';

type UseCanvasSearchProps<T> = {
  canvases: T[];
  searchString: string;
};

type UseCanvasSearchReturnType<T> = {
  filteredCanvases: T[];
};

const useCanvasSearch = <
  T extends {
    name: string;
    externalId: string;
    createdByUserProfile?: UserProfile;
    updatedByUserProfile?: UserProfile;
  }
>({
  canvases,
  searchString,
}: UseCanvasSearchProps<T>): UseCanvasSearchReturnType<T> => {
  const filteredCanvases = useMemo(
    () =>
      canvases.filter(
        (canvas) =>
          caseInsensitiveIncludes(canvas.name, searchString) ||
          caseInsensitiveIncludes(
            canvas.createdByUserProfile?.displayName,
            searchString
          ) ||
          caseInsensitiveIncludes(
            canvas.updatedByUserProfile?.displayName,
            searchString
          )
      ),
    [searchString, canvases]
  );

  return {
    filteredCanvases,
  };
};

export default useCanvasSearch;
