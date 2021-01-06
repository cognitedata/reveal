import React from 'react';
import { Input, Micro } from '@cognite/cogs.js';
import { Suite } from 'store/suites/types';
import { TS_FIX_ME } from 'types/core';
import {
  CustomInputContainer,
  CustomLabel,
  Textarea,
  ValidationContainer,
} from 'components/modals/elements';
import { useForm } from 'hooks/useForm';
import { suiteValidator } from 'validators';
import ColorSelector from './ColorSelector';

interface Props {
  suite: Suite;
  setSuite: TS_FIX_ME;
}

export const SuiteForm: React.FC<Props> = ({ suite, setSuite }: Props) => {
  const { errors, setErrors, validateField } = useForm(suiteValidator);
  const maxDescriptionLength = 250;
  const warningLength = 200;
  const exceedMaxLength = suite.description.length >= maxDescriptionLength;
  const exceedWarningLength = suite.description.length >= warningLength;

  const handleOnChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { value, name } = event.target;
    setSuite((prevState: Suite) => ({
      ...prevState,
      [name]: value,
    }));
    setErrors((prevState: Suite) => ({
      ...prevState,
      [name]: validateField(name, value),
    }));
  };

  return (
    <>
      <CustomInputContainer>
        <Input
          autoComplete="off"
          title="Title"
          name="title"
          error={errors?.title}
          value={suite.title}
          variant="noBorder"
          placeholder="Name of suite"
          onChange={handleOnChange}
          fullWidth
        />
      </CustomInputContainer>
      <ColorSelector suite={suite} setSuite={setSuite} />
      <CustomInputContainer>
        <CustomLabel>Description</CustomLabel>
        <Textarea
          autoComplete="off"
          className={errors?.description && 'has-error'}
          title="Description"
          name="description"
          value={suite.description}
          placeholder="Description that clearly explains the purpose of the suite"
          onChange={handleOnChange}
        />
        <ValidationContainer exceedWarningLength={exceedMaxLength}>
          {errors?.description && (
            <span className="error-space">{errors?.description}</span>
          )}
          {exceedWarningLength && (
            <Micro>
              {suite.description.length}/{maxDescriptionLength}
            </Micro>
          )}
        </ValidationContainer>
      </CustomInputContainer>
    </>
  );
};
