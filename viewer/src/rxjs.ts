import { Observable } from 'rxjs';
import { createLocalCadModel } from './datasources/local/cad/createLocalCadModel';
import { switchMap, flatMap, map } from 'rxjs/operators';

export async function testme() {
  console.log("HEY");
  const model = await createLocalCadModel('./3d-data/ivar_aasen/ivar-aasen-2020-02-03-self-contained-fix/');
  console.log(model.scene);
  console.log("TEST");

  const fetcher = switchMap((n: number) => model.fetchSectorSimple(n));

  const generator = Observable.create(function(observer: any) {
    observer.next([1, 2, 3]);
  });
  const pipeline = generator.pipe(
    flatMap((id: number, index: number) => id),
    map((id: number) => model.fetchSectorSimple(id))
  );
  pipeline.subscribe((x: number) => console.log(x));
}
