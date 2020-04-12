import { GraphQlErrorLocation } from './graphql-error-location';

/**
 * An error the GraphQL way.
 */
export interface GraphQlError {

  readonly locations: GraphQlErrorLocation[];
  readonly message: string;
  readonly path: string[];

}
