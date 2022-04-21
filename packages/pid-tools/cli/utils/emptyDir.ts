import fs from 'fs';
import path from 'path';
import util from 'util';

const unlink = util.promisify(fs.unlink);

const emptyDir = async (directory: string) => {
  const fileNames = await util.promisify(fs.readdir)(directory);
  return Promise.all(
    fileNames.map((fileName) => unlink(path.join(directory, fileName)))
  );
};

export default emptyDir;
