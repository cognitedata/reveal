import React from 'react';
import {
  suiteValidator as suiteValidationRules,
  validateValues,
} from 'validators';
import { Field, Form, Formik, FormikHelpers } from 'formik';
import { Suite } from 'store/suites/types';
import { Button, Icon } from '@cognite/cogs.js';
import omit from 'lodash/omit';
import {
  FormFooter,
  CustomInputContainer,
  CustomSelectContainer,
} from './elements';
import { InputField } from './controls/InputField';
import { TextAreaField } from './controls/TextAreaField';
import ColorSelector from './controls/ColorSelector';

type Props = {
  suite: Suite;
  isNew: boolean;
  handleSave: (values: Partial<Suite>) => void;
  handleEditBoards: (values: Partial<Suite>) => void;
  handleCancel: () => void;
};

export const SuiteForm: React.FC<Props> = ({
  suite,
  isNew,
  handleSave,
  handleEditBoards,
  handleCancel,
}) => {
  const initialFormValues = {
    key: suite.key,
    title: suite.title,
    color: suite.color,
    description: suite.description,
    submitBtn: '',
  };

  const onSubmit = async (
    values: typeof initialFormValues,
    { resetForm }: FormikHelpers<typeof initialFormValues>
  ) => {
    const { submitBtn } = values;
    const suiteValues = omit(values, 'submitBtn');
    if (submitBtn === 'save') {
      handleSave(suiteValues);
      resetForm();
    } else if (submitBtn === 'editBoards') {
      handleEditBoards(suiteValues);
      resetForm();
    }
  };

  return (
    <Formik
      initialValues={{
        ...initialFormValues,
      }}
      validate={(values) => validateValues(values, suiteValidationRules)}
      onSubmit={onSubmit}
      onReset={handleCancel}
    >
      {({ isSubmitting, isValid, dirty, setFieldValue }) => (
        <Form>
          <CustomInputContainer>
            <Field
              name="title"
              title="Title"
              placeholder="Name of suite"
              component={InputField}
            />
          </CustomInputContainer>
          <CustomSelectContainer>
            <Field
              name="color"
              title="Select color"
              component={ColorSelector}
            />
          </CustomSelectContainer>
          <CustomInputContainer>
            <Field
              name="description"
              title="Description"
              maxLength={250}
              placeholder="Description that clearly explains the purpose of the suite"
              component={TextAreaField}
            />
          </CustomInputContainer>
          <FormFooter>
            <Button type="ghost" htmlType="reset" disabled={isSubmitting}>
              Cancel
            </Button>
            <div>
              <Button
                type="primary"
                htmlType="submit"
                onClick={() => {
                  setFieldValue('submitBtn', 'editBoards', false);
                }}
                disabled={!isValid || (isNew && !dirty)}
              >
                {isNew ? 'Add boards' : 'Edit boards'}
              </Button>
              {isSubmitting ? (
                <Icon type="Loading" />
              ) : (
                <Button
                  type="secondary"
                  htmlType="submit"
                  onClick={() => {
                    setFieldValue('submitBtn', 'save', false);
                  }}
                  disabled={!isValid || (isNew && !dirty)}
                >
                  {isNew ? 'Create' : 'Save'}
                </Button>
              )}
            </div>
          </FormFooter>
        </Form>
      )}
    </Formik>
  );
};
