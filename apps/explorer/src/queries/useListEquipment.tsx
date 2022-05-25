import { gql } from '@apollo/client';

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: findEquipment
// ====================================================

export interface findEquipment_equipments_items_person {
  __typename: 'Person';
  name: string | null;
  slackId: string | null;
}

export interface findEquipment_equipments_items_room_building {
  __typename: 'Building';
  externalId: string;
  name: string | null;
}

export interface findEquipment_equipments_items_room {
  __typename: 'Room';
  externalId: string;
  type: string | null;
  name: string | null;
  building: findEquipment_equipments_items_room_building | null;
}

export interface findEquipment_equipments_items {
  __typename: 'Equipment';
  externalId: string;
  type: string | null;
  name: string | null;
  isBroken: boolean | null;
  person: findEquipment_equipments_items_person | null;
  room: findEquipment_equipments_items_room | null;
}

export interface findEquipment_equipments {
  __typename: 'EquipmentConnection';
  items: (findEquipment_equipments_items | null)[];
}

export interface findEquipment {
  equipments: findEquipment_equipments | null;
}

export interface findEquipmentVariables {
  filter: _ListEquipmentFilter;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

export interface _BooleanCondition {
  eq?: boolean | null;
  isNull?: boolean | null;
  in?: boolean[] | null;
}

export interface _IDCondition {
  eq?: string | null;
  isNull?: boolean | null;
  in?: string[] | null;
}

export interface _ListBuildingFilter {
  and?: _ListBuildingFilter[] | null;
  or?: _ListBuildingFilter[] | null;
  not?: _ListBuildingFilter | null;
  externalId?: _IDCondition | null;
  name?: _StringCondition | null;
  description?: _StringCondition | null;
  thumbnail?: _StringCondition | null;
}

export interface _ListEquipmentFilter {
  and?: _ListEquipmentFilter[] | null;
  or?: _ListEquipmentFilter[] | null;
  not?: _ListEquipmentFilter | null;
  externalId?: _IDCondition | null;
  type?: _StringCondition | null;
  name?: _StringCondition | null;
  isBroken?: _BooleanCondition | null;
  room?: _ListRoomFilter | null;
  person?: _ListPersonFilter | null;
}

export interface _ListPersonFilter {
  and?: _ListPersonFilter[] | null;
  or?: _ListPersonFilter[] | null;
  not?: _ListPersonFilter | null;
  externalId?: _IDCondition | null;
  name?: _StringCondition | null;
  slackId?: _StringCondition | null;
  desk?: _ListEquipmentFilter | null;
  team?: _ListTeamFilter | null;
}

export interface _ListRoomFilter {
  and?: _ListRoomFilter[] | null;
  or?: _ListRoomFilter[] | null;
  not?: _ListRoomFilter | null;
  externalId?: _IDCondition | null;
  type?: _StringCondition | null;
  name?: _StringCondition | null;
  description?: _StringCondition | null;
  isBookable?: _BooleanCondition | null;
  building?: _ListBuildingFilter | null;
}

export interface _ListTeamFilter {
  and?: _ListTeamFilter[] | null;
  or?: _ListTeamFilter[] | null;
  not?: _ListTeamFilter | null;
  externalId?: _IDCondition | null;
  name?: _StringCondition | null;
}

export interface _StringCondition {
  eq?: string | null;
  isNull?: boolean | null;
  in?: string[] | null;
  gt?: string | null;
  lt?: string | null;
  gte?: string | null;
  lte?: string | null;
  prefix?: string | null;
}

//==============================================================
// END Enums and Input Objects
//==============================================================

export const EquipmentsQuery = gql`
  query findEquipment($filter: _ListEquipmentFilter!) {
    equipments: listEquipment(first: 15, filter: $filter) {
      items {
        externalId
        type
        name
        isBroken
        person {
          name
          slackId
        }
        room {
          externalId
          type
          name
          building {
            externalId
            name
          }
        }
      }
    }
  }
`;
