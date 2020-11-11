import React from 'react';
import { screen } from '@testing-library/react';
import { render } from 'utils/test';
import ExtractorDownloadsTab from './ExtractorDownloadsTab';

describe('ExtractorDownloadsTab', () => {
  test('Render page and link', () => {
    render(<ExtractorDownloadsTab />);
    const downloadLink = screen.getByText(/extractors download/i);
    expect(downloadLink).toBeInTheDocument();
  });
});
