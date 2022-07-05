export type Remark = {
  id: string;
  message: string;
  tags: string[];
  user: {
    id?: string;
    email?: string;
    name?: string;
  };
  timeCreated: number;
};
