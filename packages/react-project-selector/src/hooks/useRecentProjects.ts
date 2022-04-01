import { useCallback } from 'react';
import { useLocalStorageState } from 'use-local-storage-state';

const MAX_RECENT_PROJECTS = 1;

const addToLatestProjectsFactory =
  (project: string, key: string) =>
  (recentProjects: Record<string, string[]>) => {
    if (recentProjects[key] === undefined) {
      // eslint-disable-next-line no-param-reassign
      recentProjects[key] = [];
    }

    const idx = recentProjects[key].indexOf(project);
    if (idx !== -1) {
      recentProjects[key].splice(idx, 1);
    }

    recentProjects[key].unshift(project);

    if (recentProjects[key].length > MAX_RECENT_PROJECTS) {
      recentProjects[key].pop();
    }

    return recentProjects;
  };

const useRecentProjects = ({
  recentProjectsKey,
}: {
  recentProjectsKey: string;
}) => {
  const [recentProjects, setRecentProjects] = useLocalStorageState<
    Record<string, string[]>
  >('@cognite/recentProjects', {});

  const addToRecentProjects = useCallback(
    (project: string) =>
      setRecentProjects(addToLatestProjectsFactory(project, recentProjectsKey)),
    [recentProjectsKey, setRecentProjects]
  );

  return {
    recentProjects: recentProjects[recentProjectsKey] ?? [],
    addToRecentProjects,
  };
};

export default useRecentProjects;
