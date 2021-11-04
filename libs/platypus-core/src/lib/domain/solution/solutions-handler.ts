import { ISolutionsApiService, Solution } from './types';

export class SolutionsHandler {
  constructor(private solutionsService: ISolutionsApiService) {}

  list(): Promise<Solution[]> {
    return this.solutionsService.list();
  }
}
