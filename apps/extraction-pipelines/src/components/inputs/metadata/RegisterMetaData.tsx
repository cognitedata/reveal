import React, { FunctionComponent } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { Button, Colors, Icon } from '@cognite/cogs.js';
import styled from 'styled-components';
import {
  ADD_ROW,
  METADATA_CONTENT_LABEL,
  METADATA_DESCRIPTION_LABEL,
  REMOVE_ROW,
} from '../../../utils/constants';

const StyledTd = styled.td`
  .cogs-input {
    margin-bottom: 0;
  }
`;
const MetaTable = styled.table`
  margin-bottom: 1rem;
`;
const StyledCaption = styled.caption`
  caption-side: top;
  font-size: 0.875rem;
  font-weight: bold;
  color: ${Colors.black.hex()};
`;
const AddRowBtn = styled(Button)`
  margin-bottom: 1rem;
`;
const StyledInput = styled.input`
  width: 100%;
  &.has-error {
    border-color: ${Colors.danger.hex()};
  }
  &:focus {
    outline: -webkit-focus-ring-color auto 0.0625rem;
    outline-offset: 0.0625rem;
  }
`;

interface RegisterMetaDataProps {}
export type MetaData = { description: string; content: string };
export const RegisterMetaData: FunctionComponent<RegisterMetaDataProps> = () => {
  const { control, register, errors } = useFormContext();
  const { append, remove, fields } = useFieldArray({
    control,
    name: 'metadata',
  });

  function addRow() {
    append({ description: '', content: '' });
  }
  function removeRow(index: number) {
    return function onClickRemove(_: React.MouseEvent<HTMLButtonElement>) {
      remove(index);
    };
  }
  return (
    <>
      <MetaTable
        className="cogs-table integrations-table"
        role="grid"
        aria-label="List of meta data"
      >
        <StyledCaption>Define metadata</StyledCaption>
        <thead>
          <tr>
            <th
              id="description-heading"
              scope="col"
              className={`description'-col`}
            >
              Description
            </th>
            <th id="content-heading" scope="col" className="content-col">
              Content
            </th>
            <th scope="col" className="content-col" aria-label={REMOVE_ROW} />
          </tr>
        </thead>
        <tbody>
          {fields.map(({ id, description, content }, index) => {
            return (
              <tr key={`${id}`}>
                <StyledTd>
                  <StyledInput
                    id={`metadata-description-${index}`}
                    name={`metadata[${index}].description`}
                    type="text"
                    ref={register}
                    defaultValue={description}
                    className={`cogs-input ${
                      errors.metadata?.[index]?.description ? 'has-error' : ''
                    }`}
                    aria-invalid={!!errors.metadata?.[index]?.description}
                    aria-label={`${METADATA_DESCRIPTION_LABEL} ${index}`}
                  />
                </StyledTd>
                <StyledTd>
                  <StyledInput
                    id={`metadata-content-${index}`}
                    name={`metadata[${index}].content`}
                    type="text"
                    ref={register}
                    defaultValue={content}
                    className={`cogs-input ${
                      errors.metadata?.[index]?.content ? 'has-error' : ''
                    }`}
                    aria-invalid={!!errors.metadata?.[index]?.content}
                    aria-label={`${METADATA_CONTENT_LABEL} ${index}`}
                  />
                </StyledTd>
                <StyledTd>
                  <Button
                    type="secondary"
                    variant="outline"
                    aria-label={`${REMOVE_ROW} ${index}`}
                    onClick={removeRow(index)}
                  >
                    <Icon type="Delete" />
                  </Button>
                </StyledTd>
              </tr>
            );
          })}
        </tbody>
      </MetaTable>
      <AddRowBtn type="secondary" htmlType="button" onClick={addRow}>
        {ADD_ROW}
      </AddRowBtn>
    </>
  );
};
