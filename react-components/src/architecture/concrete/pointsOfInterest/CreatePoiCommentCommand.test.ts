import { beforeAll, describe, expect, test, vi } from 'vitest';
import { CreatePoiCommentCommand } from './CreatePoiCommentCommand';
import { getTranslationKeyOrString } from '#test-utils/architecture/getTranslationKeyOrString';

import { type PointOfInterest, PointsOfInterestStatus } from './types';
import { PointsOfInterestDomainObject } from './PointsOfInterestDomainObject';
import { Mock } from 'moq.ts';
import { type RevealRenderTarget } from '../../base/renderTarget/RevealRenderTarget';
import { type RootDomainObject } from '../../base/domainObjects/RootDomainObject';
import { type CommandsController } from '../../base/renderTarget/CommandsController';

const TEST_POINT_OF_INTEREST: PointOfInterest<string> = {
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
} as const;
import { waitFor } from '@testing-library/react';

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
    expect(getTranslationKeyOrString(command.getCancelButtonLabel())).toBe('CANCEL');
    expect(getTranslationKeyOrString(command.getPostButtonLabel())).toBe('SEND');
    expect(getTranslationKeyOrString(command.getPlaceholder())).toBe('COMMENT_PLACEHOLDER');
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
    const mockPostComment = vi.fn().mockReturnValue(Promise.resolve());

    const mockDomainObject = new Mock<PointsOfInterestDomainObject<string>>()
      .setup((p) => p.postCommentForPoi)
      .returns(mockPostComment)
      .setup((p) => p.notify)
      .returns(vi.fn())
      .object();

    const mockRenderTarget = new Mock<RevealRenderTarget>()
      .setup((p) => p.rootDomainObject)
      .returns(
        new Mock<RootDomainObject>()
          .setup((p) => p.getDescendantByType(PointsOfInterestDomainObject))
          .returns(mockDomainObject)
          .object()
      )
      .setup((p) => p.commandsController)
      .returns(
        new Mock<CommandsController>()
          .setup((p) => p.update)
          .returns(vi.fn())
          .object()
      )
      .object();

    const commentContent = 'comment-content';

    const command = new CreatePoiCommentCommand(TEST_POINT_OF_INTEREST);

    command.attach(mockRenderTarget);

    command.onFinish = mockOnFinish;
    command.content = commentContent;
    command.invoke();

    expect(mockPostComment).toHaveBeenCalledWith(TEST_POINT_OF_INTEREST, commentContent);

    await waitFor(() => expect(mockOnFinish).toHaveBeenCalled());
  });
});
