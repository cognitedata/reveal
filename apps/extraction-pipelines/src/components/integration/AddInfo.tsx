import React, { PropsWithoutRef } from 'react';
import { IntegrationFieldName, IntegrationFieldValue } from 'model/Integration';
import { splitWordsLowerCase } from 'utils/primitivesUtils';
import DetailsValueView from 'components/table/details/DetailsValueView';
import { AddFieldInfoText } from 'components/message/AddFieldInfoText';

export const AddInfo = ({
  fieldValue,
  fieldName,
  label,
}: PropsWithoutRef<{
  fieldValue?: IntegrationFieldValue;
  fieldName: IntegrationFieldName;
  label?: string;
}>) => {
  if (!fieldValue) {
    return (
      <AddFieldInfoText>
        {label ?? splitWordsLowerCase(fieldName)}
      </AddFieldInfoText>
    );
  }
  return (
    <>
      <DetailsValueView fieldName={fieldName} fieldValue={fieldValue} />
    </>
  );
};
