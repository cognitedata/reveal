import { screen } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import { Illustration } from '../Illustration';

const IllustrationComponent = () => {
  return <Illustration data-test-id="illustration" type="Favorites" />;
};

describe('Illustration Tests', () => {
  const testInit = async () => testRenderer(IllustrationComponent);
  it('should render image', async () => {
    await testInit();
    const element = screen.getByAltText('Illustration of favorites');
    expect(element).toBeInTheDocument();

    // vite does not import the files in testing correctly
    // disabling this till it can handle svgs
    // expect(element).toHaveAttribute('src', 'favorites.svg');
  });
});
