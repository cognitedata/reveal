export interface Solution {
  id: string;
  name: string;
  description?: string;
  createdTime: number;
  updatedTime: number;
  owners: string[];
  version: string;
}

export interface Schema {
  version: string;
  schemaString: string;
  createdTime: number;
  updatedTime: number;
}
