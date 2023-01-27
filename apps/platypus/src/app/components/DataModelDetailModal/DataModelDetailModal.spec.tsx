import { screen } from '@testing-library/react';
import render from '@platypus-app/tests/render';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';
import noop from 'lodash/noop';
import { isFDMv3 } from '@platypus-app/flags/isFDMv3';

import {
  DataModelDetailModal,
  DataModelDetailModalProps,
} from './DataModelDetailModal';
import { useState } from 'react';

jest.mock('@platypus-app/flags/isFDMv3');

const mockedIsFDMv3 = jest.mocked(isFDMv3);

const Container = (
  props: Omit<DataModelDetailModalProps, 'name' | 'onNameChange'>
) => {
  const [name, setName] = useState('');

  return <DataModelDetailModal {...props} name={name} onNameChange={setName} />;
};

describe('DataModelDetailModal', () => {
  it('validates invalid name when using DMS V2', () => {
    mockedIsFDMv3.mockReturnValueOnce(false);

    render(
      <Container
        dataSets={[]}
        description=""
        externalId=""
        onCancel={noop}
        onDescriptionChange={noop}
        onSubmit={noop}
        title=""
      />
    );

    userEvent.type(screen.getByLabelText(/name/i), 'name with space');

    expect(screen.getByText(/name is not valid/i)).toBeTruthy();
  });

  it('validates valid name when using DMS V2', () => {
    mockedIsFDMv3.mockReturnValueOnce(false);

    render(
      <Container
        dataSets={[]}
        description=""
        externalId=""
        onCancel={noop}
        onDescriptionChange={noop}
        onSubmit={noop}
        title=""
      />
    );

    userEvent.type(screen.getByLabelText(/name/i), 'my_data_model');

    expect(screen.queryByText(/name is not valid/i)).toBeNull();
  });

  it('validates invalid name when using DMS V3', () => {
    mockedIsFDMv3.mockReturnValueOnce(true);

    render(
      <Container
        dataSets={[]}
        description=""
        externalId=""
        onCancel={noop}
        onDescriptionChange={noop}
        onSubmit={noop}
        title=""
      />
    );

    const longName = new Array(256).fill('x').join('');
    userEvent.type(screen.getByLabelText(/name/i), longName);

    expect(screen.getByText(/name is not valid/i)).toBeTruthy();
  });

  it('validates valid name when using DMS V3', () => {
    mockedIsFDMv3.mockReturnValueOnce(true);

    render(
      <Container
        dataSets={[]}
        description=""
        externalId=""
        onCancel={noop}
        onDescriptionChange={noop}
        onSubmit={noop}
        title=""
      />
    );

    userEvent.type(screen.getByLabelText(/name/i), 'My Data Model!');

    expect(screen.getByText(/name is not valid/i)).toBeTruthy();
  });

  it("disables submit button if there's a space but no name", () => {
    mockedIsFDMv3.mockReturnValueOnce(true);
    const onSubmit = jest.fn();

    render(
      <DataModelDetailModal
        dataSets={[]}
        description=""
        externalId=""
        name=""
        onCancel={noop}
        onDescriptionChange={noop}
        onNameChange={noop}
        onSubmit={onSubmit}
        space="my_space"
        title=""
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
    mockedIsFDMv3.mockReturnValueOnce(true);
    const onSubmit = jest.fn();

    render(
      <DataModelDetailModal
        dataSets={[]}
        description=""
        externalId=""
        name="My Data Model"
        onCancel={noop}
        onDescriptionChange={noop}
        onNameChange={noop}
        onSubmit={onSubmit}
        space=""
        title=""
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
    mockedIsFDMv3.mockReturnValueOnce(true);
    const onSubmit = jest.fn();

    render(
      <DataModelDetailModal
        dataSets={[]}
        description=""
        externalId=""
        name="My Data Model"
        onCancel={noop}
        onDescriptionChange={noop}
        onNameChange={noop}
        onSubmit={onSubmit}
        space="my_space"
        title=""
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
    mockedIsFDMv3.mockReturnValueOnce(true);
    const onSubmit = jest.fn();

    render(
      <DataModelDetailModal
        dataSets={[]}
        description=""
        externalId=""
        name="My Data Model"
        onCancel={noop}
        onDescriptionChange={noop}
        onNameChange={noop}
        onSubmit={onSubmit}
        space="my_space"
        title=""
      />
    );

    userEvent.type(screen.getByLabelText(/name/i), '{enter}');

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('does not submit form without a name when user presses enter', () => {
    mockedIsFDMv3.mockReturnValueOnce(true);
    const onSubmit = jest.fn();

    render(
      <DataModelDetailModal
        dataSets={[]}
        description=""
        externalId=""
        name=""
        onCancel={noop}
        onDescriptionChange={noop}
        onNameChange={noop}
        onSubmit={onSubmit}
        space="my_space"
        title=""
      />
    );

    userEvent.type(screen.getByLabelText(/name/i), '{enter}');

    expect(onSubmit).not.toHaveBeenCalled();
  });
});
