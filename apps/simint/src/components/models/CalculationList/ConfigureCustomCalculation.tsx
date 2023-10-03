import { useState } from 'react';
import { useNavigate } from 'react-location';
import { useSelector } from 'react-redux';

import { Field, Form, Formik } from 'formik';
import styled from 'styled-components/macro';

import { Button, Icon, Input, Modal, Textarea } from '@cognite/cogs.js';
import { useFlag } from '@cognite/react-feature-flags';
import { useSDK } from '@cognite/sdk-provider';

import { selectBaseUrl } from '../../../store/simconfigApiProperties/selectors';
import { createCdfLink } from '../../../utils/createCdfLink';

export function ConfigureCustomCalculation({
  modelName,
  simulator,
}: {
  modelName: string;
  simulator: string;
}) {
  const { isEnabled: isCustomCalculationEnabled } = useFlag('SIMCONFIG_UDC');
  const client = useSDK();
  const baseUrl = useSelector(selectBaseUrl);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const navigate = useNavigate();

  const onSubmit = (values: {
    calculationName: string;
    calculationDescription: string;
  }) => {
    const { calculationDescription, calculationName } = values;
    navigate({
      to: createCdfLink(
        `UserDefined/new-calculation/configuration`,
        baseUrl,
        new URLSearchParams({ calculationDescription, calculationName })
      ),
    });
  };

  const validateCalculationName = async (calcName: string) => {
    if (calcName.length === 0) {
      return 'Field required';
    }

    if (!/^[A-Za-z0-9 ]*$/.test(calcName)) {
      return 'Remove special characters';
    }

    const search = await client.files.list({
      filter: {
        metadata: {
          calcName: calcName.trim(),
          modelName,
          dataType: 'Simulation Configuration',
          simulator,
        },
      },
    });

    if (search.items.length !== 0) {
      return 'Calculation already exists';
    }

    return undefined;
  };

  return (
    <>
      <Modal
        icon="Function"
        size="small"
        title="Create custom calculation"
        visible={isModalOpen}
        hideFooter
        onCancel={() => {
          setIsModalOpen(false);
        }}
      >
        <StyledH4>
          <Icon type="Function" />
          Create simulation routine
        </StyledH4>
        <Formik
          initialValues={{
            calculationName: '',
            calculationDescription: '',
          }}
          onSubmit={onSubmit}
        >
          {({ errors, isValid, values }) => (
            <Form>
              <Field
                as={Input}
                error={errors.calculationName?.length}
                maxLength={25}
                name="calculationName"
                placeholder="Enter name"
                title="Name"
                validate={validateCalculationName}
                fullWidth
              />
              <HelperContainer>
                <div className="error-container">
                  {errors.calculationName && <Icon type="ErrorFilled" />}
                  {errors.calculationName}
                </div>
                <span>{values.calculationName.length}/25</span>
              </HelperContainer>

              <div>
                <StyledTitle htmlFor="calculationDescription">
                  Description
                </StyledTitle>
                <Field
                  as={Textarea}
                  id="calculationDescription"
                  name="calculationDescription"
                  placeholder="Add description"
                  fullWidth
                />
              </div>

              <FooterButtons>
                <Button disabled={!isValid} htmlType="submit" type="primary">
                  Create
                </Button>
                <Button
                  type="ghost"
                  onClick={() => {
                    setIsModalOpen(false);
                  }}
                >
                  Cancel
                </Button>
              </FooterButtons>
            </Form>
          )}
        </Formik>
      </Modal>
      {isCustomCalculationEnabled && (
        <>
          <Button
            icon="Settings"
            size="small"
            type="primary"
            onClick={() => {
              setIsModalOpen(true);
            }}
          >
            Configure
          </Button>
          <span className="name">Create simulation routine</span>
        </>
      )}
    </>
  );
}

const StyledH4 = styled.h4`
  display: flex;
  align-items: center;
  i {
    margin-right: 8px;
  }
`;

const StyledTitle = styled.label`
  display: block;
  margin-bottom: 4px;
  color: var(--cogs-greyscale-grey8);
  font-size: 13px;
  font-weight: 500;
`;

const FooterButtons = styled.div`
  display: flex;
  flex-direction: row-reverse;
  margin-top: 1em;
`;

const HelperContainer = styled.div`
  font-size: 12px;
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
  margin-bottom: 1em;
  .error-container {
    color: var(--cogs-text-icon--status-critical);
    display: flex;
    align-items: center;
    gap: 4px;
  }
`;
