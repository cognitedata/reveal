export const mockComplexGraphqlModel = `"Equipment represents a physical asset"
type Equipment {
  "The ID of the equipment"
  id: ID! @id
  documents: [Document!]! @relation(name: "HAS_DOCUMENT", direction: OUT)
  tag: String @search @unique @index
}

type Document {
  id: ID! @id
  mimeType: DocType! @required @search
  filepath: String @search
  entities: [Equipment] @relation(name: "HAS_DOCUMENT", direction: IN)
}

type DocType {
  ID: ID! @id
  type: String! @required
}

interface Area {
  floor: Int!
  name: String!
}

type OfficeArea implements Area {
  id: ID! @id
  floor: Int!
  name: String!
  numEmployees: Int!
}

type ParkingArea implements Area {
  id: ID! @id
  numCars: Int!
  floor: Int!
  name: String!
  rentalCost: String
}

union Areas = ParkingArea | OfficeArea
`;
