export interface ObjectInfo {

  readonly objectId: string;

  version: number;

  name: string;
  geometryType: string;

  position: number[],
  rotation: number[]
  scale: number[],

  materialColorHex: string;

}
