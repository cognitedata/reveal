/*!
 * Copyright 2025 Cognite AS
 */
import { type DataSourceType } from '@cognite/reveal';
import { type DmsUniqueIdentifier } from '../../data-providers';

export type Image360AnnotationContent = DataSourceType['image360AnnotationType'];
export type Image360AnnotationId = number | DmsUniqueIdentifier;
