import React, { FunctionComponent } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { Button, Icon } from '@cognite/cogs.js';
import styled from 'styled-components';
import { ButtonPlaced } from 'styles/StyledButton';
import {
  ADD_ROW,
  METADATA_CONTENT_HEADING,
  METADATA_CONTENT_LABEL,
  METADATA_DESC_HEADING,
  METADATA_DESCRIPTION_LABEL,
  REMOVE_ROW,
} from 'utils/constants';
import { InputController } from 'components/inputs/InputController';
import { HeadingLabel } from 'components/inputs/HeadingLabel';

const StyledTd = styled.td`
  .cogs-input {
    margin-bottom: 0;
  }
`;
const MetaTable = styled.table`
  margin-bottom: 1rem;
`;

export const DEFINE_METADATA_LABEL: Readonly<string> = 'Define metadata';
interface RegisterMetaDataProps {}
export type MetaData = { description: string; content: string };
export const RegisterMetaData: FunctionComponent<RegisterMetaDataProps> = () => {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const { append, remove, fields } = useFieldArray({
    control,
    name: 'metadata',
  });

  const addRow = () => {
    append({ description: '', content: '' });
  };
  const removeRow = (index: number) => {
    return function onClickRemove(_: React.MouseEvent<HTMLButtonElement>) {
      remove(index);
    };
  };
  return (
    <>
      <HeadingLabel labelFor="register-metadata-table">
        {DEFINE_METADATA_LABEL}
      </HeadingLabel>
      <MetaTable
        id="register-metadata-table"
        className="cogs-table integrations-table"
        role="grid"
        aria-label="List of meta data"
      >
        <thead>
          <tr>
            <th
              id="description-heading"
              scope="col"
              className={`description'-col`}
            >
              {METADATA_DESC_HEADING}
            </th>
            <th id="content-heading" scope="col" className="content-col">
              {METADATA_CONTENT_HEADING}
            </th>
            <th scope="col" className="content-col" aria-label={REMOVE_ROW} />
          </tr>
        </thead>
        <tbody>
          {fields.map((field, index) => {
            return (
              <tr key={`${field.id}`}>
                <StyledTd>
                  <InputController
                    name={`metadata.${index}.description`}
                    control={control}
                    inputId={`metadata-description-${index}`}
                    aria-invalid={!!errors.metadata?.[index]?.description}
                    aria-label={`${METADATA_DESCRIPTION_LABEL} ${index}`}
                  />
                </StyledTd>
                <StyledTd>
                  <InputController
                    name={`metadata.${index}.content`}
                    control={control}
                    inputId={`metadata-content-${index}`}
                    aria-invalid={!!errors.metadata?.[index]?.content}
                    aria-label={`${METADATA_CONTENT_LABEL} ${index}`}
                  />
                </StyledTd>
                <StyledTd>
                  <Button
                    type="tertiary"
                    aria-label={`${REMOVE_ROW} ${index}`}
                    onClick={removeRow(index)}
                  >
                    <Icon type="Trash" />
                  </Button>
                </StyledTd>
              </tr>
            );
          })}
        </tbody>
      </MetaTable>
      <ButtonPlaced type="secondary" htmlType="button" onClick={addRow}>
        {ADD_ROW}
      </ButtonPlaced>
    </>
  );
};
