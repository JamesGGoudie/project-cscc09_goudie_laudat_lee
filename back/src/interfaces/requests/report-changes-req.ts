export interface ReportChangesReq {

  readonly objectId: string;
  readonly userId: string;
  readonly workspaceId: string;

  readonly version: number;

  readonly name: string;
  readonly type: string;

  readonly posX: number;
  readonly posY: number;
  readonly posZ: number;
  readonly rotX: number;
  readonly rotY: number;
  readonly rotZ: number;
  readonly scaX: number;
  readonly scaY: number;
  readonly scaZ: number;

  readonly col: string;

}
