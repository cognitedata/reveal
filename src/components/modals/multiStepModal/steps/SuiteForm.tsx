import React from 'react';
import { Input, Micro } from '@cognite/cogs.js';
import { useSelector, useDispatch } from 'react-redux';
import { setSuite } from 'store/forms/actions';
import { suiteState } from 'store/forms/selectors';
import {
  CustomInputContainer,
  CustomLabel,
  Textarea,
  ValidationContainer,
} from 'components/modals/elements';
import { useForm } from 'hooks';
import { suiteValidator } from 'validators';
import { RootDispatcher } from 'store/types';
import ColorSelector from './ColorSelector';

export const SuiteForm: React.FC = () => {
  const { errors, validateField, touched } = useForm(suiteValidator);
  const suite = useSelector(suiteState);
  const dispatch = useDispatch<RootDispatcher>();
  const maxDescriptionLength = 250;
  const warningLength = 200;
  const exceedMaxLength = suite.description.length >= maxDescriptionLength;
  const exceedWarningLength = suite.description.length >= warningLength;

  const handleOnChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { value, name } = event.target;
    dispatch(
      setSuite({
        ...suite,
        [name]: value,
      })
    );
    validateField(name, value);
  };

  const handleOnBlur = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { value, name } = event.target;
    validateField(name, value);
  };

  return (
    <>
      <CustomInputContainer>
        <Input
          autoComplete="off"
          title="Title"
          name="title"
          error={touched.title && errors?.title}
          value={suite.title}
          variant="noBorder"
          placeholder="Name of suite"
          onChange={handleOnChange}
          onBlur={handleOnBlur}
          fullWidth
        />
      </CustomInputContainer>
      <ColorSelector />
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
          onBlur={handleOnBlur}
          maxLength={maxDescriptionLength}
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
