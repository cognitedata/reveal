import fs from 'fs';
import path from 'path';

import { CustomActionFunction } from 'node-plop';

import { CopyManyActionConfig, TransformFn } from '../types';

type TransformAction<T> = {
  data: any;
  cfg: T;
  transform: TransformFn<T>;
};

const folderIsIgnored = (source: string, ignoreList: undefined | string[]) => {
  if (!ignoreList) {
    return false;
  }
  return ignoreList.some((ignore) => source.includes(ignore));
};

const copyRecursive = async (
  src: string,
  dest: string,
  transformAction?: TransformAction<CopyManyActionConfig>
) => {
  const exists = fs.existsSync(src);
  if (!exists || folderIsIgnored(src, transformAction?.cfg.ignore)) {
    return;
  }
  const stats = fs.statSync(src);
  const isDirectory = stats.isDirectory();
  if (isDirectory) {
    fs.mkdirSync(dest);
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursive(
        path.join(src, childItemName),
        path.join(dest, childItemName),
        transformAction
      );
    });
  } else if (transformAction) {
    const transformedFile = await transformAction.transform(
      fs.readFileSync(src).toString(),
      transformAction.data,
      transformAction.cfg
    );
    fs.writeFileSync(dest, transformedFile, {
      mode: stats.mode,
    });
  } else {
    fs.copyFileSync(src, dest);
  }
};

const copyMany: CustomActionFunction = (answers, config, plop) => {
  if (!config || !plop) {
    return 'copy failed';
  }
  const typedConfig = config as CopyManyActionConfig;
  let transform;
  if (typedConfig.transform) {
    transform = {
      data: answers,
      cfg: typedConfig,
      transform: typedConfig.transform,
    };
  }
  if (fs.existsSync(typedConfig.destination)) {
    return 'destination already exists';
  }
  copyRecursive(
    plop.renderString(typedConfig.base, answers),
    plop.renderString(typedConfig.destination, answers),
    transform
  );
  return 'success';
};

export default copyMany;
