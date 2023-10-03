import { useState } from 'react';

import render from '@platypus-app/tests/render';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';
import noop from 'lodash/noop';

import {
  DataModelDetailModal,
  DataModelDetailModalProps,
} from './DataModelDetailModal';

jest.mock('@platypus-app/flags/isFDMv3');

jest.mock('../DataModelLibrary/DataModelLibrary', () => {
  return {
    DataModelLibrary: () => <p>Mock</p>,
  };
});

jest.mock('@platypus-app/hooks/useDataModelActions');

const Container = (
  props: Omit<DataModelDetailModalProps, 'name' | 'onNameChange'>
) => {
  const [name, setName] = useState('');

  return <DataModelDetailModal {...props} name={name} onNameChange={setName} />;
};

describe('DataModelDetailModal', () => {
  it('validates invalid name when using DMS V3', () => {
    render(
      <Container
        description=""
        externalId=""
        okButtonName="Create"
        onCancel={noop}
        onDescriptionChange={noop}
        onSubmit={noop}
        title=""
        visible
      />
    );

    const longName = new Array(256).fill('x').join('');
    userEvent.type(screen.getByLabelText(/name/i), longName);

    expect(screen.getByText(/name is not valid/i)).toBeTruthy();
  });

  it("disables submit button if there's a space but no name", () => {
    const onSubmit = jest.fn();

    render(
      <DataModelDetailModal
        description=""
        externalId=""
        name=""
        okButtonName="Create"
        onCancel={noop}
        onDescriptionChange={noop}
        onNameChange={noop}
        onSubmit={onSubmit}
        space="my_space"
        title=""
        visible
      />
    );

    userEvent.click(
      screen.getByRole('button', {
        hidden: true,
        name: 'Create',
      })
    );

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("disables submit button if there's a name but no space", () => {
    const onSubmit = jest.fn();

    render(
      <DataModelDetailModal
        description=""
        externalId=""
        name="My Data Model"
        okButtonName="Create"
        onCancel={noop}
        onDescriptionChange={noop}
        onNameChange={noop}
        onSubmit={onSubmit}
        space=""
        title=""
        visible
      />
    );

    userEvent.click(
      screen.getByRole('button', {
        hidden: true,
        name: 'Create',
      })
    );

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('disables submit button while loading', () => {
    const onSubmit = jest.fn();

    render(
      <DataModelDetailModal
        description=""
        externalId=""
        isLoading
        name="My Data Model"
        okButtonName="Create"
        onCancel={noop}
        onDescriptionChange={noop}
        onNameChange={noop}
        onSubmit={onSubmit}
        space=""
        title=""
        visible
      />
    );

    userEvent.click(
      screen.getByRole('button', {
        hidden: true,
        name: 'Create',
      })
    );

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("enables submit button if there's a name and a space", () => {
    const onSubmit = jest.fn();

    render(
      <DataModelDetailModal
        description=""
        externalId=""
        name="My Data Model"
        okButtonName="Create"
        onCancel={noop}
        onDescriptionChange={noop}
        onNameChange={noop}
        onSubmit={onSubmit}
        space="my_space"
        title=""
        visible
      />
    );

    userEvent.click(
      screen.getByRole('button', {
        hidden: true,
        name: 'Create',
      })
    );

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("submits on enter press if there's a name and a space", () => {
    const onSubmit = jest.fn();

    render(
      <DataModelDetailModal
        description=""
        externalId=""
        name="My Data Model"
        okButtonName="Create"
        onCancel={noop}
        onDescriptionChange={noop}
        onNameChange={noop}
        onSubmit={onSubmit}
        space="my_space"
        title=""
        visible
      />
    );

    userEvent.type(screen.getByLabelText(/name/i), '{enter}');

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
