import { DataModelTypeDefsType, KeyValueMap } from '@platypus/platypus-core';
import { BLACKLISTED_ROW_ATTRIBUTES } from './constant';

export const sanitizeRow = (row: KeyValueMap) => {
  const cleanRow = { ...row };
  Object.keys(cleanRow).forEach((attr) => {
    if (BLACKLISTED_ROW_ATTRIBUTES.includes(attr)) {
      delete cleanRow[attr];
    }
  });
  return cleanRow;
};

/**
 * Give a suggestions count based on any "single" relationship with data
 */
export const getSuggestionsAvailable = ({
  dataModelType,
  previewData,
}: {
  dataModelType: DataModelTypeDefsType;
  previewData: KeyValueMap[];
}) => {
  const directRelations = () => {
    if (!previewData) {
      return 0;
    }
    const directRelationships = dataModelType.fields.filter(
      (el) => !el.type.list && el.type.custom
    );

    const filledProperties = new Set<string>(
      directRelationships.map((el) => el.name)
    );
    const emptyProperties = new Set<string>(
      directRelationships.map((el) => el.name)
    );

    previewData.forEach((item) =>
      directRelationships.forEach((property) => {
        if (item[property.name] && emptyProperties.has(property.name)) {
          emptyProperties.delete(property.name);
        }
        if (!item[property.name] && filledProperties.has(property.name)) {
          filledProperties.delete(property.name);
        }
      })
    );
    return (
      directRelationships.length - emptyProperties.size - filledProperties.size
    );
  };
  return directRelations() > 0;
};
