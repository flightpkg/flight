<p align="center">
  <img src="https://raw.githubusercontent.com/flightpkg/flight/main/assets/transparent.png" />
</p>

<h1 align="center">Flight</h1>
<h4 align="center">Swift, reliable, multi-language package manager.</h4>
<br>

<p align="center">
<img src="https://github.com/flightpkg/flight/actions/workflows/compile.yml/badge.svg?branch=main">
<img src="https://sonarcloud.io/api/project_badges/measure?project=flightpkg_flight&metric=alert_status">
<img src="https://img.shields.io/github/languages/code-size/flightpkg/flight?color=6190E8">
<img src="https://img.shields.io/github/issues/flightpkg/flight?color=6190E8">
<img src="https://img.shields.io/github/package-json/v/flightpkg/flight?color=6190E8">
<img src="https://img.shields.io/tokei/lines/github/flightpkg/flight?color=6190E8&label=lines%20of%20code">
</p>
<br>

# :zap: Installation

We don't have an official release of Flight yet, however, if you would like to give it a try, feel free to follow the steps below to install a pre-alpha release.
<br>

### Linux:

#### Shell script (Recommended):
```bash
$ curl -qL https://raw.githubusercontent.com/flightpkg/flight/main/install.sh | bash
```

If the installer doesn't set your environment variables, add it using:

```bash
$ echo "export PATH=~/flight/bin:$PATH" >> YOUR_SHELL_CONFIG_HERE
```
...and restart your shell to use the command `flight`

#### NodeJS based installer:
```bash
$ curl https://raw.githubusercontent.com/flightpkg/flight/setup/dist/index.js -O && node index
```



#### Homebrew:
```bash
$ brew install flightpkg/flight
```

### Windows:
```ps1
> Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://raw.githubusercontent.com/flightpkg/flight/main/install.ps1'))
```

## Build From Source
Prerequisites: Git, Yarn and/or NPM, NodeJS.

## Steps

1. Clone the repository using git.

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
$ yarn global add @vercel/ncc
```

4. Run the build script
```bash
$ npm run compile && npm run build
$ yarn compile && yarn build
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
