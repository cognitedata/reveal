export type DataModelLibraryTemplateItem = {
  name: string;
  versions: { dml: string; version: string; date: Date }[];
  tags?: string[];
  description?: string;
};

export type DataModelLibraryItem = {
  id: string;
  isTemplate?: boolean;
} & DataModelLibraryTemplateItem;

export const library: { [key in string]: DataModelLibraryTemplateItem } = {
  'Cognite:MovieDM': {
    name: 'Movie and actors',
    description: 'Sample data model from data modeling tutorial',
    tags: ['Tutorial'],
    versions: [
      {
        dml: `type Actor implements Person {
  name: String!
  age: Int
  didWinOscar: Boolean
}

type Director implements Person {
  name: String!
  age: Int
  didWinOscar: Boolean
}

interface Person {
  name: String!
  age: Int
}

type Movie {
  name: String!
  description: String
  watchedIt: Boolean
  imdbRating: Float
  releasedYear: Int
  gross: Int
  runTime: Int
  director: Director
  actors: [Actor]
}`,
        version: '1',
        date: new Date('2023-04-03'),
      },
    ],
  },
};
