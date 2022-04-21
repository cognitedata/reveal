import fs from 'fs';
import path from 'path';

const writeJsonToFile = (directory: string, fileName: string, data: any) => {
  fs.writeFile(
    path.resolve(directory, fileName),
    JSON.stringify(data, undefined, 2),
    (error) => {
      if (error) {
        throw error;
      }
    }
  );
};

export default writeJsonToFile;
