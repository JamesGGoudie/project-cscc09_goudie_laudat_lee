export abstract class Environment {

  private static readonly isProd: boolean = true;

  public static getDatabaseUrl(): string {
    return this.isProd ?
        process.env.DATABASE_URL :
        'postgres://postgres:qwerasdf@localhost:5432/architect';
  }

  public static getGraphQlPort(): number {
    return 3000;
  }

  public static getGraphQlPath(): string {
    return '/graphql';
  }

  public static getOrigin(): string {
    return this.isProd ?
        'https://www.architect3d.com:443' :
        'http://localhost:4200';
  }

  public static getPeerKey(): string {
    return 'architect';
  }

  public static getPeerPath(): string {
    return '/peer';
  }

  public static getPeerPort(): number {
    return 9000;
  }

  public static isDatabaseSecure(): boolean {
    return this.isProd;
  }

  public static isPeerProxied(): boolean {
    return this.isProd;
  }

  public static isGraphIQlEnabled(): boolean {
    return !this.isProd;
  }

}
