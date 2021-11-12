export interface Solution {
  id: string;
  name: string;
  description?: string;
  createdTime: number;
  updatedTime: number;
  owners: string[];
  version: string;
}
