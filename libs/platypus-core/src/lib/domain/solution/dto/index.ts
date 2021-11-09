export interface CreateSolutionDTO {
  name: string;
  description?: string;
  owner?: string;
}

export interface DeleteSolutionDTO {
  id: string;
}
