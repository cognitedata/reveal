import { useState } from 'react';
import { useNavigate } from 'react-location';

import { Field, Form, Formik } from 'formik';
import styled from 'styled-components/macro';

import { Button, Icon, Input, Modal } from '@cognite/cogs.js';
import { useFlag } from '@cognite/react-feature-flags';
import { useSDK } from '@cognite/sdk-provider';

import { createCdfLink } from 'utils/createCdfLink';

export function ConfigureCustomCalculation({
  modelName,
  simulator,
}: {
  modelName: string;
  simulator: string;
}) {
  const { isEnabled: isCustomCalculationEnabled } = useFlag('SIMCONFIG_UDC');
  const client = useSDK();
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
        client.getBaseUrl(),
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
    console.log({ items: search.items });
    if (search.items.length !== 0) {
      return 'Calculation already exists';
    }

    return undefined;
  };

  return (
    <>
      <Modal
        appElement={document.getElementById('root') ?? undefined}
        footer={null}
        style={{
          padding: 0,
        }}
        visible={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
        }}
      >
        <h4>
          <Icon type="Function" /> Create custom calculation
        </h4>
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

              <Field
                as={Input}
                name="calculationDescription"
                title="Description"
                fullWidth
              />
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
            className="configure-calculation"
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
