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

describe(CreatePoiCommentCommand.name, () => {
  beforeAll(() => {
    vi.clearAllMocks();
  });

  test('has correct initial content', () => {
    const poiCommentCommand = new CreatePoiCommentCommand(TEST_POINT_OF_INTEREST);

    expect(getTranslationKeyOrString(poiCommentCommand.getCancelButtonLabel())).toBe('CANCEL');
    expect(getTranslationKeyOrString(poiCommentCommand.getPostButtonLabel())).toBe('SEND');
    expect(getTranslationKeyOrString(poiCommentCommand.getPlaceholder())).toBe(
      'COMMENT_PLACEHOLDER'
    );
  });

  test('post button is disabled when content is empty', () => {
    const poiCommentCommand = new CreatePoiCommentCommand(TEST_POINT_OF_INTEREST);

    expect(poiCommentCommand.content).toBe('');
    expect(poiCommentCommand.isPostButtonEnabled).toBeFalsy();

    poiCommentCommand.content = 'non-empty-content';

    expect(poiCommentCommand.isPostButtonEnabled).toBeTruthy();
  });

  test('invoking command posts comment on Poi', () => {
    const mockPostComment = vi.fn().mockReturnValue(Promise.resolve());

    const mockPointsOfInterestDomainObject = new Mock<PointsOfInterestDomainObject<string>>()
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
          .returns(mockPointsOfInterestDomainObject)
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

    const poiCommentCommand = new CreatePoiCommentCommand(TEST_POINT_OF_INTEREST);

    poiCommentCommand.attach(mockRenderTarget);

    poiCommentCommand.content = commentContent;
    poiCommentCommand.invoke();

    expect(mockPostComment).toHaveBeenCalledWith(TEST_POINT_OF_INTEREST, commentContent);
  });
});
