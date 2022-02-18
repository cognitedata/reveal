export const newSchemaGraphQl = `
type Person @template {
  firstName: String
  lastName: String
  email: String
  age: Long
}

type Product @template {
  name: String
  price: Float
  image: String
  description: String
}

type Category @template {
  name: String
  products: [Product]
}

`;
export const newSchemaTemplateGroup = {
  version: 1,
  schema: newSchemaGraphQl,
  createdTime: 1639476522639,
  lastUpdatedTime: 1639477614908,
  templategroups_id: 'new-schema',
  db: {
    Person: [
      {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@email.com',
        age: 30,
      },
      {
        id: 2,
        firstName: 'James',
        lastName: 'Bond',
        email: 'james.bond@email.com',
        age: 36,
      },
      {
        id: 3,
        firstName: 'Emily',
        lastName: 'Venny',
        email: 'Emily.Venny@email.com',
        age: 25,
      },
      {
        id: 4,
        firstName: 'James',
        lastName: 'Bond 007',
        email: 'james.bond007@email.com',
        age: 40,
      },
    ],
    Product: [
      {
        id: 1,
        name: 'iPhone',
        description: "Worlds's best Smartphone",
        price: 999,
        image: 'https://picsum.photos/200/300',
        category_id: 1,
      },
    ],
    Category: [
      {
        id: 1,
        name: 'Electronics',
      },
    ],
  },
};
