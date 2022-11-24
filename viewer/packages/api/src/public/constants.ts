/*!
 * Copyright 2022 Cognite AS
 */

import { Matrix4 } from 'three';

import { cadFromCdfToThreeMatrix } from '@reveal/data-providers';

/**
 * The transformation matrix from CDF coordinates to ThreeJS/Reveal.
 * Note that this is already applied to {@link CogniteCadModel} and {@link CognitePointCloudModel}
 * automatically, as it is factored into the matrix returned from e.g.
 * the {@link CogniteCadModel.getCdfToDefaultModelTransformation} method.
 */
export const CDF_TO_VIEWER_TRANSFORMATION: Matrix4 = cadFromCdfToThreeMatrix;
