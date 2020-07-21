import { docTypes } from './docTypes';
import {
  CategoryByDocumentId,
  Document,
  DocumentsByCategory,
  DocumentType,
  JsonDocTypes,
  Metadata,
  Priority,
} from './types';

const maxDocumentTitleLength = 56;
const documentTypesOptions = ['DOC_TYPE', 'doc_type'];
const documentTitleOptions = ['DOC_TITLE', 'title'];

const getPriorityObjectFromArray = (list: string[]): Priority =>
  list.reduce((acc, p, i) => ({ ...acc, [p]: i + 1 }), {});

const sortDocsByPriority = (a: string, b: string, priority: Priority) =>
  (priority[a] || Number.MAX_SAFE_INTEGER) -
  (priority[b] || Number.MAX_SAFE_INTEGER);

const getValueFromObject = (metadata?: Metadata, arr?: string[]): string => {
  if (!metadata || !arr) {
    return '';
  }
  const data = objKeysToLowerCase(metadata);
  return arr.reduce((acc, name) => {
    if (!acc) {
      return data[name.toLowerCase()] || '';
    }
    return acc;
  }, '');
};

const objKeysToLowerCase = (obj?: Metadata): Metadata =>
  obj
    ? Object.keys(obj).reduce((acc: Metadata, key) => {
        acc[key.toLowerCase()] = obj[key];
        return acc;
      }, {})
    : {};

const getDocumentType = (
  metadata?: Metadata,
  documentTypeField?: string[]
): string => {
  const names = documentTypeField || documentTypesOptions;
  return getValueFromObject(metadata, names);
};

export const getCategoryName = (
  keyList: string[],
  unknownCategoryName = 'Unknown document type',
  types: JsonDocTypes = docTypes
): DocumentType => {
  // Unknown type also needs to have a key if we want to make it default-expandable
  const key = keyList.find((item) => !!types[item]) || 'UNKNOWN';
  return {
    key,
    description: types[key] || unknownCategoryName,
  };
};

export const getCategoryByPriority = (
  docsByCat: {
    [s: string]: unknown;
  },
  priorityList: string[] = []
) => {
  const priorityObject = getPriorityObjectFromArray(priorityList);
  return Object.keys(docsByCat).sort((a, b) =>
    sortDocsByPriority(a, b, priorityObject)
  );
};

export const getKeyList = (
  document: Document,
  documentTypeField?: string[]
) => {
  return [
    getDocumentType(document.metadata, documentTypeField),
    // if not found try to find category in file name
    ...document.fileName.split('-'),
  ];
};

export const getKeyAndDescription = (
  document: Document,
  unknownCategoryName?: string,
  types: JsonDocTypes = docTypes,
  documentTypeField?: string[]
) => {
  const keyList = getKeyList(document, documentTypeField);
  return getCategoryName(keyList, unknownCategoryName, types);
};

export const getCategoryByDocumentId = (
  docs: Document[],
  unknownCategoryName?: string,
  types: JsonDocTypes = docTypes,
  documentTypeField?: string[]
): CategoryByDocumentId =>
  docs.reduce((acc: CategoryByDocumentId, document) => {
    const { key, description } = getKeyAndDescription(
      document,
      unknownCategoryName,
      types,
      documentTypeField
    );
    return {
      ...acc,
      [document.id]: {
        ...acc[document.id],
        description,
        document,
        category: key,
      },
    };
  }, {});

export const getDocumentsByCategory = (
  docs: Document[],
  unknownCategoryName?: string,
  types: JsonDocTypes = docTypes,
  documentTypeField?: string[]
): DocumentsByCategory =>
  docs.reduce((acc: DocumentsByCategory, doc) => {
    const { key, description } = getKeyAndDescription(
      doc,
      unknownCategoryName,
      types,
      documentTypeField
    );
    const documents = acc[key] ? acc[key].documents : [];
    return {
      ...acc,
      [key]: {
        ...acc[key],
        description,
        documents: [...documents, doc],
      },
    };
  }, {});

export const getDocumentTitle = (
  metadata?: Metadata,
  documentTitleField?: string[]
): string => {
  const names = documentTitleField || documentTitleOptions;
  return getValueFromObject(metadata, names);
};

export const getShortDescription = (description: string) => {
  return description.length > maxDocumentTitleLength
    ? `${description.substring(0, maxDocumentTitleLength)}...`
    : description;
};
