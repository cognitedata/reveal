import { Router } from 'express';
import { readFileSync, existsSync } from 'fs';
import { CdfDatabaseService } from '../../common/cdf-database.service';
import {
  CdfApiConfig,
  CdfMockDatabase,
  CdfResourceObject,
  ExtendedRouter,
} from '../../types';
import {
  filterCollection,
  flattenNestedObjArray,
  objToFilter,
} from '../../utils';
import { resolve as pathResolve } from 'path';

function getPath(path: string): string {
  return pathResolve(process.cwd(), path);
}

export default function (db: CdfMockDatabase, config: CdfApiConfig) {
  // Create router
  const filesApiRouter = Router() as ExtendedRouter;

  filesApiRouter.get(
    '/files/gcs_proxy/cognitedata-file-storage/:id',
    async (req, res) => {
      const fileInfo = CdfDatabaseService.from(db, 'files').find({
        id: +req.params.id,
      });

      if (!fileInfo.metadata.filepath) {
        res
          .status(404)
          .jsonp({ error: 'filepath was not found in the metadata' });
        return;
      }

      let rawdata;
      const filePath = getPath(fileInfo.metadata.filepath as string);
      if (!existsSync(filePath)) {
        res.status(404).jsonp({
          error: 'File was not found on specified filepath - ' + filePath,
        });
        return;
      }

      const headers = {
        'content-type': fileInfo.mimeType,
      };

      if (fileInfo.mimeType === 'application/json') {
        rawdata = readFileSync(filePath, 'utf8');
        rawdata = JSON.parse(rawdata);
      }

      if (fileInfo.mimeType === 'application/pdf') {
        rawdata = readFileSync(filePath);
        headers['accept-ranges'] = 'bytes';
        headers['content-length'] = rawdata.length;
      }

      res.status(200).set(headers).send(rawdata);
    }
  );

  filesApiRouter.post('/files/downloadlink', async (req, res) => {
    const filesData = CdfDatabaseService.from(db, 'files').getState();
    const filters = req.body.items;

    const filesRes = filterCollection(
      filesData,
      objToFilter(flattenNestedObjArray(filters, false))
    ) as CdfResourceObject[];

    const fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;

    res.status(200).jsonp({
      items: filesRes.map((file) => ({
        id: file.id,
        downloadUrl: fullUrl.replace(
          /downloadlink/gim,
          'gcs_proxy/cognitedata-file-storage/' + file.id
        ),
      })),
    });
  });

  return filesApiRouter;
}
