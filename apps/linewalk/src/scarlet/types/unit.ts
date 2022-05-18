export type UnitListItem = {
  id: string;
  cdfId: number;
  number: number;
};

export type UnitListByFacility = {
  [facilitySequenceNumber: string]: UnitListItem[];
};
