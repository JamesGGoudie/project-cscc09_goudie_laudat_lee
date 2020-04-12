/**
 * The location of that resulted in the error in the GraphQL query.
 */
export interface GraphQlErrorLocation {

  readonly column: number;
  readonly line: number;

}
