import { GraphQlErrorLocation } from './graphql-error-location';

export interface GraphQlError {

  readonly locations: GraphQlErrorLocation[];
  readonly message: string;
  readonly path: string[];

}
