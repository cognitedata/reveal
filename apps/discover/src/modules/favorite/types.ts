import {
  FavoritePatchContentSchema,
  FavoritePatchSchema,
  FavoriteSummary as FavoriteSummaryApi,
} from '@cognite/discover-api-types';
import { Document } from '@cognite/sdk-playground';

import { DocumentLabel, DocumentType } from '../documentSearch/types';
import { getFilepath } from '../documentSearch/utils/getFilepath';
import { BasicUserInfo } from '../user/types';
import { Well } from '../wellSearch/types';

export const SHOW_CREATE_MODAL = 'prettypoly/favourite/SHOW_CREATE_MODAL';
export const HIDE_CREATE_MODAL = 'prettypoly/favourite/HIDE_CREATE_MODAL';
export const SET_VIEWMODE = 'prettypoly/favourites/SET_VIEWMODE';

/**
 * Data actions
 */
export const SET_ITEMS_TO_ADD_AFTER_FAVORITE_CREATION =
  'prettypoly/favorite/SET_ITEMS_TO_ADD_AFTER_FAVORITE_CREATION';

export type ViewModeType = 'Card' | 'Row';

export interface ViewModeObject {
  Card: ViewModeType;
  Row: ViewModeType;
}

interface ShowCreateModal {
  type: typeof SHOW_CREATE_MODAL;
}

interface HideCreateModal {
  type: typeof HIDE_CREATE_MODAL;
}

interface SetViewmode {
  type: typeof SET_VIEWMODE;
  viewMode: ViewModeType;
}

interface SetItemsToAddAfterFavoriteCreation {
  type: typeof SET_ITEMS_TO_ADD_AFTER_FAVORITE_CREATION;
  payload: FavouriteState['itemsToAddAfterFavoriteCreation'] | undefined;
}

export type FavouriteAction =
  | HideCreateModal
  | ShowCreateModal
  | SetViewmode
  | SetItemsToAddAfterFavoriteCreation;

export interface FavouriteState {
  selectedItems: DocumentType[];
  isCreateModalVisible: boolean;
  viewMode: ViewModeType;
  itemsToAddAfterFavoriteCreation?: {
    documentIds?: number[];
    wells: FavoriteContentWells | undefined;
    seismicIds?: number[];
  };
}

export type LastUpdatedBy = {
  userId: string;
  dateTime: string;
  firstname?: string;
  lastname?: string;
};

export type SharedWithData = {
  user: { id: string; firstname?: string; lastname?: string };
  permissions: ('READ' | 'WRITE')[];
};

export interface FavoriteSummary {
  id: string;
  owner: BasicUserInfo;
  description: string;
  name: string;
  createdTime: string;
  lastUpdatedTime: string;
  lastUpdatedBy: LastUpdatedBy[];
  assetCount: number;
  content: FavoriteContent;
  sharedWith: SharedWithData[];
}

export interface FavoriteContent {
  documentIds: number[];
  wells: FavoriteContentWells;
  seismicIds: number[];
}

export interface FavoriteContentWells {
  [key: string]: string[];
}

export interface FavouriteRowType<T> {
  row: {
    allCells: any[];
    cells: any[];
    depth: number;
    getRowProps: () => any;
    getToggleRowSelectedProps: () => any;
    id: string;
    index: number;
    isExpanded: boolean;
    isSelected: boolean;
    isSomeSelected: boolean;
    original: T;
    originalSubRows: [];
    subRows: [];
    toggleRowSelected: () => any;
    values: any;
  };
}

export interface FavoriteMetadata {
  name?: string;
  description?: string;
  color?: string;
}

export interface UpdateFavoriteData {
  id: string;
  updateData: FavoritePatchSchema;
}

export interface UpdateFavoriteContentData {
  id: string;
  updateData: FavoritePatchContentSchema;
}

export interface FavoriteDocumentData {
  id: number;
  externalId?: string;
  name: string;
  author?: string;
  created?: Date;
  lastUpdated?: Date;
  path?: string;
  truncatedContent?: string;
  location?: string;
  labels?: DocumentLabel[];
  filesize?: number;
  type?: string;
  topfolder?: string;
}

export interface FavoriteWellData {
  id: number;
  name: string;
}

export const mapAPIResultDocumentSearchItemToFavoriteDocumentData = (
  item: Document
): FavoriteDocumentData => {
  return {
    id: item.id,
    externalId: item.externalId,
    author: item.author || 'Unknown',
    created: item.sourceFile.createdTime,
    lastUpdated: item.sourceFile.lastUpdatedTime,
    name: item.sourceFile.name,
    truncatedContent: item.truncatedContent,
    path: getFilepath(item),
    location: item.sourceFile.source,
    labels: item.labels,
    filesize: item.sourceFile.size,
    type: item.type,
    topfolder: item.sourceFile.directory
      ? item.sourceFile.directory.split('/')[1]
      : undefined,
  };
};

export const mapWellToFavoriteWellData = (well: Well): FavoriteWellData => ({
  id: well.id,
  name: well.name,
});

/**
 * We are not using the generated type directly. We are mapping it to a local type.
 * The reason is so we can have easier upgrades when API models change names or properties.
 * This way we only change it at one place, not through the whole app.
 */
export const normalizeFavorite = (
  data: FavoriteSummaryApi
): FavoriteSummary => {
  return {
    id: data.id,
    name: data.name,
    description: data.description || '',
    lastUpdatedBy: data.lastUpdatedBy,
    lastUpdatedTime: data.lastUpdatedTime,
    assetCount: data.assetCount,
    content: data.content,
    createdTime: data.createdTime,
    owner: data.owner,
    sharedWith: data.sharedWith,
  };
};
