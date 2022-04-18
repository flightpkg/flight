import { rmSync } from "fs";
import fs from "fs/promises";
import { constants, createWriteStream, createReadStream } from "fs";
import { Resolver, NpmHttpRegistry } from "./src/js/resolver/index.js";
import kleur from "kleur";
import zlib from "zlib";
import path from "path";
import tar from "tar";
import stream from "got";
import { exec } from "child_process";
import { promisify } from "util";
import { Dependencies, PackageJson } from "@npm/types";
const execAsync = promisify(exec);

const args = process.argv.slice(2);

interface Package {
  dependencies: Record<string, string>;
}

async function deleteFolderRecursive(path: string) {
  const dir = await fs.readdir(path);

  for (const file in dir) {
    const curPath = path + "/" + file;

    if ((await fs.lstat(curPath)).isDirectory()) {
      // recurse
      await deleteFolderRecursive(curPath);
    } else {
      // delete file
      await fs.unlink(curPath);
    }
  }

  await fs.rmdir(path);
}

async function readJSON<T>(path: string) {
  return JSON.parse(await fs.readFile(path, "utf8")) as T;
}

function resolve(deps: Record<string, string>): unknown {
  // const resolver = new Resolver(); // For server-side usage, uses https://registry.npmjs.org which doesn't have CORS enabled
  const resolver = new Resolver({
    registry: new NpmHttpRegistry({
      registryUrl: "https://registry.yarnpkg.com/",
    }),
  });

  return resolver.resolve(deps);
}

async function get() {
  const { dependencies } = await readJSON<Package>("./package.json");

  const results = await resolve(dependencies);
  try {
    await fs.writeFile("flight.lock", JSON.stringify(results, null, "\t"));
  } catch (err: unknown) {
    if (err === null) {
      console.log(kleur.bold().green("Lockfile successfully created."));
      const json = await readJSON<{
        appDependencies: Dependencies;
        resDependencies: Dependencies;
      }>("./flight.lock");

      try {
        await fs.mkdir(".flight");
      } catch (e) {
        const dir = await fs.readdir(".flight");
        for (const file of dir) {
          await fs.rm(file);
        }
        await fs.rmdir(".flight");
        await fs.mkdir(".flight");
      }

      for (const [k, v] of Object.entries(json)) {
        const name = k;
        const version = v.version;
        const urlformat = `https://registry.yarnpkg.com/${name}/-/${name}-${version}.tgz`;
        console.log(
          kleur.bold().blue("Downloading:") +
            " " +
            name +
            " @ " +
            version +
            ".",
        );
        // const {
        //   default: {
        //     stream
        //   }
        // } = require("got");
        // const {
        //   createWriteStream
        // } = require("fs");
        // const {
        //   execSync
        // } = require("child_process");
        const exists = async (path: string) => {
          try {
            await fs.access(path, constants.F_OK);
            return true;
          } catch {
            return false;
          }
        };

        const start = async () => {
          const download = (await stream(urlformat)).pipe(
            createWriteStream(`./.flight/${name}-${version}.tgz`),
          );
          await promisify(download.on)("finish");
          console.log(
            kleur.bold().green("Downloaded: ") +
              " " +
              name +
              " @ " +
              version +
              ".",
          );
          const find = await exists("node_modules");

          if (find == true) {
            await execAsync(
              `cd .flight ; tar zxvf ${name}-${version}.tgz -C ../node_modules`,
            );
          }

          if (find == false) {
            execAsync(
              `mkdir node_modules ; cd .flight ; tar zxvf ${name}-${version}.tgz -C ../node_modules`,
            );
          }

          if (!exists(`./node_modules/${name}/`)) {
            await fs.mkdir(`./node_modules/${name}/`, {
              recursive: true,
            });
          }

          createReadStream(path.resolve(`./.flight/${name}-${version}.tgz`))
            .pipe(zlib.createUnzip())
            .pipe(
              tar.extract({
                C: `./node_modules/${name}/`,
                strip: 1,
              }),
            )
            .on("finish", () => {
              rmSync(`./.flight/${name}-${version}.tgz`);
              console.log(
                kleur.bold().magenta("Unzipped:    ") +
                  " " +
                  name +
                  " @ " +
                  version +
                  ".",
              );
            });
        };
        start();
      }

      const json2 = json.resDependencies;

      for (const [k] of Object.entries(json2)) {
        const raw = k;
        if (raw.startsWith("@") == false) {
          const split = raw.split("@");
          const name = split[0];
          const version = split[1];
          const urlformat = `https://registry.yarnpkg.com/${name}/-/${name}-${version}.tgz`;
          console.log(
            kleur.bold().blue("Downloading:") +
              " " +
              name +
              " @ " +
              version +
              ".",
          );
          // const {
          //   default: {
          //     stream
          //   }
          // } = require("got");
          // const {
          //   createWriteStream
          // } = require("fs");
          // const {
          //   execSync
          // } = require("child_process");
          const exists = async (path: string) => {
            try {
              await fs.access(path, constants.F_OK);
              return true;
            } catch {
              return false;
            }
          };

          const start = async () => {
            const download = (await stream(urlformat)).pipe(
              createWriteStream(`./.flight/${name}-${version}.tgz`),
            );
            await promisify(download.on)("finish");

            console.log(
              kleur.bold().green("Downloaded: ") +
                " " +
                name +
                " @ " +
                version +
                ".",
            );
            const find = await exists("node_modules");

            if (find == true) {
              await execAsync(
                `cd .flight ; tar zxvf ${name}-${version}.tgz -C ../node_modules`,
              );
            }

            if (find == false) {
              await execAsync(
                `mkdir node_modules ; cd .flight ; tar zxvf ${name}-${version}.tgz -C ../node_modules`,
              );
            }

            if (!exists(`./node_modules/${name}/`)) {
              await fs.mkdir(`./node_modules/${name}/`, {
                recursive: true,
              });
            }

            createReadStream(path.resolve(`./.flight/${name}-${version}.tgz`))
              .pipe(zlib.createUnzip())
              .pipe(
                tar.extract({
                  C: `./node_modules/${name}/`,
                  strip: 1,
                }),
              )
              .on("finish", () => {
                rmSync(`./.flight/${name}-${version}.tgz`);
                console.log(
                  kleur.bold().magenta("Unzipped:    ") +
                    " " +
                    name +
                    " @ " +
                    version +
                    ".",
                );
              });
          };
          await start();
        }
        // below org scope code is still pretty buggy (try fixing this if you can, the syntax for resDeps with org scope is @org/pkg)
        if (raw.startsWith("@") == true) {
          const split = raw.split("/");
          const scope = split[0];
          console.log(scope);
          const pkg = split[1];
          const version = pkg.split("@")[1];
          const name = pkg.split("@")[0];
          console.log(version);
          const urlformat = `https://registry.yarnpkg.com/${scope}/${name}/-/${name}-${version}.tgz`;
          console.log(
            kleur.bold().blue("Downloading:") +
              " " +
              name +
              " @ " +
              version +
              ".",
          );
          // const {
          //   default: {
          //     stream
          //   }
          // } = require("got");
          // const {
          //   createWriteStream
          // } = require("fs");
          // const {
          //   execSync
          // } = require("child_process");
          const exists = async (path: string) => {
            try {
              await fs.access(path, constants.F_OK);
              return true;
            } catch {
              return false;
            }
          };

          const start = async () => {
            const download = (await stream(urlformat)).pipe(
              createWriteStream(`./.flight/${name}-${version}.tgz`),
            );
            await promisify(download.on)("finish");
            console.log(
              kleur.bold().green("Downloaded: ") +
                " " +
                name +
                " @ " +
                version +
                ".",
            );
            const find = await exists("node_modules");

            if (find == true) {
              await execAsync(
                `cd .flight ; tar zxvf ${name}-${version}.tgz -C ../node_modules`,
              );
            }

            if (find == false) {
              await execAsync(
                `mkdir node_modules ; cd .flight ; tar zxvf ${name}-${version}.tgz -C ../node_modules`,
              );
            }

            if (!exists(`./node_modules/${name}/`)) {
              await fs.mkdir(`./node_modules/${name}/`, {
                recursive: true,
              });
            }

            createReadStream(path.resolve(`./.flight/${name}-${version}.tgz`))
              .pipe(zlib.createUnzip())
              .pipe(
                tar.extract({
                  C: `./node_modules/${name}/`,
                  strip: 1,
                }),
              )
              .on("finish", () => {
                rmSync(`./.flight/${name}-${version}.tgz`);
                console.log(
                  kleur.bold().magenta("Unzipped:    ") +
                    " " +
                    name +
                    " @ " +
                    version +
                    ".",
                );
              });
          };
          await start();
        }
      }
    }
  }

  async function uninstall(_name: string) {
    const pkgjson = await readJSON<PackageJson>("./package.json");
    let pkgs: Dependencies = {};
    const pkgname = args[1];
    if (typeof args[1] !== "undefined") {
      pkgs = { ...pkgs, ...pkgjson.depedencies };

      if (pkgname in pkgs) {
        try {
          deleteFolderRecursive(path.resolve(`./.flight/${pkgname}/`));
          console.log(
            kleur.bold().red("Uninstalled ") +
              pkgname +
              " from the .flight directory.",
          );
        } catch (e) {
          console.log(
            kleur.bold().red("Error: ") +
              pkgname +
              kleur
                .bold()
                .red(" is not present in the flight packages directory."),
          );
        }

        delete pkgs[pkgname];
        pkgjson.depedencies = pkgs;
        fs.writeFile("./package.json", JSON.stringify(pkgjson, null, 4));
        console.log(
          kleur.bold().red("Removed ") + pkgname + " from packages.json.",
        );
      } else {
        console.log(
          kleur.bold().red("Package ") +
            pkgname +
            kleur.bold().red(" not found in package.json."),
        );
      }
    } else {
      console.log(kleur.bold().red("Please specify a package to uninstall."));
    }
  }

  if (args[0] == "install" || args[0] == "i") {
    await get();
  } else if (args[0] == "uninstall") {
    uninstall(args[0]);
  } else {
    console.log(kleur.bold().bgGreen("Commands:"));
    console.log(
      kleur.green("install") + " - Install all dependencies from package.json.",
    );
    console.log(kleur.green("uninstall [dep]") + " - Uninstall a dependency.");
  }
}
/**
{
  appDependencies: {
    rxjs: {
      version: '5.5.12',
      dependencies: [Object],
      main: './Rx.js',
      typings: './Rx.d.ts'
    },
    'left-pad': {
      version: '1.3.0',
      dependencies: {},
      main: 'index.js',
      types: 'index.d.ts'
    },
    'zone.js': {
      version: '0.11.5',
      dependencies: [Object],
      main: './bundles/zone.umd.js',
      module: './fesm2015/zone.js',
      typings: './zone.d.ts'
    },
    '@angular/core': {
      version: '5.2.11',
      dependencies: [Object],
      main: './bundles/core.umd.js',
      module: './esm5/core.js',
      typings: './core.d.ts'
    }
  },
  resDependencies: {
    'symbol-observable@1.0.1': { dependencies: {}, typings: 'index.d.ts' },
    'tslib@2.3.1': {
      dependencies: {},
      main: 'tslib.js',
      module: 'tslib.es6.js',
      typings: 'tslib.d.ts'
    },
    'tslib@1.14.1': {
      dependencies: {},
      main: 'tslib.js',
      module: 'tslib.es6.js',
      typings: 'tslib.d.ts'
    }
  },
 */

//yes
