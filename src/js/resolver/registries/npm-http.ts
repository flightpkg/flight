import npa from "npm-package-arg";
import axios from "axios";
import type { Packument } from "@npm/types";

export interface NpmHttpRegistryOptions {
  registryUrl?: string;
}

export class NpmHttpRegistry {
  registryUrl: string;
  cache: Record<string, Packument>;
  constructor(options?: NpmHttpRegistryOptions) {
    this.registryUrl = options?.registryUrl ?? "https://registry.npmjs.org";
    this.cache = {};
  }

  async fetch(name: string) {
    const escapedName = name && npa(name).escapedName;

    if (escapedName && this.cache.hasOwnProperty(escapedName)) {
      return this.cache[name];
    } else {
      const res = await axios.get<Packument>(
        `${this.registryUrl}/${escapedName}`,
      );
      if (res.status < 200 || res.status >= 400) {
        const message = `Status: ${res.status}`;

        console.log(`Could not load ${name}`);
        console.log(message);

        throw new Error(`Could not load ${name}`);
      }

      this.cache[name] = res.data;
      return res.data;
    }
  }

  async batchFetch(keys: string[]) {
    return Promise.all(keys.map(key => this.fetch(key)));
  }
}
