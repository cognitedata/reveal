import { Equipment, Person, Room } from 'graphql/generated';

export type EquipmentMutate = Omit<Equipment, 'person'> & {
  person: string | undefined | null;
};

export type PersonMutate = Omit<Person, 'team' | 'desk'> & {
  team: string | undefined | null;
  desk: string | undefined | null;
};

export type RoomMutate = Omit<Room, 'building'> & {
  building: string | undefined;
};
