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
import { MapIcon } from 'pages/authorized/search/map/MapboxMap';

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
  ];
}
