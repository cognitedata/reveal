export type UnitListItem = {
  id: string;
  cdfId: number;
  externalId: string;
  number: number;
};

export type UnitListByFacility = {
  [facilityIdNumber: string]: UnitListItem[];
};
