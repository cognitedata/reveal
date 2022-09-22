# @cognite/react-document-search

A collection of hooks to perform document search and aggregation using `react-query`

## Installation

```sh
yarn add @cognite/react-document-search
```

## Setup

Setup the provider with your applications instantiated Cognite client. Wrap the provider at the desired component level.

```javascript
<DocumentSearchProvider sdkClient={client}>...app</DocumentSearchProvider>
```

## Usage

#### Read the document results data

```javascript
const { results } = useDocumentSearch();
```

_see [react query docs](https://tanstack.com/query/v4/docs/reference/useInfiniteQuery) for more information_

#### Read filters and search phrase applied

```javascript
const { appliedFilters } = useDocumentFilters();
```

#### Update filters and search phrase applied

```javascript
const { setAppliedFilters } = useDocumentFilters();

setAppliedFilters({
  search: {
    query: 'test',
  },
});
```

Triggering a search event will automatically fetch and update the
documents results in the `useDocumentSearch` hook.

##### Get aggregates (total and filtered)

```javascript
const { data: count } = useDocumentAggregateCount();
const { data: filtereCdount } = useDocumentFilteredAggregateCount();

const { data: totalAggregates } = useDocumentTotalAggregates([
  { property: 'author' },
]);
const { data: filteredAggregates } = useDocumentFilteredAggregates([
  { property: 'author' },
]);
```
