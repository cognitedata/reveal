import React from 'react';

import { render, screen } from '@testing-library/react';

import {
  FileLink,
  FILE_NOT_FOUND_ERROR,
  RESTRICTED_FILE_ERROR,
} from './FileLink';

const VALID_FILE_ID = 123;
const INVALID_FILE_ID = 456;
const RESTRICTED_FILE_ID = 789;

const mockedUsedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...(jest.requireActual('react-router-dom') as any),
  useNavigate: () => mockedUsedNavigate,
}));

jest.mock('../../../hooks/files/useFiles', () => ({
  useFiles: (fileIds: number[]) => {
    switch (fileIds[0]) {
      case INVALID_FILE_ID:
        return {
          error: { status: 400 },
        };
      case RESTRICTED_FILE_ID:
        return {
          error: { status: 403 },
        };
      case VALID_FILE_ID:
      default:
        return {
          data: [
            {
              id: 1,
              uploaded: true,
              name: 'one',
            },
          ],
        };
    }
  },
}));

describe('Test FileLink Componenet', () => {
  test('file exist', () => {
    render(<FileLink fileId={VALID_FILE_ID} />);
    expect(screen.getByText('one')).toBeInTheDocument();
  });

  test('file not exist', () => {
    render(<FileLink fileId={INVALID_FILE_ID} />);
    expect(screen.getByText(FILE_NOT_FOUND_ERROR)).toBeInTheDocument();
  });

  test('restricted file', () => {
    render(<FileLink fileId={RESTRICTED_FILE_ID} />);
    expect(screen.getByText(RESTRICTED_FILE_ERROR)).toBeInTheDocument();
  });
});
