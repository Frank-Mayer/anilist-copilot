interface Stored {
  anilistToken: {
    access_token: string;
    token_type: string;
    expires_in: number;
  };
}

export class TypedStorage {
  protected _storage: chrome.storage.StorageArea;

  public constructor(storage?: chrome.storage.StorageArea) {
    this._storage = storage || chrome.storage.sync;
  }

  public onChanged<K extends keyof Stored>(
    key: K,
    callback: (newValue: Stored[K], oldValue: Stored[K]) => void
  ) {
    this._storage.onChanged.addListener((changes) => {
      if (key in changes) {
        callback(changes[key].newValue, changes[key].oldValue);
      }
    });
  }

  public async get<K extends keyof Stored>(
    key: K
  ): Promise<Stored[K] | undefined> {
    const resObj = await this._storage.get(key);
    if (key in resObj) {
      return resObj[key] as Promise<Stored[K]>;
    } else {
      return undefined;
    }
  }

  public async has<K extends keyof Stored>(key: K): Promise<boolean> {
    const resObj = await this._storage.get(key);
    return key in resObj;
  }

  public remove(key: keyof Stored) {
    return this._storage.remove(key);
  }

  public async getOrCreate<K extends keyof Stored>(
    key: K,
    defaultValue: () => Stored[K]
  ): Promise<Stored[K]> {
    const res = await this.get(key);
    if (res === undefined) {
      const value = defaultValue();
      await this.set(key, value);
      return value;
    } else {
      return res;
    }
  }

  public async set<K extends keyof Stored>(
    key: K,
    value: Stored[K]
  ): Promise<void> {
    this._storage.set({ [key]: value });
  }
}
