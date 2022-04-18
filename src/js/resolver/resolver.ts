import semver from "semver";
import { Graph } from "graphlib";
import { NpmHttpRegistry } from ".";
import {
  Dependencies,
  PackageJson,
  Packument,
  PackumentVersion,
} from "@npm/types";
import { queue, QueueObject } from "async";
const packageJsonProps = [
  "main",
  "browser",
  "module",
  "types",
  "typings",
  "js:next",
  "unpkg",
];

interface ResolutionError {
  error: string;
  data: unknown;
}

interface Task {
  name: string;
  version: string | semver.Range;
  parentNode: string;
}

interface JPack {
  appDependencies: Record<string, PackumentVersion>;
  resDependencies: Record<string, PackumentVersion>;
  warnings: {
    invalidPeers: Record<string, Dependencies>;
    missingPeers: Record<string, Dependencies>;
    requestedPeers: Record<string, Dependencies>;
  };
}

export class Resolver {
  graph: Graph;
  invalidPeers: Record<string, Dependencies>;
  missingPeers: Record<string, Dependencies>;
  requestedPeers: Record<string, Dependencies>;
  jpack: JPack;
  error?: ResolutionError;
  startTime: number;
  timeout: number;
  registry: NpmHttpRegistry;
  packageJsonProps: PackageJson;
  validatePeers: any;
  queue: QueueObject<Task>;
  concurrency?: number;

  constructor(options: unknown) {
    this.graph = new Graph();
    this.registry = new NpmHttpRegistry();
    this.invalidPeers = {};
    this.missingPeers = {};
    this.requestedPeers = {};
    this.jpack = {
      appDependencies: {
        // version: "",
        // dependencies: {}
      },
      resDependencies: {},
      warnings: {
        invalidPeers: {},
        missingPeers: {},
        requestedPeers: {},
      },
    };
    this.packageJsonProps = {
      name: "",
      version: "",
      author: undefined,
      bin: undefined,
      browser: undefined,
      bundleDependencies: undefined,
      bundledDependencies: undefined,
      contributors: undefined,
      depedencies: undefined,
      description: undefined,
      devDependencies: undefined,
      directories: undefined,
      engines: undefined,
      files: undefined,
      keywords: undefined,
      license: undefined,
      main: undefined,
      man: undefined,
      peerDependencies: undefined,
      private: undefined,
      publishConfig: undefined,
      repository: undefined,
      scripts: undefined,
      types: undefined,
    };
    this.timeout = 10000;
    this.startTime = 0;
    this.queue = queue((task, done) => {
      if (Date.now() - this.startTime > this.timeout || this.error) {
        if (!this.error) {
          this.error = { error: "TIMEOUT", data: null };
        }
        return done();
      }

      this.loadRegistryPackage(task);
    }, this.concurrency);

    this.queue.pause();
  }

  async loadRegistryPackage(task: Task) {
    const name = task.name;

    try {
      const pkg = await this.registry.fetch(name);
      await this.resolveDependencies(task, pkg);
    } catch {
      this.error = {
        error: "PACKAGE_NOT_FOUND",
        data: name,
      };
    }
  }

  async resolveDependencies(task: Task, registryPackage: Packument) {
    const version = await this.resolveVersion(task.version, registryPackage);

    if (!version) {
      this.error = {
        error: "MISSING_VERSION",
        data: task.name,
      };
      return;
    }

    const fullName = `${registryPackage.name}@${version}`;
    const versionPackageJson = registryPackage.versions[version];
    const isRootDependency = task.parentNode === "root";
    const subDepsResolved = this.graph.hasNode(fullName);

    if (isRootDependency) {
      this.graph.setNode(registryPackage.name, { version, fullName });
      this.graph.setNode(fullName);
      this.graph.setEdge(task.parentNode, registryPackage.name);
    } else {
      this.graph.setEdge(task.parentNode, fullName);
    }

    if (subDepsResolved) {
      return;
    }
    // TYPO IN THE PACKAGE
    const dependencies = {
      ...versionPackageJson.depedencies,
      ...versionPackageJson.peerDependencies,
    };
    if (isRootDependency && versionPackageJson.peerDependencies) {
      this.requestedPeers[fullName] = versionPackageJson.peerDependencies;
      Object.keys(versionPackageJson.peerDependencies).forEach(peerName =>
        this.graph.setEdge(fullName, peerName),
      );
    }

    const depNames = Object.keys(dependencies);

    await this.registry.batchFetch(depNames);
    //TODO fix whatever this does
    depNames.forEach(name =>
      this.queue.push({
        name,
        version: dependencies[name],
        parentNode: fullName,
      }),
    );
  }

  async resolveVersion(
    requestedVersion: semver.Range | string,
    registryPackage: Packument,
  ) {
    if (
      typeof requestedVersion === "string" &&
      registryPackage["dist-tags"] &&
      registryPackage["dist-tags"].hasOwnProperty(requestedVersion)
    ) {
      return registryPackage["dist-tags"][requestedVersion];
    }

    const availableVersions = Object.keys(registryPackage.versions);

    if (requestedVersion === "") {
      requestedVersion = "*";
    }

    let version = semver.maxSatisfying(
      availableVersions,
      requestedVersion,
      true,
    );

    if (
      !version &&
      requestedVersion === "*" &&
      registryPackage["dist-tags"].latest
    ) {
      version =
        registryPackage["dist-tags"] && registryPackage["dist-tags"].latest;
    }

    if (!version) {
      this.error = {
        error: "UNSATISFIED_RANGE",
        data: { name: registryPackage.name, range: requestedVersion },
      };
      return;
    }

    return version;
  }

  validatePeerDependencies() {
    const topDeps = this.graph.successors("root") ?? undefined;

    for (const [fullName, peers] of Object.entries(this.requestedPeers)) {
      for (const [peerName, requestedPeerVersion] of Object.entries(peers)) {
        if (!topDeps?.some(name => name === peerName)) {
          if (!this.missingPeers[peerName]) {
            this.missingPeers[peerName] = {};
          }

          this.missingPeers[peerName][fullName] = requestedPeerVersion;
        } else if (
          !semver.satisfies(
            this.graph.node(peerName).version,
            requestedPeerVersion,
          )
        ) {
          if (!this.invalidPeers[fullName]) {
            this.invalidPeers[fullName] = {};
          }

          this.invalidPeers[fullName][peerName] = requestedPeerVersion;
        }
      }
    }
    if (Object.keys(this.missingPeers).length) {
      this.error = {
        error: "MISSING_PEERS",
        data: this.missingPeers,
      };
    }
  }

  fillJpackDep(
    fullName: string,
    versionPkg: PackumentVersion | null,
    dep: PackumentVersion,
  ) {
    const successors = this.graph.successors(fullName);
    if (!successors) {
      return;
    }
    successors.forEach(name => {
      if (name.substring(1).indexOf("@") === -1) {
        const peerDep = this.graph.node(name);
        // TYPO IN THE PACKAGE
        if (peerDep && dep.depedencies) {
          dep.depedencies[name] = `${name}@${peerDep.version}`;
        }
      } else {
        // TYPO IN THE PACKAGE
        if (dep.depedencies) {
          dep.depedencies[name.substring(0, name.lastIndexOf("@"))] = name;
        }
        this.addJpackResDep(name);
      }
    });

    if (versionPkg) {
      dep = { ...dep, ...versionPkg };
    }
  }

  addJpackResDep(fullName: string) {
    if (!this.jpack.resDependencies.hasOwnProperty(fullName)) {
      const atIndex = fullName.lastIndexOf("@");

      if (atIndex <= 0) {
        this.fillJpackDep(fullName, null, this.jpack.appDependencies[fullName]);
      } else {
        const depName = fullName.substring(0, atIndex);
        const version = fullName.substring(atIndex + 1);
        const versionPkg = this.registry.cache[depName].versions[version];
        this.jpack.resDependencies[fullName] = {
          ...this.jpack.resDependencies[fullName],
          version,
        };

        this.fillJpackDep(
          fullName,
          versionPkg,
          this.jpack.resDependencies[fullName],
        );
      }
    }
  }

  renderJpack() {
    const root = this.graph.successors("root");
    if (!root) {
      return;
    }
    for (const depName of root) {
      const { version, fullName } = this.graph.node(depName);
      const versionPkg = this.registry.cache[depName].versions[version];
      this.jpack.appDependencies[depName] = {
        ...this.jpack.appDependencies[depName],
        version,
      };

      this.fillJpackDep(
        fullName,
        versionPkg,
        this.jpack.appDependencies[depName],
      );
    }

    if (Object.keys(this.invalidPeers).length) {
      this.jpack.warnings.invalidPeers = this.invalidPeers;
    }
  }

  resolve(dependencies: Record<string, string>) {
    return new Promise(async (resolve, reject) => {
      const depNames = Object.keys(dependencies);

      if (depNames.length === 0) {
        return resolve(this.jpack);
      }

      depNames.forEach(name =>
        this.queue.push({
          name,
          version: dependencies[name],
          parentNode: "root",
        }),
      );

      this.queue.drain(async () => {
        if (this.error) {
          return reject(this.error);
        }

        if (this.validatePeers) {
          this.validatePeerDependencies();
        }

        if (this.error) {
          return reject(this.error);
        } else {
          this.renderJpack();

          return resolve(this.jpack);
        }
      });

      this.startTime = Date.now();
      await this.registry.batchFetch(depNames);
      this.queue.resume();
    });
  }
}
