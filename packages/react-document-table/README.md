<a href="https://cognite.com/">
    <img src="./cognite_logo.png" alt="Cognite logo" title="Cognite" align="right" height="80" />
</a>

# react-document-table

DocumentTable is a react component for rendering documents grouped by categories.

The following props are allowed:

```javascript
    // You can pass a className to this component, such as for testing or styling purposes
    className?: string;
    // list of documents
    docs: Document[];
    // handle file name click
    handleDocumentClick: (document: Document, category: string, description: string) => void;
    // Antd Collapse props
    collapseProps?: CollapseProps;
    // Array of how categories should be prioritized
    categoryPriorityList?: string[];
    // Sign if category undefined
    unknownCategoryName?: string;
    // Which metadata field to look for document title
    documentTitleField?: string[];
    // Which metadata field to look for document category type
    documentTypeField?: string[];
    // JSON of category types and descriptions
    docTypes?: JsonDocTypes;
    // Empty documents sign
    noDocumentsSign?: string | React.ReactNode;
    // How to render document description inside the category
    documentRenderer?: DocumentRenderer;
    // Whether all panels should be expanded by default
    // If this is true, collapseProps.accordion must not be true
    defaultExpandAll?: boolean;
    // Whether an expanded category will be horizontally scrollable in case of a
    // very long name and description. If not, long text will be truncated with ellipsis
    // Default behaviour is ellipsis truncation
    scrollX?: boolean;
```

## Setup

Run `yarn`

## Run

Run `yarn start`

## Storybook

To showcase your component you can use storybooks by introducing different stories for your component

Run `yarn storybook`

## Tests

Utilising Jest and Enzyme you can test your component

Run `yarn test`

## License

[Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)
