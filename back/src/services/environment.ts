export abstract class Environment {

  private static readonly isProd: boolean = true;

  /**
   * The URL of the database.
   *
   * During production, this changes frequently.
   * If the Heroku client is installed, the database URL can be found in the
   * Heroku environment variables.
   *
   * During development, it will likely be fixed.
   */
  public static getDatabaseUrl(): string {
    return this.isProd ?
        process.env.DATABASE_URL :
        'postgres://postgres:qwerasdf@localhost:5432/architect';
  }

  /**
   * The port of the GraphQL server.
   */
  public static getGraphQlPort(): number {
    return 3000;
  }

  /**
   * The path required to hit the GraphQL server.
   */
  public static getGraphQlPath(): string {
    return '/graphql';
  }

  public static getOrigin(): string {
    return this.isProd ?
        'https://www.architect3d.com:443' :
        'http://localhost:4200';
  }

  /**
   * The key required to access the PeerJS server.
   */
  public static getPeerKey(): string {
    return 'architect';
  }

  /**
   * The path required to hit the PeerJS server.
   */
  public static getPeerPath(): string {
    return '/peer';
  }

  /**
   * The port of the PeerJS server.
   */
  public static getPeerPort(): number {
    return 9000;
  }

  /**
   * Are communications between the GraphQL server and the database SSL
   * encrypted.
   *
   * During development, this is not feasible.
   *
   * During production, this is enabled even though they are both behind a
   * proxy.
   */
  public static isDatabaseSecure(): boolean {
    return this.isProd;
  }

  /**
   * For IP address management, the Peer JS needs to know if it is behind a
   * proxy.
   *
   * This will only be the case during prod.
   * During development, it will be running without a proxy.
   */
  public static isPeerProxied(): boolean {
    return this.isProd;
  }

  /**
   * GraphiQL is an interactive UI for GraphQL used for development.
   * It will be disabled in production but available in development.
   */
  public static isGraphIQlEnabled(): boolean {
    return !this.isProd;
  }

  public static isDebuggingEnabled(): boolean {
    return this.isProd;
  }

}
