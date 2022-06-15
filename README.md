<p align="center">
<a href="https://discord.gg/nSq93KYykn">
  <img src="https://media.discordapp.net/attachments/963759772455292961/975778403955404840/Banner.png?width=1440&height=388" />
</a>
</p>
<!-- <h1 align="center">Flight</h1> -->
<h2 align="center">Swift, reliable, multi-language package manager.</h2>

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

## 🕵️‍♂️ VirusTotal Scans
| **Platform** | **VirusTotal Scan**    |
| -------  | ------------------ |
| Windows  | <a href="https://www.virustotal.com/gui/file/f7748343325785c81476bc802441010b624b3bbd989770a8b3ee5b694a7d5ed7/detection"> <img src="https://img.shields.io/badge/dynamic/json?label=Detections&query=%24.positives&url=https%3A%2F%2Fupdates.flightpkg.js.org%2Fapi%2Fvirustotal-win"> </a> |

<br>

## :clap: Supporters

[![Stargazers repo roster for @flightpkg/flight](https://reporoster.com/stars/flightpkg/flight)](https://github.com/flightpkg/flight/stargazers)

<br>

## Built With

[NodeJS](https://nodejs.org/)

## License

Apache-2.0 © flightpkg - see the [LICENSE.md](LICENSE) file for details.
