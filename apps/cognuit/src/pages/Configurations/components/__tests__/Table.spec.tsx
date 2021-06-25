import { screen } from '@testing-library/react';
import { Rule } from 'typings/interfaces';
import { render } from 'utils/test';
import { extendedConfigurations } from '__fixtures__/fixtureConfigurations';

import { columnRules } from '../Table/columnRules';
import { ExpandedSubRow } from '../Table/ExpandedSubRow';

function findRenderComponent(columns: Rule[], key: string): any {
  return columns.find((item) => item.key === key)!;
}

describe('Configurations/Table', () => {
  describe('ColumnRules', () => {
    const columns = columnRules({
      handleNameChange: jest.fn(),
      handleRestart: jest.fn(),
      handleStopStart: jest.fn(),
    });

    const [config] = extendedConfigurations;

    test('Render function for "business_tags"', () => {
      const { render: RenderComponent } = findRenderComponent(
        columns,
        'business_tags'
      );

      const { container } = render(
        RenderComponent({ value: config.business_tags })
      );

      expect(container.childNodes.length).toBe(config.business_tags.length);
      expect(screen.getByText('Cognuit')).toBeInTheDocument();
      expect(screen.getByText('Integration')).toBeInTheDocument();
    });

    test('Render function for "datatypes"', () => {
      const { render: RenderComponent } = findRenderComponent(
        columns,
        'datatypes'
      );

      const { container } = render(
        RenderComponent({ value: config.datatypes })
      );

      expect(container.childNodes.length).toBe(config.datatypes.length);
      expect(screen.getByText('PointSet')).toBeInTheDocument();
      expect(screen.getByText('Target')).toBeInTheDocument();
    });

    // Test failing due to different server time...
    // test-('Render function for "created_time"', () => {
    //   const { render: RenderComponent } = findRenderComponent(
    //     columns,
    //     'created_time'
    //   );

    //   expect(RenderComponent({ value: config.created_time })).toBe(
    //     '4/4/2021, 10:36:56 AM'
    //   );
    // });

    // Test failing due to different server time...
    // test-('Render function for "last_updated"', () => {
    //   const { render: RenderComponent } = findRenderComponent(
    //     columns,
    //     'last_updated'
    //   );

    //   expect(RenderComponent({ value: config.last_updated })).toBe(
    //     '4/4/2021, 7:35:32 PM'
    //   );
    // });

    test('Render function for "author"', () => {
      const { render: RenderComponent } = findRenderComponent(
        columns,
        'author'
      );

      render(RenderComponent({ value: config.author }));
      expect(screen.getByText('Cognuit')).toBeInTheDocument();

      render(RenderComponent({ value: `${config.author}thisisalongstring` }));
      expect(screen.getByText('Cognuitthisisalongst...')).toBeInTheDocument();
    });

    it.todo('Render function for "Progress"');
    it.todo('Render function for "statusClor"');
    // Conf_name is already tested for in the component itself
    it.todo('Render function for "actions"');
  });

  describe('ExpandedSubRow', () => {
    it('renders the sub row for configurations correctly', () => {
      const [original] = extendedConfigurations;

      render(<ExpandedSubRow original={original} />);

      expect(screen.getByText('Created:')).toBeInTheDocument();
      expect(screen.getByText('Last updated:')).toBeInTheDocument();
      expect(screen.getByText('Data types:')).toBeInTheDocument();
      expect(screen.getByText('Business tags:')).toBeInTheDocument();

      const { progress } = original;
      expect(
        screen.getByText(`PointSet (${progress.PointSet.total})`)
      ).toBeInTheDocument();

      const [businessTag] = original.business_tags;
      expect(screen.getByText(businessTag)).toBeInTheDocument();
    });
  });
});
