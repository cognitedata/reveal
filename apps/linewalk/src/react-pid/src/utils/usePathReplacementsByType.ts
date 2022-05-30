import { PathReplacementGroup, PathReplacementType } from '@cognite/pid-tools';
import { useEffect, useState } from 'react';

export type PathReplacementMap = Record<
  PathReplacementType,
  PathReplacementGroup[]
>;

const usePathReplacementGroupsByType = (
  pathReplacementGroups: PathReplacementGroup[],
  deletePathReplacementGroups: (
    pathReplacementGroupIds: string[] | string
  ) => void
) => {
  const [pathReplacementGroupMap, setPathReplacementGroupMap] = useState(
    <PathReplacementMap>{}
  );

  useEffect(() => {
    setPathReplacementGroupMap(
      pathReplacementGroups.reduce((byType, group) => {
        if (byType[group.type] === undefined) {
          // eslint-disable-next-line no-param-reassign
          byType[group.type] = [];
        }
        byType[group.type].push(group);
        return byType;
      }, {} as PathReplacementMap)
    );
  }, [pathReplacementGroups]);

  const deletePathReplacementByType = (type: PathReplacementType) =>
    deletePathReplacementGroups(
      pathReplacementGroupMap[type].map((group) => group.id)
    );

  return { pathReplacementGroupMap, deletePathReplacementByType };
};

export default usePathReplacementGroupsByType;
