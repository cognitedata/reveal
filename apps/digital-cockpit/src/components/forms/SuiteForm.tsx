import React, { useEffect, useState, useContext } from 'react';
import {
  suiteValidator as suiteValidationRules,
  validateValues,
  ValidationErrors as CustomValidationErrors,
} from 'validators';
import { Field, Form, Formik, FormikHelpers } from 'formik';
import { Suite } from 'store/suites/types';
import { Button, Icon } from '@cognite/cogs.js';
import omit from 'lodash/omit';
import { useDispatch, useSelector } from 'react-redux';
import * as actions from 'store/forms/actions';
import { CdfClientContext } from 'providers/CdfClientProvider';
import { filesUploadState } from 'store/forms/selectors';
import { updateFileInfoState } from 'store/forms/thunks';
import { RootDispatcher } from 'store/types';

import {
  FormFooter,
  CustomInputContainer,
  CustomSelectContainer,
} from './elements';
import { InputField } from './controls/InputField';
import { TextAreaField } from './controls/TextAreaField';
import ColorSelector from './controls/ColorSelector';
import { FileUpload } from './controls/FileUpload';

type Props = {
  suite: Suite;
  isNew: boolean;
  handleSave: (values: Partial<Suite>) => void;
  handleEditBoards: (values: Partial<Suite>) => void;
  handleCancel: () => void;
  filesUploadQueue: Map<string, File>;
  withThumbnail?: boolean;
};

export const SuiteForm: React.FC<Props> = ({
  suite,
  isNew,
  handleSave,
  handleEditBoards,
  handleCancel,
  filesUploadQueue,
  withThumbnail = false,
}) => {
  const initialFormValues = {
    key: suite.key,
    title: suite.title,
    color: suite.color,
    description: suite.description,
    submitBtn: '',
    imageFileId: suite.imageFileId,
  };

  const client = useContext(CdfClientContext);
  const dispatch = useDispatch<RootDispatcher>();
  const [customErrors, setCustomErrors] = useState<CustomValidationErrors>({});
  const { deleteQueue } = useSelector(filesUploadState);

  useEffect(() => {
    suite.imageFileId &&
      dispatch(updateFileInfoState(client, suite.imageFileId));
  }, [suite, dispatch, client]);

  const clear = () => {
    // remove current file from upload queue
    filesUploadQueue.delete(suite.key);

    setCustomErrors({});

    // remove current file from delete queue
    if (deleteQueue.includes(suite.key)) {
      dispatch(actions.excludeFileFromDeleteQueue(suite.key));
    }
    // reset file state
    dispatch(actions.clearFile());
  };

  const onSubmit = async (
    values: typeof initialFormValues,
    { resetForm }: FormikHelpers<typeof initialFormValues>
  ) => {
    const { submitBtn } = values;
    const suiteValues = omit(values, 'submitBtn');

    if (suite.imageFileId && deleteQueue.includes(suite.imageFileId)) {
      suiteValues.imageFileId = undefined;
    }

    if (submitBtn === 'save') {
      await handleSave(suiteValues);
    } else if (submitBtn === 'editBoards') {
      await handleEditBoards(suiteValues);
    }
    resetForm();
    clear();
  };

  return (
    <Formik
      initialValues={{
        ...initialFormValues,
      }}
      validate={(values) =>
        validateValues(values, suiteValidationRules, customErrors)
      }
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
          {withThumbnail && (
            <CustomInputContainer>
              <Field
                name="imageFileId"
                component={FileUpload}
                setCustomErrors={setCustomErrors}
                itemKey={suite.key}
                labelText="Upload a thumbnail image"
                filesUploadQueue={filesUploadQueue}
              />
            </CustomInputContainer>
          )}
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
            <Button
              type="ghost"
              htmlType="reset"
              disabled={isSubmitting}
              onClick={() => {
                clear();
                handleCancel();
              }}
            >
              Cancel
            </Button>
            <div>
              {isSubmitting ? (
                <Icon type="Loader" />
              ) : (
                <>
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
                </>
              )}
            </div>
          </FormFooter>
        </Form>
      )}
    </Formik>
  );
};
