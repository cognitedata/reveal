import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import { mount, shallow, ReactWrapper } from 'enzyme';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { Upload, Form } from 'antd';
import { UploadFile } from 'antd/lib/upload/interface';
import UploadFunctionModal, { stuffForUnitTests } from './UploadFunctionModal';

const middlewares = [thunk]; // add your middlewares like `redux-thunk`
const mockStore = configureStore(middlewares);
const mockFile = {
  uid: '123',
  size: 1,
  name: 'mockfile',
  type: '.zip',
} as UploadFile;

const initialStoreState = {
  functions: {
    create: {
      fileInfo: {},
    },
  },
};
let initialStore = mockStore(initialStoreState);

describe('UploadFunctionModal', () => {
  beforeEach(() => {
    initialStore = mockStore(initialStoreState);
  });
  describe('component', () => {
    it('renders without crashing', () => {
      expect(() => {
        const div = document.createElement('div');
        ReactDOM.render(
          <Provider store={initialStore}>
            <MemoryRouter>
              <UploadFunctionModal visible onCancel={jest.fn()} />
            </MemoryRouter>
          </Provider>,
          div
        );
        ReactDOM.unmountComponentAtNode(div);
      }).not.toThrow();
    });
    it('should be visible based on input', () => {
      const wrapperWithVisibleModal = shallow(
        <Provider store={initialStore}>
          <MemoryRouter>
            <UploadFunctionModal visible onCancel={jest.fn()} />
          </MemoryRouter>
        </Provider>
      );
      const uploadFunctionModal = wrapperWithVisibleModal.find(
        UploadFunctionModal
      );
      expect(uploadFunctionModal.prop('visible')).toBe(true);
    });
    it('should be invisible based on input', () => {
      const wrapperWithoutVisibleModal = shallow(
        <Provider store={initialStore}>
          <MemoryRouter>
            <UploadFunctionModal visible={false} onCancel={jest.fn()} />
          </MemoryRouter>
        </Provider>
      );
      const uploadFunctionModal = wrapperWithoutVisibleModal.find(
        UploadFunctionModal
      );
      expect(uploadFunctionModal.prop('visible')).toBe(false);
    });
    it('should call onCancel when button is clicked', () => {
      const cancelFunc = jest.fn();
      const wrapper = mount(
        <Provider store={initialStore}>
          <MemoryRouter>
            <UploadFunctionModal visible onCancel={cancelFunc} />
          </MemoryRouter>
        </Provider>
      );

      const b = wrapper.find('button.ant-modal-close');
      b.simulate('click');
      expect(cancelFunc).toBeCalledTimes(1);

      // should also dispatch createfunctionreset
      expect(initialStore.getActions()).toHaveLength(1);
      expect(initialStore.getActions()[0]).toEqual({
        type: 'functions/CREATE_RESET',
      });
      wrapper.unmount();
    });
    it('should have input areas for all the necessary information', () => {
      // should have function name, description, apikey, owneremail, file, externalId, secrets
      const wrapper = mount(
        <Provider store={initialStore}>
          <MemoryRouter>
            <UploadFunctionModal visible onCancel={jest.fn()} />
          </MemoryRouter>
        </Provider>
      );
      const allFormItems = wrapper.find(Form.Item);
      expect(allFormItems).toHaveLength(7);
      const allFormItemsLabels = allFormItems.map(i => i.text());
      expect(allFormItemsLabels).toContain('Function name');
      expect(allFormItemsLabels).toContain('Description');
      expect(allFormItemsLabels).toContain('API Key');
      expect(allFormItemsLabels).toContain('Owner');
      expect(wrapper.find(Upload).exists()).toBe(true);
      expect(allFormItemsLabels).toContain('External Id');
      expect(allFormItemsLabels[6]).toContain('Secrets');
      expect(allFormItemsLabels[0]).toContain('Function File');
      wrapper.unmount();
    });
    it('should only allow zip files to be uploaded', () => {
      const wrapper = mount(
        <Provider store={initialStore}>
          <MemoryRouter>
            <UploadFunctionModal visible onCancel={jest.fn()} />
          </MemoryRouter>
        </Provider>
      );
      expect(wrapper.find(Upload).prop('accept')).toBe('.zip');
      wrapper.unmount();
    });
    it('should have disabled submit button by default', () => {
      const wrapper = mount(
        <Provider store={initialStore}>
          <MemoryRouter>
            <UploadFunctionModal visible onCancel={jest.fn()} />
          </MemoryRouter>
        </Provider>
      );
      const uploadButton = wrapper
        .find('button.cogs-btn')
        .filterWhere((b: ReactWrapper) => b.text() === 'Upload');
      expect(uploadButton.prop('disabled')).toBe(true);
      wrapper.unmount();
    });
    it('should allow function upload if all criteria is met', () => {
      // criteria: lowercase function name with 1+ characters & a zip file & all other fields are within their character bounds
      const createFuncStoreState = {
        functions: {
          create: {
            fileInfo: {
              file: mockFile,
            },
            name: 'mocknewfunc',
          },
        },
      };
      const createFuncStore = mockStore(createFuncStoreState);

      const wrapper = mount(
        <Provider store={createFuncStore}>
          <MemoryRouter>
            <UploadFunctionModal visible onCancel={jest.fn()} />
          </MemoryRouter>
        </Provider>
      );
      const nameInput = wrapper.find('input[name="functionName"]');
      nameInput.simulate('change', { target: { value: 'mocknewfunc' } });

      const uploadButton = wrapper
        .find('button.cogs-btn')
        .filterWhere((b: ReactWrapper) => b.text() === 'Upload');
      expect(uploadButton.prop('disabled')).toBe(false);

      wrapper.unmount();
    });
    it('should dispatch createFunction if submit button is clicked', () => {
      const mockFunctionName = 'mocknewfunc';
      const createFunctionStoreState = {
        functions: {
          create: {
            fileInfo: {
              file: mockFile,
              fileId: 200,
            },
            name: mockFunctionName,
          },
        },
      };
      const createFunctionStore = mockStore(createFunctionStoreState);

      const wrapper = mount(
        <Provider store={createFunctionStore}>
          <MemoryRouter>
            <UploadFunctionModal visible onCancel={jest.fn()} />
          </MemoryRouter>
        </Provider>
      );

      const nameInput = wrapper.find('input[name="functionName"]');
      nameInput.simulate('change', { target: { value: 'mocknewfunc' } });

      const uploadButton = wrapper
        .find('button.cogs-btn')
        .filterWhere((b: ReactWrapper) => b.text() === 'Upload');
      uploadButton.simulate('click');

      // first 2 are related to uploadFile
      expect(createFunctionStore.getActions()).toHaveLength(3);
      expect(createFunctionStore.getActions()[2]).toEqual({
        type: 'functions/CREATE',
        apiKey: '',
        description: '',
        functionName: mockFunctionName,
        owner: '',
        externalId: '',
        secrets: {},
      });
      wrapper.unmount();
    });
    it('should add a key input field and value input field when Add Secret is clicked', () => {
      const wrapper = mount(
        <Provider store={initialStore}>
          <MemoryRouter>
            <UploadFunctionModal visible onCancel={jest.fn()} />
          </MemoryRouter>
        </Provider>
      );

      const addSecretButton = wrapper
        .find('button.cogs-btn')
        .filterWhere((b: ReactWrapper) => b.text() === 'Add a secret');
      addSecretButton.simulate('click');

      const keyInput = wrapper.find('input[name="key"]');
      expect(keyInput).toHaveLength(1);
      const valueInput = wrapper.find('input[name="value"]');
      expect(valueInput).toHaveLength(1);
      wrapper.unmount();
    });
    it('should remove a key input field and value input field when remove button is clicked', () => {
      const wrapper = mount(
        <Provider store={initialStore}>
          <MemoryRouter>
            <UploadFunctionModal visible onCancel={jest.fn()} />
          </MemoryRouter>
        </Provider>
      );

      const addSecretButton = wrapper
        .find('button.cogs-btn')
        .filterWhere((b: ReactWrapper) => b.text() === 'Add a secret');
      addSecretButton.simulate('click');

      const keyInput = wrapper.find('input[name="key"]');
      expect(keyInput).toHaveLength(1);
      const valueInput = wrapper.find('input[name="value"]');
      expect(valueInput).toHaveLength(1);

      const removeSecretButton = wrapper.find('button.cogs-btn').at(2);
      removeSecretButton.simulate('click');

      const removedKeyInput = wrapper.find('input[name="key"]');
      expect(removedKeyInput).toHaveLength(0);
      const removedValueInput = wrapper.find('input[name="value"]');
      expect(removedValueInput).toHaveLength(0);
    });
  });
  describe('input field validity', () => {
    describe('function name', () => {
      const { checkFunctionName } = stuffForUnitTests;
      it('error if empty', () => {
        const invalidName = '';
        expect(checkFunctionName(invalidName).error).toBeTruthy();
      });
      it('error if > 140 char', () => {
        const invalidName =
          'a-really-really-really-really-really-really-really-really-really-really' +
          '-really-really-really-really-really-really-really-really-long-function-name';
        expect(checkFunctionName(invalidName).error).toBeTruthy();
      });
      it('valid example', () => {
        const validName = 'name';
        expect(checkFunctionName(validName).error).toBeFalsy();
      });
    });
    describe('file upload', () => {
      const { checkFile } = stuffForUnitTests;
      it('error if empty', () => {
        expect(checkFile().error).toBeTruthy();
      });
      it('error if undefined', () => {
        const invalidFile = undefined;
        expect(checkFile(invalidFile).error).toBeTruthy();
      });
      it('valid example', () => {
        expect(checkFile(mockFile).error).toBeFalsy();
      });
    });
    describe('description', () => {
      const { checkDescription } = stuffForUnitTests;
      it('error if > 128 char', () => {
        const invalidDescription =
          '-really-really-really-really-really-really-really-really-really-really' +
          '-really-really-really-really-really-really-really-really-long-function-description';
        expect(checkDescription(invalidDescription).error).toBeTruthy();
      });
      it('valid if empty', () => {
        const validDescription = '';
        expect(checkDescription(validDescription).error).toBeFalsy();
      });
      it('valid example', () => {
        const validDescription = 'description';
        expect(checkDescription(validDescription).error).toBeFalsy();
      });
    });
    describe('apiKey', () => {
      const { checkApiKey } = stuffForUnitTests;
      it('error if > 50 char', () => {
        const invalidApiKey =
          '-really-really-really-really-really-really-really-really-long-function-apiKey';
        expect(checkApiKey(invalidApiKey).error).toBeTruthy();
      });
      it('valid if empty', () => {
        const validApiKey = '';
        expect(checkApiKey(validApiKey).error).toBeFalsy();
      });
      it('valid example', () => {
        const validApiKey = 'apiKey';
        expect(checkApiKey(validApiKey).error).toBeFalsy();
      });
    });
    describe('owner', () => {
      const { checkOwner } = stuffForUnitTests;
      it('error if > 128 char', () => {
        const invalidOwner =
          '-really-really-really-really-really-really-really-really-really-really' +
          '-really-really-really-really-really-really-really-really-long-function-owner';
        expect(checkOwner(invalidOwner).error).toBeTruthy();
      });
      it('valid if empty', () => {
        const validOwner = '';
        expect(checkOwner(validOwner).error).toBeFalsy();
      });
      it('valid example', () => {
        const validOwner = 'owner';
        expect(checkOwner(validOwner).error).toBeFalsy();
      });
    });
    describe('externalId', () => {
      const { checkExternalId } = stuffForUnitTests;
      it('error if > 255 char', () => {
        const invaliExternalId =
          'a-really-really-really-really-really-really-really-really-really-really' +
          '-really-really-really-really-really-really-really-really-really-really' +
          '-really-really-really-really-really-really-really-really-really-really' +
          '-really-really-really-really-really-really-really-really-long-function-externalid';
        expect(checkExternalId(invaliExternalId).error).toBeTruthy();
      });
      it('valid if empty', () => {
        const validExternalId = '';
        expect(checkExternalId(validExternalId).error).toBeFalsy();
      });
      it('valid example', () => {
        const validExternalId = 'externalId';
        expect(checkExternalId(validExternalId).error).toBeFalsy();
      });
    });
    describe('secret key', () => {
      const { checkSecretKey } = stuffForUnitTests;
      const mockApiKey = 'apiKey';
      it('error if empty', () => {
        const invalidKey = '';
        const secretKeys = [invalidKey];
        expect(
          checkSecretKey(invalidKey, mockApiKey, secretKeys).error
        ).toBeTruthy();
      });
      it('error if > 15 char', () => {
        const invalidKey = 'a-long-secret-key';
        const secretKeys = [invalidKey];
        expect(
          checkSecretKey(invalidKey, mockApiKey, secretKeys).error
        ).toBeTruthy();
      });
      it('error if contains weird characters', () => {
        const invalidUpperCaseKey = 'KEY';
        const secretKeys = [invalidUpperCaseKey];
        expect(
          checkSecretKey(invalidUpperCaseKey, mockApiKey, secretKeys).error
        ).toBeTruthy();
      });
      it('error if equal to api key', () => {
        const invalidKey = mockApiKey;
        const secretKeys = [invalidKey];
        expect(
          checkSecretKey(invalidKey, mockApiKey, secretKeys).error
        ).toBeTruthy();
      });
      it('error if not unique', () => {
        const invalidKey = 'key';
        const mockSecretKeys = ['key', 'key'];
        expect(
          checkSecretKey(invalidKey, mockApiKey, mockSecretKeys).error
        ).toBeTruthy();
      });
      it('valid example', () => {
        const validKey = 'key-123';
        const secretKeys = [validKey];
        expect(
          checkSecretKey(validKey, mockApiKey, secretKeys).error
        ).toBeFalsy();
      });
    });
    describe('secret value', () => {
      const { checkSecretValue } = stuffForUnitTests;
      it('error if empty', () => {
        const invalidValue = '';
        expect(checkSecretValue(invalidValue).error).toBeTruthy();
      });
      it('valid example', () => {
        const validValue = 'value';
        expect(checkSecretValue(validValue).error).toBeFalsy();
      });
    });
    describe('all secrets', () => {
      const { checkSecrets } = stuffForUnitTests;
      const apiKey = '';
      it('error if length greater than 5', () => {
        const secret = {
          key: '',
          value: '',
          keyTouched: false,
          valueTouched: false,
        };
        const secrets = [secret, secret, secret, secret, secret, secret];
        expect(checkSecrets(secrets, apiKey)).toBeFalsy();
      });
      it('error if invalid key', () => {
        const secret = {
          key: '',
          value: '',
          keyTouched: false,
          valueTouched: false,
        };
        const secrets = [secret];
        expect(checkSecrets(secrets, apiKey)).toBeFalsy();
      });
      it('error if invalid value', () => {
        const secret = {
          key: 'key',
          value: '',
          keyTouched: true,
          valueTouched: false,
        };
        const secrets = [secret];
        expect(checkSecrets(secrets, apiKey)).toBeFalsy();
      });
      it('valid example', () => {
        const secret = {
          key: 'key',
          value: 'value',
          keyTouched: true,
          valueTouched: true,
        };
        const secrets = [secret];
        expect(checkSecrets(secrets, apiKey)).toBeTruthy();
      });
    });
  });
});
