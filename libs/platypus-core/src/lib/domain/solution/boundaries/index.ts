import { CreateSolutionDTO, DeleteSolutionDTO } from '../dto';
import { Solution } from '../types';

export interface ISolutionsApiService {
  create(dto: CreateSolutionDTO): Promise<Solution>;
  delete(dto: DeleteSolutionDTO): Promise<unknown>;
  list(): Promise<Solution[]>;
}
