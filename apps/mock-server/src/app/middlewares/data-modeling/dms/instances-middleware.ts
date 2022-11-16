import { Router } from 'express';
import { CdfDatabaseService } from '../../../common/cdf-database.service';
import { CdfApiConfig, CdfMockDatabase, ExtendedRouter } from '../../../types';
import { filterCollection, objToFilter } from '../../../utils';

export default function (db: CdfMockDatabase, config: CdfApiConfig) {
  const cdfDb = db;
  const whitelistedProps = [
    'type',
    'space',
    'container',
    'from',
    'to',
    'createdTime',
    'lastUpdatedTime',
  ];
  const dbMetadataPropsPrefix = '_metadata_';
  // Create router
  const instancesApiRouter = Router() as ExtendedRouter;

  // to reuse existing filtering utils and be able to implement the functionality easy
  // decided to prefix props from wrapper object needed for DMS V3
  // This means that we need to map input params and response as well
  instancesApiRouter.get('/instances', (req, res) => {
    const data = CdfDatabaseService.from(cdfDb, 'instances').getState();
    const filter = {};
    Object.keys(req.query).forEach((key) => {
      if (whitelistedProps.includes(key)) {
        filter[`${dbMetadataPropsPrefix}${key}`] = req.query[key];
      } else {
        filter[key] = req.query[key];
      }
    });

    const instances = filterCollection(data, objToFilter(filter)) as any[];

    const results = instances.map((item) => {
      const metadata = {};
      const instanceProps = {};
      const id = item.id;
      Object.keys(item).map((instanceProp) => {
        if (instanceProp.startsWith(dbMetadataPropsPrefix)) {
          metadata[instanceProp.replace(dbMetadataPropsPrefix, '')] =
            item[instanceProp];
        } else if (instanceProp !== 'id') {
          instanceProps[instanceProp] = item[instanceProp];
        }
      });

      const [spaceName, containerName] = (id as string).split('_');
      return {
        externalId: item.externalId,
        ...metadata,
        properties: {
          [spaceName]: {
            [containerName]: { ...instanceProps },
          },
        },
      };
    });
    return res.status(200).jsonp(results);
  });

  instancesApiRouter.post('/instances/ingest', (req, res) => {
    const instancesDb = CdfDatabaseService.from(cdfDb, 'instances');

    req.body.items.forEach((item) => {
      const dbInstance = instancesDb.find({ externalId: item.externalId });
      const container = item.containers[0].container;
      const props = item.containers[0].properties;
      const metadata =
        item.instanceType === 'edge'
          ? {
              _metadata_type: 'edge',
              _metadata_space: container.space,
              // _metadata_from: 'Post',
              // _metadata_to: 'Comment',
              _metadata_createdTime: Date.now(),
              _metadata_lastUpdatedTime: Date.now(),
            }
          : {
              _metadata_type: 'node',
              _metadata_space: container.space,
              _metadata_container: container.externalId,
              _metadata_view: container.externalId,
              _metadata_createdTime: Date.now(),
              _metadata_lastUpdatedTime: Date.now(),
            };
      const transformedInstance = {
        id: `${container.space}_${container.externalId}_${item.externalId}`,
        externalId: item.externalId,
        ...props,
        ...metadata,
      };

      if (dbInstance && dbInstance.id) {
        instancesDb.updateBy(
          { externalId: item.externalId },
          transformedInstance
        );
      } else {
        instancesDb.insert(transformedInstance);
      }
    });

    return res.status(200).jsonp({ items: [] });
  });

  return instancesApiRouter;
}
