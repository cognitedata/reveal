import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import { CogFunction, Call, Error } from 'types/Types';
import { mount } from 'enzyme';
import sdk from 'sdk-singleton';
import { Button } from '@cognite/cogs.js';
import TestWrapper from 'utils/TestWrapper';
import CallFunctionModal, { stuffForUnitTests } from './CallFunctionModal';
import { sleep } from 'helpers';

const mockFunction = {
  fileId: 1,
  name: 'testFunc',
  id: 2,
} as CogFunction;
const mockSimpleResult = {
  id: 1,
  startTime: new Date(),
  endTime: new Date(),
  status: 'Completed',
} as Call;

const wrap = (node: React.ReactNode) =>
  mount(<TestWrapper>{node}</TestWrapper>);

describe('CallFunctionModal', () => {
    sdk.get.mockReset();
  sdk.get.mockResolvedValue({});

  describe('component', () => {
    it('renders without crashing', () => {
      expect(() => {
        const div = document.createElement('div');
        ReactDOM.render(<CallFunctionModal id={1}/>, div);
        ReactDOM.unmountComponentAtNode(div);
      }).not.toThrow();
    });


    it('displays a normal title', () => {
      const wrapper = wrap(<CallFunctionModal id={1}/>);
      const title = wrapper.find('.ant-modal-title');
      expect(title.text()).toBeTruthy();
      expect(title.text()).toContain('Call function');
    });


    it('should disable call buttons if input is not valid', () => {
      const wrapper = wrap(<CallFunctionModal id={1}/>);

      const input = wrapper.find('textarea.ant-input');
      input.simulate('change', { target: { value: '{1}' } });
      const callButton = wrapper.find(Button).at(1);
      expect(callButton.prop('disabled')).toBeTruthy();
    });

    it('should not disable call buttons if input is valid', () => {
      const wrapper = wrap(<CallFunctionModal id={1}/>);
      // empty input
      const callButton = wrapper.find(Button).at(1);
      expect(callButton.prop('disabled')).toBeFalsy();

      // real input
      const input = wrapper.find('textarea.ant-input');
      input.simulate('change', { target: { value: '{"key": "value"}' } });
      expect(callButton.prop('disabled')).toBeFalsy();
    });

  });
  describe('valid input', () => {
    describe('data', () => {
      const { canParseInputData } = stuffForUnitTests;
      it('invalid if not properly formatted JSON object', () => {
        const inValidDataArray = '[]';
        expect(canParseInputData(inValidDataArray)).toBeFalsy();
        const invalidDataNumber = '1';
        expect(canParseInputData(invalidDataNumber)).toBeFalsy();
        const inValidDataString = 'a';
        expect(canParseInputData(inValidDataString)).toBeFalsy();
        const inValidDataBadObject = '{a}';
        expect(canParseInputData(inValidDataBadObject)).toBeFalsy();
      });
      it('valid if empty input', () => {
        const validData = '';
        expect(canParseInputData(validData)).toBeTruthy();
      });
      it('valid examples', () => {
        const validDataEmpty = '{}';
        expect(canParseInputData(validDataEmpty)).toBeTruthy();
        const validData = '{"a": 1}';
        expect(canParseInputData(validData)).toBeTruthy();
      });
    });
  });
});
