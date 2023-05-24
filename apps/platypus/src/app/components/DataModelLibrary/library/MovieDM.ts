import { DataModelLibraryTemplateItem } from '.';

export const MovieDM: DataModelLibraryTemplateItem = {
  name: 'Movie and actors',
  description: 'Sample data model from data modeling tutorial',
  category: 'Tutorial',
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
};
