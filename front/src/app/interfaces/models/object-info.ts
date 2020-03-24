export interface ObjectInfo {

  readonly objectId: string;

  readonly version: number;

  readonly name: string;
  readonly geometryType: string;

  readonly position: number[];
  readonly rotation: number[];
  readonly scale: number[];

  readonly materialColorHex: string;

}
