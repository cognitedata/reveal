export interface Solution {
  id: string;
  name: string;
  description?: string;
  createdTime: number;
  updatedTime: number;
  owners: string[];
}

export interface ISolutionsApiService {
  create(): Promise<any>;
  update(): Promise<any>;
  delete(): Promise<any>;
  list(): Promise<Solution[]>;
}
