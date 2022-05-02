import { testRenderer } from '__test-utils/renderer';

import { WhiteLoaderInline } from '../WhiteLoaderInline';

describe('WhiteLoaderInline', () => {
  const defaultTestInit = async () => ({
    ...testRenderer(WhiteLoaderInline, undefined),
  });

  it('should render loader as expected', async () => {
    const { container } = await defaultTestInit();
    expect(container.querySelector('.cogs-loader')).toBeInTheDocument();
  });
});
