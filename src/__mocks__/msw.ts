import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { mockClassifiersList } from './resolvers/mockClassifier';
import { mockLabelsList } from './resolvers/mockLabels';
import { mockPipelinesList } from './resolvers/mockPipelines';
import { mockProject } from './sdk';

export const handlers = [
  // Labels
  rest.post(
    `https://api.cognitedata.com/api/v1/projects/${mockProject}/labels/list`,
    mockLabelsList
  ),

  // Classifiers
  rest.get(
    `https://api.cognitedata.com/api/playground/projects/${mockProject}/documents/classifiers`,
    mockClassifiersList
  ),

  rest.get(
    `https://api.cognitedata.com/api/playground/projects/${mockProject}/documents/pipelines`,
    mockPipelinesList
  ),
];

export const server = setupServer(...handlers);
