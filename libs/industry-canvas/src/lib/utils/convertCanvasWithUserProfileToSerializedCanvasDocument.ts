import { CanvasDocumentWithUserProfile } from '../hooks/useCanvasesWithUserProfiles';
import { SerializedCanvasDocument } from '../types';

const convertCanvasWithUserProfileToSerializedCanvasDocument = (
  canvasWithUserProfile: CanvasDocumentWithUserProfile
): SerializedCanvasDocument => ({
  externalId: canvasWithUserProfile.externalId,
  name: canvasWithUserProfile.name,
  isArchived: canvasWithUserProfile.isArchived,
  createdTime: canvasWithUserProfile.createdTime,
  createdBy: canvasWithUserProfile.createdBy,
  updatedAt: canvasWithUserProfile.updatedAt,
  updatedBy: canvasWithUserProfile.updatedBy,
  data: canvasWithUserProfile.data,
});

export default convertCanvasWithUserProfileToSerializedCanvasDocument;
