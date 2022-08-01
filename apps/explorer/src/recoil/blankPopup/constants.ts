export enum MAP_OBJECTS {
  EQUIPMENT = 'equipment',
  ROOM = 'room',
}

export const mainTypeSelectOptions = [
  { value: MAP_OBJECTS.EQUIPMENT, label: 'Equipment' },
  { value: MAP_OBJECTS.ROOM, label: 'Room' },
];

type SubTypeOptions = {
  [key in MAP_OBJECTS]: { label: string; value: string }[];
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
