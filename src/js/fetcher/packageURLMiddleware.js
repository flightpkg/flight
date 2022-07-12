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
 
const validateNPMPackageName = require('validate-npm-package-name');
const url = require('url');

const URLFormat = /^\/((?:@[^\/@]+\/)?[^\/@]+)(?:@([^\/]+))?(\/.*)?$/;

function packageURL(req, res, next) {
  const { pathname, search, query } = url.parse(req.url, true);

  const match = URLFormat.exec(pathname);

  if (match === null){
    return res
      .status(400)
      .type('text')
      .send(`Invalid URL: ${req.url}`);;
  }

  const packageName = match[1];
  const packageVersion = tryDecode(match[2]) || 'latest';
  const filename = tryDecode(match[3]);
  const errors = validateNPMPackageName(packageName).errors;

  if (errors){
    return res
      .status(400)
      .type('text')
      .send(
        `Invalid package name: ${packageName} (${errors.join(', ')})`
      );
  }

  req.packageName = packageName;
  req.packageVersion = packageVersion;
  req.packageSlug = `${packageName}@${packageVersion}`;
  req.pathname = pathname;
  req.filename = filename;
  req.search = search;
  req.query = query;

  next();
}

function tryDecode(param) {
  if (param) {
    try {
      return decodeURIComponent(param);
    } catch (error) {}
  }

  return '';
}

module.exports = packageURL;
