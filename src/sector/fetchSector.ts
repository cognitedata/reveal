
export function fetchRequest(sectorId: number): Promise<ArrayBuffer> {
  return new Promise<ArrayBuffer>((resolve, reject) => {
    setTimeout(() => resolve(new ArrayBuffer(0)), Math.random() * 4000);
  });
}


