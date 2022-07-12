/*
 *
 *    Copyright 2022 flightpkg Contributors
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */
 
const router = require('express').Router();
const request = require('superagent');
const semver = require('semver');
const { normalizePath } = require('typescript');
const stringify = require('json-stable-stringify');
const {
  fetchChildDefinitions,
  fetchChildDependencies,
  fetchDirList,
  fetchPackageJson,
  JSDELIVR_URL
} = require('./fetchers');

router.use(require('./packageURLMiddleware'));

function turboHandler(req, res, next) {
  if (req.packageVersion === 'latest' || !semver.valid(req.packageVersion)) {
    return res.status(400).send({ error: 'Must specify exact version' });
  }

  const { packageSlug } = req;

  const vendorFiles = {};

  Promise.all([fetchDirList(packageSlug), fetchPackageJson(packageSlug)])
    .then(([fileList, packageJson]) => {
      const entryPoint = packageJson.main || 'index.js';
      const typesEntry =
        packageJson.types || packageJson.typings || 'index.d.ts';

      return Promise.all([
        fetchChildDependencies(
          `${JSDELIVR_URL}/${packageSlug}`,
          normalizePath(entryPoint),
          fileList.concat(), // Pass a copy since fetchChildDependencies will mutate fileList
          vendorFiles
        ),
        fetchChildDefinitions(
          `${JSDELIVR_URL}/${packageSlug}`,
          normalizePath(typesEntry),
          fileList.concat(), // Pass a copy since fetchChildDefinitions will mutate fileList
          vendorFiles
        )
      ]).then(() => {
        res.setHeader('Cache-Control', 'public, max-age=31557600, immutable');
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.send(
          stringify({ vendorFiles, dirCache: { [packageSlug]: fileList } })
        );
      });
    })
    .catch(error => {
      console.error(error);
      res.sendStatus(400);
    });
}

router.get('/:package@:version', turboHandler);
router.get('/@:scoped/:package@:version', turboHandler);

module.exports = router;
