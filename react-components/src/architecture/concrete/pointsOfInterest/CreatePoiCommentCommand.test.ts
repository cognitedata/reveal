import { beforeAll, describe, expect, test, vi } from 'vitest';
import { CreatePoiCommentCommand } from './CreatePoiCommentCommand';

import { type PointOfInterest, PointsOfInterestStatus } from './types';
import { PointsOfInterestDomainObject } from './PointsOfInterestDomainObject';
import { waitFor } from '@testing-library/react';
import { createRenderTargetMock } from '#test-utils/fixtures/renderTarget';
import { type PointsOfInterestProvider } from './PointsOfInterestProvider';
import { translate } from '../../base/utilities/translateUtils';

const TEST_POINT_OF_INTEREST = createTestPointOfInterest();

describe(CreatePoiCommentCommand.name, () => {
  beforeAll(() => {
    vi.clearAllMocks();
  });

  test('should indicate that it has data', () => {
    const command = new CreatePoiCommentCommand(TEST_POINT_OF_INTEREST);
    expect(command.hasData).toBeTruthy();
  });

  test('has correct initial content', () => {
    const command = new CreatePoiCommentCommand(TEST_POINT_OF_INTEREST);

    expect(command.onCancel).toBeUndefined();
    expect(command.onFinish).toBeUndefined();
    expect(translate(command.getCancelButtonLabel())).toBe('Cancel');
    expect(translate(command.getPostButtonLabel())).toBe('Send');
    expect(translate(command.getPlaceholder())).toBe('Write a comment');
  });

  test('post button is disabled when content is empty', () => {
    const poiCommentCommand = new CreatePoiCommentCommand(TEST_POINT_OF_INTEREST);

    expect(poiCommentCommand.content).toBe('');
    expect(poiCommentCommand.isPostButtonEnabled).toBeFalsy();

    poiCommentCommand.content = 'non-empty-content';

    expect(poiCommentCommand.isPostButtonEnabled).toBeTruthy();
  });

  test('invoking command posts comment on Poi and calls onFinish', async () => {
    const mockOnFinish = vi.fn();

    const renderTarget = createRenderTargetMock();

    const mockPointOfInterestProvider = createPointsOfInterestProviderMock();

    const domainObject = new PointsOfInterestDomainObject(mockPointOfInterestProvider);
    renderTarget.rootDomainObject.addChild(domainObject);

    const command = new CreatePoiCommentCommand(TEST_POINT_OF_INTEREST);
    command.attach(renderTarget);

    const commentContent = 'comment-content';

    command.onFinish = mockOnFinish;
    command.content = commentContent;
    command.invoke();

    expect(vi.mocked(mockPointOfInterestProvider.postPointsOfInterestComment)).toHaveBeenCalledWith(
      TEST_POINT_OF_INTEREST.id,
      commentContent
    );

    await waitFor(() => {
      expect(mockOnFinish).toHaveBeenCalled();
    });
  });
});

function createPointsOfInterestProviderMock(): PointsOfInterestProvider<string> {
  const mockPostComment = vi.fn(
    async () => await Promise.resolve({ ownerId: 'a-user', content: 'a-comment' })
  );
  return {
    upsertPointsOfInterest: vi.fn(),
    fetchPointsOfInterest: vi.fn(),
    getPointsOfInterestComments: vi.fn(),
    postPointsOfInterestComment: mockPostComment,
    deletePointsOfInterest: vi.fn(),
    createNewId: vi.fn()
  };
}

function createTestPointOfInterest(): PointOfInterest<string> {
  return {
    properties: {
      name: 'poi_name',
      positionX: 1,
      positionY: 2,
      positionZ: 3,
      scene: {
        externalId: 'scene_external_id',
        space: 'scene_space'
      },
      sceneState: {}
    },
    id: 'poi_id',
    status: PointsOfInterestStatus.Default
  };
}
