import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Tooltip } from '@cognite/cogs.js';
import { Cognite3DViewer, Cognite3DModel } from '@cognite/reveal';
import { createLink } from '@cognite/cdf-utilities';

export const HomeButton = () => {
  const navigate = useNavigate();

  return (
    <Tooltip content="All 3D models">
      <Button
        icon="Home"
        aria-label="Home"
        onClick={() => {
          navigate(createLink(`/explore/search/threeD`));
        }}
      />
    </Tooltip>
  );
};

export const ExpandButton = ({
  viewer,
  viewerModel,
}: {
  viewer: Cognite3DViewer | null;
  viewerModel: Cognite3DModel | null;
}) => {
  return (
    <Tooltip content="Fit to view">
      <Button
        icon="ExpandAlternative"
        aria-label="Fit to view"
        onClick={() => {
          if (viewer && viewerModel) {
            viewer.fitCameraToModel(viewerModel);
          }
        }}
      />
    </Tooltip>
  );
};
