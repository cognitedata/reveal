import { SolutionDataModelService } from '@platypus/platypus-core';
import { GraphQlUtilsService } from '@platypus/platypus-infrastructure';

export default {
  solutionDataModelService: new SolutionDataModelService(
    new GraphQlUtilsService()
  ),
};
