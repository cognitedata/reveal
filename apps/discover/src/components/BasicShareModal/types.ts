export type SharedUser = {
  id: string;
  firstname?: string;
  lastname?: string;
  email?: string;
};

export type FormattedSharedUser = {
  id: string;
  iconCode: string;
  fullName: string;
  email?: string;
};
