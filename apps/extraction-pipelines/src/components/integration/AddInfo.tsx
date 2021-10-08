import React, { PropsWithoutRef } from 'react';
import { IntegrationFieldName, IntegrationFieldValue } from 'model/Integration';
import DetailsValueView from 'components/table/details/DetailsValueView';

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
    return <span>No value given here</span>;
    // return (
    //   <AddFieldInfoText>
    //     {label ?? splitWordsLowerCase(fieldName)}
    //   </AddFieldInfoText>
    // );
  }
  return (
    <>
      <DetailsValueView fieldName={fieldName} fieldValue={fieldValue} />
    </>
  );
};
