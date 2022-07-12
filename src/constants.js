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
 
module.exports = {
    help_menu: `
    Usage: flight [command] [flags]
  
    Displays help information.
  
    Options:
      -h, --help                          output usage information
      -v, --version 		          display installed version
      -js, --js                           manage nodejs packages
      -luau --luau                        manage luau packages
      -rs --rs                            manage rust packages
      -py --py                            manage python packages
  
    Commands:
      - install
      - uninstall
      - init
      - build
      - run
      - publish
      - update
      - login
      - logout
      - create
  
    Run flight --help COMMAND for more information on specific commands.\n`,

    tagline_short: `Swift, reliable, multi-language package manager.`,

    tagline_long: `Flight is a universal package manager for your needs, no matter what language you may want to write your code in.`,

    authors: `CompeyDev; monitrr`,

    Sha256_Checksum: `01ccffbd0d6c8a2a1935b9cc9256567b8c66abeef6171c3f813920b831ec1e47`,

    version: `v0.34.0`,

    license: `Apache-2.0`,

    download_url: `https://github.com/flightpkg/flight/releases/download/v0.34.0/v0.34.0.tar.gz`
}
