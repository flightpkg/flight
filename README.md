<p align="center">
  <img src="https://raw.githubusercontent.com/flightpkg/flight/main/assets/README-header.png" />
</p>

<h1 align="center">Flight</h1>
<h4 align="center">Swift, reliable, multi-language package manager.</h4>
<br>

<p align="center">
<img src="https://img.shields.io/github/languages/code-size/flightpkg/flight?color=FF3399">
<img src="https://img.shields.io/github/issues/flightpkg/flight?color=99B380">
<img src="https://img.shields.io/github/languages/top/flightpkg/flight?color=E69966">
<img src="https://img.shields.io/github/package-json/v/flightpkg/flight?color=FF9999">
<img src="https://img.shields.io/tokei/lines/github/flightpkg/flight?color=4D804D&label=lines%20of%20code">
</p>
<br>

# :zap: Installation

We don't have an official release of Flight yet, however, if you would like to give it a try, feel free to follow the steps below to build from source.
<br>

## Build From Source
Prerequisites: Git, Yarn and/or NPM, NodeJS.

## Steps

1. Clone the github repository using the Github CLI.

```bash
$ git clone https://github.com/flightpkg/flight
```

2. CD into the `flight` directory.

```bash
$ cd flight
```

3. Install @vercel/ncc globally if it isnt already installed

```bash
$ npm i @vercel/ncc
$ yarn add @vercel/ncc
```

4. Run the build script
```bash
$ npm run compile
$ yarn compile
```

5. CD into the dist/js directory, then init.
```bash
$ cd dist/js
-------------
$ npm init 
$ yarn init
```

<br>


## :clap: Supporters

[![Stargazers repo roster for @flightpkg/flight](https://reporoster.com/stars/flightpkg/flight)](https://github.com/flightpkg/flight/stargazers)

<br>

## Built With

[NodeJS](https://nodejs.org/)

## License

This project is licensed under Apache-2.0 - see the [LICENSE.md](LICENSE) file for details.
