const defaultConfig: Record<string, unknown> = {
  rpcEndpoint: "http://localhost:26657",
  addressPrefix: "juno",
};

export class Config {
  constructor(private data: Record<string, unknown> = {}) {}

  set<T>(key: string, value: T): void {
    this.data[key] = value;
  }

  get<T>(key: string): T {
    const value = this.data[key];

    if (value === undefined) {
      throw new Error(`Config key "${key}" not found`);
    }

    return value as T;
  }
}

export const configService = new Config(defaultConfig);
