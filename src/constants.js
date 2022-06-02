module.exports = {
    help_menu: `
    Usage: flight [command] [flags]
  
    Displays help information.
  
    Options:
      -h, --help                          output usage information
	    -v, --version 				              display installed version
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
  
    Run flight --help COMMAND for more information on specific commands.\n`,

    tagline_short: `Swift, reliable, multi-language package manager.`,

    tagline_long: `Flight is a universal package manager for your needs, no matter what language you may want to write your code in.`,

    authors: `CompeyDev; monitrr`,

    Sha256_Checksum: `01ccffbd0d6c8a2a1935b9cc9256567b8c66abeef6171c3f813920b831ec1e47`,

    version: `v0.0.6`,

    license: `Apache-2.0`,

    download_url: `https://github.com/flightpkg/flight/releases/download/v0.0.6/v0.0.6.tar.gz`
}
