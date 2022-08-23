# @cognite/react-document-search

Headless UI for the document search api

## Installation

```sh
yarn add @cognite/react-document-search
```

## Background

### Search phrase

The phrase to search for specific documents.

### Facets

Available filters to apply:

- File Category
- Labels
- Last Modified
- Last Created
- Location
- Page Count
- Authors

## Setup

Setup the provider with your applications instantiated Cognite client. Wrap the provider at the desired component level.

```javascript
<DocumentSearchProvider cogniteClient={client}>...app</DocumentSearchProvider>
```

## Usage

#### Read the document results data

```javascript
const { results, isFetching, hasNextPage, fetchNextPage } =
  useDocumentSearchQuery();
```

_see [react query docs](https://tanstack.com/query/v4/docs/reference/useInfiniteQuery) for more information_

#### Read filters and search phrase applied

```javascript
const { phrase, facets } = useDocumentSearchQuery();
```

#### Update filters and search phrase applied

```javascript
const { setSearchPhrase, setSearchFilters } = useDocumentSearchDispatch();

setSearchPhrase('test');
```

Triggering a search event will automatically fetch and update the
documents results in the `useDocumentSearchQuery` hook.

##### Read applied filters facets

```javascript
const appliedFacet = useDocumentSearchAppliedFacetFilters('authors');
```

With that hook you can easily append the state of a facets, e.g.,

```javascript
const facet = 'labels';
const appliedFacet = useDocumentSearchAppliedFacetFilters(facets);
const { setSearchFilters } = useDocumentSearchDispatch();

setSearchFilters({
  [facet]: {
    ...appliedFacets,
    newLabel,
  },
});
```

###Optional
To get a more safe and readable document type, use the `normalize` function:

```javascript
import {
  normalize,
  useDocumentSearchQuery,
} from '@cognite/react-document-search';

const { results } = useDocumentSearchQuery();

const normalizedDocuments = results.hits.map((document) => normalize(document));
```

### Todo

- Rename 'lastcreated' to something else
- Create a hook to fetch which filters are available for each category
- Extract 'document category' logic from Discover Api
