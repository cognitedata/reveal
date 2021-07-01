import { ProjectsResponse } from 'types/ApiInterface';

export const sourceProjects = [
  {
    id: 143,
    created_time: 0,
    last_updated: 0,
    external_id: 'SourceTestProject',
    source: 'Studio',
    connector_instances: ['sourceTest'],
  },
  {
    id: 1,
    created_time: 0,
    last_updated: 0,
    external_id: 'studio_repo',
    source: 'Studio',
    connector_instances: [],
  },
] as ProjectsResponse[];
