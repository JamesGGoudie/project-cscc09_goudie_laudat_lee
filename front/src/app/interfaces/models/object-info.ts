/**
 * The base information of an object that can be used to reconstruct an object.
 */
export interface ObjectInfo {

  readonly objectId: string;

  readonly name: string;
  readonly geometryType: string;

  readonly position: number[];
  readonly rotation: number[];
  readonly scale: number[];

  readonly materialColorHex: string;

}
