export type MAP_OBJECTS_TYPE = 'equipment' | 'room';

export const MAP_OBJECTS: { [key: string]: MAP_OBJECTS_TYPE } = {
  EQUIPMENT: 'equipment',
  ROOM: 'room',
};

export const mainTypeSelectOptions = [
  { value: MAP_OBJECTS.EQUIPMENT, label: 'Equipment' },
  { value: MAP_OBJECTS.ROOM, label: 'Room' },
];

type SubTypeOptions = {
  [key in MAP_OBJECTS_TYPE]: { label: string; value: string }[];
};

export const subTypeOptions: SubTypeOptions = {
  room: [
    {
      label: 'Kitchen',
      value: 'kitchen',
    },
    {
      label: 'Meeting room',
      value: 'meeting-room',
    },
    {
      label: 'Printer room',
      value: 'printer-room',
    },
    {
      label: 'Rest room',
      value: 'rest-room',
    },
  ],
  equipment: [
    {
      label: 'TV',
      value: 'tv',
    },
    { label: 'Printer', value: 'printer' },
    { label: 'Desk', value: 'desk' },
  ],
};
