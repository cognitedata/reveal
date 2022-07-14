import { MapIcon } from '@cognite/react-map';

import {
  DOCUMENT_MARKER,
  DOCUMENTS_CLUSTER_MARKER,
  MIXED_CLUSTER_MARKER,
  WELL_MARKER,
  WELLS_CLUSTER_MARKER,
} from 'pages/authorized/search/map/constants';
import { documentImage } from 'pages/authorized/search/map/icons/document';
import { documentsCluster } from 'pages/authorized/search/map/icons/documentsCluster';
import { mixedCluster } from 'pages/authorized/search/map/icons/mixedCluster';
import { wellImage } from 'pages/authorized/search/map/icons/well';
import { wellsCluster } from 'pages/authorized/search/map/icons/wellsCluster';

import {
  OIL_GAS_PATTERN,
  GAS_CONDENSATE_PATTERN,
  SURFACE_FACILITY_ICON,
  SUBSURFACE_FACILITY_ICON,
} from '../constants';
import {
  surfacefacilityImage,
  subsurfacefacilityImage,
} from '../icons/facility';
import { oilgasImage, gascondensateImage } from '../icons/fields';

export function getMapIcons(): MapIcon[] {
  const wellIcon = new Image();
  wellIcon.src = wellImage;

  const documentIcon = new Image();
  documentIcon.src = documentImage;

  const mixedClusterIcon = new Image();
  mixedClusterIcon.src = mixedCluster;

  const documentsClusterIcon = new Image();
  documentsClusterIcon.src = documentsCluster;

  const wellsClusterIcon = new Image();
  wellsClusterIcon.src = wellsCluster;

  const oilgasPattern = new Image();
  oilgasPattern.src = oilgasImage;

  const gascondensatePattern = new Image();
  gascondensatePattern.src = gascondensateImage;

  const surfacefacilityIcon = new Image();
  surfacefacilityIcon.src = surfacefacilityImage;

  const subsurfacefacilityIcon = new Image();
  subsurfacefacilityIcon.src = subsurfacefacilityImage;

  return [
    {
      name: WELL_MARKER,
      icon: wellIcon,
    },
    {
      name: DOCUMENT_MARKER,
      icon: documentIcon,
    },
    {
      name: MIXED_CLUSTER_MARKER,
      icon: mixedClusterIcon,
    },
    {
      name: DOCUMENTS_CLUSTER_MARKER,
      icon: documentsClusterIcon,
    },
    {
      name: WELLS_CLUSTER_MARKER,
      icon: wellsClusterIcon,
    },
    {
      name: OIL_GAS_PATTERN,
      icon: oilgasPattern,
    },
    {
      name: GAS_CONDENSATE_PATTERN,
      icon: gascondensatePattern,
    },
    {
      name: SURFACE_FACILITY_ICON,
      icon: surfacefacilityIcon,
    },
    {
      name: SUBSURFACE_FACILITY_ICON,
      icon: subsurfacefacilityIcon,
    },
  ];
}
