import { targetAppPackageName } from '../config';
import { getUrl } from '../utils/getUrl';

const vulcanControlRoomData = {
  revisionId: '5660817896986846',
  modelId: '6327093295068208',
  modelName: 'Vulkan Control Room',
};

const cellarDeckData = {
  revisionId: '3740959778708010',
  modelId: '7568289132281945',
  modelName: 'Ivar Aasen Cellar Deck',
};

describe('3d-management', () => {
  it('should open point cloud and CAD model', () => {
    goTo3dManagementRoot();
    validateModelRevision(vulcanControlRoomData);

    goTo3dManagementRoot();
    validateModelRevision(cellarDeckData);
    cy.get('div[id="tree-view-container"]').should('exist');

    function validateModelRevision(modelRevision: {
      revisionId: string;
      modelId: string;
      modelName: string;
    }) {
      const { revisionId, modelId, modelName } = modelRevision;
      const pattern = `/3d-management-e2e/3d-models/${modelId}/revisions/${revisionId}`;
      const urlRegex = new RegExp(pattern);

      cy.get(`td:contains("${modelName}")`).should('exist').click();
      cy.get(`[data-row-key="${revisionId}"]`).should('exist').click();
      cy.url().should('match', urlRegex);
      cy.get(`h5:contains("3D models / ${modelName}")`).should('exist');
      cy.get(`div:contains("${modelId}")`).should('exist');
      cy.get(`div:contains("${revisionId}")`).should('exist');
      cy.get('[aria-label="Open 3d-viewer"]').click();
      cy.get('canvas').should('exist');
    }

    function goTo3dManagementRoot() {
      cy.visit(getUrl());
      cy.ensureSpaAppIsLoaded(targetAppPackageName);
      cy.ensurePageFinishedLoading();
    }
  });
});
