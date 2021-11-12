import React, { PropsWithoutRef } from 'react';
import { ExtpipeFieldName, ExtpipeFieldValue } from 'model/Extpipe';
import DetailsValueView from 'components/table/details/DetailsValueView';
import { AddFieldInfoText } from 'components/message/AddFieldInfoText';
import { splitWordsLowerCase } from 'utils/primitivesUtils';

export const AddInfo = ({
  fieldValue,
  fieldName,
  label,
}: PropsWithoutRef<{
  fieldValue?: ExtpipeFieldValue;
  fieldName: ExtpipeFieldName;
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
