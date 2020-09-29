import React from 'react';
import ReactDOM from 'react-dom';
import { Form } from 'antd';
import { mount } from 'enzyme';
import CreateScheduleModal, { stuffForUnitTests } from './CreateScheduleModal';

const mockFunctionExternalId = 'external id';

describe('CreateScheduleModal', () => {
  describe('component', () => {
    it('renders without crashing', () => {
      expect(() => {
        const div = document.createElement('div');
        ReactDOM.render(
          <CreateScheduleModal
            onCancel={jest.fn()}
            externalId={mockFunctionExternalId}
          />,

          div
        );
        ReactDOM.unmountComponentAtNode(div);
      }).not.toThrow();
    });

    it('should call onCancel when button is clicked', () => {
      const cancelFunc = jest.fn();
      const wrapper = mount(
        <CreateScheduleModal
          onCancel={cancelFunc}
          externalId={mockFunctionExternalId}
        />
      );

      const b = wrapper.find('button.ant-modal-close');
      b.simulate('click');
      expect(cancelFunc).toBeCalledTimes(1);

      // should also dispatch createschedulereset

      wrapper.unmount();
    });

    it('should have input areas for all the necessary information', () => {
      // should have schedule name, description, cronExpression, data
      const wrapper = mount(
        <CreateScheduleModal
          onCancel={jest.fn()}
          externalId={mockFunctionExternalId}
        />
      );
      const allFormItems = wrapper.find(Form.Item);
      expect(allFormItems).toHaveLength(4);
      const allFormItemsLabels = allFormItems.map(i => i.text());
      expect(allFormItemsLabels).toContain('Schedule Name');
      expect(allFormItemsLabels).toContain('Description');
      expect(allFormItemsLabels).toContain('Cron Expression');
      expect(allFormItemsLabels).toContain('Data');
      wrapper.unmount();
    });

    it('should have disabled create button by default', () => {
      const wrapper = mount(
        <CreateScheduleModal
          onCancel={jest.fn()}
          externalId={mockFunctionExternalId}
        />
      );
      const createButton = wrapper
        .find('button.cogs-btn')
        .filterWhere((b: ReactWrapper) => b.text() === 'Create');
      expect(createButton.prop('disabled')).toBe(true);
      wrapper.unmount();
    });

    it('should allow function upload if all criteria is met', () => {
      // criteria: name and cronExpression exist
      const mockScheduleName = 'mockScheduleName';
      const mockCronExpression = '* * * * *';

      const wrapper = mount(
        <CreateScheduleModal
          onCancel={jest.fn()}
          externalId={mockFunctionExternalId}
        />
      );
      const nameInput = wrapper.find('input[name="scheduleName"]');
      nameInput.simulate('change', { target: { value: mockScheduleName } });
      const cronExpressionInput = wrapper.find('input[name="cronExpression"]');
      cronExpressionInput.simulate('change', {
        target: { value: mockCronExpression },
      });

      const createButton = wrapper
        .find('button.cogs-btn')
        .filterWhere((b: ReactWrapper) => b.text() === 'Create');
      expect(createButton.prop('disabled')).toBe(false);

      wrapper.unmount();
    });
  });
  describe('valid inputs', () => {
    describe('name', () => {
      const { isValidScheduleName } = stuffForUnitTests;
      it('invalid if empty input', () => {
        const invalidName = '';
        expect(isValidScheduleName(invalidName)).toBeFalsy();
      });
      it('invalid if >140 characters', () => {
        const invalidName =
          'a-really-really-really-really-really-really-really-really' +
          'really-really-really-really-really-really-really-really' +
          '-really-really-really-really-long-schedule-name';
        expect(isValidScheduleName(invalidName)).toBeFalsy();
      });
      it('valid example', () => {
        const validName = 'name';
        expect(isValidScheduleName(validName)).toBeTruthy();
      });
    });
    describe('cronExpression', () => {
      const { isValidCronExpression } = stuffForUnitTests;
      it('invalid if empty input', () => {
        const invalidCronExpression = '';
        expect(isValidCronExpression(invalidCronExpression)).toBeFalsy();
      });
      it('invalid if >1024 characters', () => {
        const invalidCronExpression =
          '* * * * * * * * * * * * * * * * * * * * * * * * * * * * * *' +
          '* * * * * * * * * * * * * * * * * * * * * * * * * * * * * *' +
          '* * * * * * * * * * * * * * * * * * * * * * * * * * * * * *' +
          '* * * * * * * * * * * * * * * * * * * * * * * * * * * * * *' +
          '* * * * * * * * * * * * * * * * * * * * * * * * * * * * * *' +
          '* * * * * * * * * * * * * * * * * * * * * * * * * * * * * *' +
          '* * * * * * * * * * * * * * * * * * * * * * * * * * * * * *' +
          '* * * * * * * * * * * * * * * * * * * * * * * * * * * * * *' +
          '* * * * * * * * * * * * * * * * * * * * * * * * * * * * * *' +
          '* * * * * * * * * * * * * * * * * * * * * * * * * * * * * *' +
          '* * * * * * * * * * * * * * * * * * * * * * * * * * * * * *' +
          '* * * * * * * * * * * * * * * * * * * * * * * * * * * * * *' +
          '* * * * * * * * * * * * * * * * * * * * * * * * * * * * * *' +
          '* * * * * * * * * * * * * * * * * * * * * * * * * * * * * *' +
          '* * * * * * * * * * * * * * * * * * * * * * * * * * * * * *' +
          '* * * * * * * * * * * * * * * * * * * * * * * * * * * * * *' +
          '* * * * * * * * * * * * * * * * * * * * * * * * * * * * * *' +
          '* * * * * * * * * * * * * * * * * * * * * * * * * * * * * *';
        expect(isValidCronExpression(invalidCronExpression)).toBeFalsy();
      });
      it('invalid if not a valid cron expression', () => {
        const invalidCronExpression1 = '0 0 12 ? * MON *';
        expect(isValidCronExpression(invalidCronExpression1)).toBeFalsy();
        const invalidCronExpression2 = '0 0 12 1/1 * ? *';
        expect(isValidCronExpression(invalidCronExpression2)).toBeFalsy();
        const invalidCronExpression3 = 'invalid cron expression';
        expect(isValidCronExpression(invalidCronExpression3)).toBeFalsy();
      });
      it('valid examples', () => {
        const validCronExpression1 = '* * * * *';
        expect(isValidCronExpression(validCronExpression1)).toBeTruthy();
        const validCronExpression2 = '*/10 * * * *';
        expect(isValidCronExpression(validCronExpression2)).toBeTruthy();
        const validCronExpression3 = '0 6 * * *';
        expect(isValidCronExpression(validCronExpression3)).toBeTruthy();
        const validCronExpression4 = '37 22 * * *';
        expect(isValidCronExpression(validCronExpression4)).toBeTruthy();
      });
    });
    describe('data', () => {
      const { isValidData } = stuffForUnitTests;
      it('invalid if not properly formatted JSON object', () => {
        const inValidDataArray = '[]';
        expect(isValidData(inValidDataArray)).toBeFalsy();
        const invalidDataNumber = '1';
        expect(isValidData(invalidDataNumber)).toBeFalsy();
        const inValidDataString = 'a';
        expect(isValidData(inValidDataString)).toBeFalsy();
        const inValidDataBadObject = '{a}';
        expect(isValidData(inValidDataBadObject)).toBeFalsy();
      });
      it('valid if empty input', () => {
        const validData = '';
        expect(isValidData(validData)).toBeTruthy();
      });
      it('valid examples', () => {
        const validDataEmpty = '{}';
        expect(isValidData(validDataEmpty)).toBeTruthy();
        const validData = '{"a": 1}';
        expect(isValidData(validData)).toBeTruthy();
      });
    });
    describe('description', () => {
      const { isValidDescription } = stuffForUnitTests;
      it('should error if >500 characters', () => {
        const invalidDesciription =
          'a-really-really-really-really-really-really-really-really' +
          'really-really-really-really-really-really-really-really' +
          'really-really-really-really-really-really-really-really' +
          'really-really-really-really-really-really-really-really' +
          'really-really-really-really-really-really-really-really' +
          'really-really-really-really-really-really-really-really' +
          'really-really-really-really-really-really-really-really' +
          'really-really-really-really-really-really-really-really' +
          'really-really-really-really-really-really-really-really' +
          '-really-really-really-really-long-schedule-description';
        expect(isValidDescription(invalidDesciription)).toBeFalsy();
      });
      it('valid if empty', () => {
        const validDescription = '';
        expect(isValidDescription(validDescription)).toBeTruthy();
      });
      it('valid example', () => {
        const validDescription = 'description';
        expect(isValidDescription(validDescription)).toBeTruthy();
      });
    });
  });
});
