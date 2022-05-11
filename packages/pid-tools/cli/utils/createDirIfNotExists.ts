import fs from 'fs';

const createdirIfNotExists = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

export default createdirIfNotExists;
