export interface CacheInterface {
  getByKey(key: string): Promise<string | null>;
  createCache(url: string, shortned_url: string): Promise<void>;
}
