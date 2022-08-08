import { Equipment, Person, Room } from 'graphql/generated';

export type EquipmentMutate = Omit<Equipment, 'person' | 'room'> & {
  person?: string | undefined | null;
  room?: string | undefined | null;
};

export type PersonMutate = Omit<Person, 'team' | 'desk'> & {
  team: string | undefined | null;
  desk: string | undefined | null;
};

export type RoomMutate = Omit<Room, 'building'> & {
  building: string | undefined;
};
