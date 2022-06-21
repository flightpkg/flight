#!/bin/sh
set -e

reset="\033[0m"
red="\033[31m"
green="\033[32m"
yellow="\033[33m"
cyan="\033[36m"
white="\033[37m"
gpg_key=6567A9918662A1C4

flight_get_tarball() {
  printf "$cyan> Downloading tarball...$reset\n"
  if [ "$1" = '--nightly' ]; then
    urlhttps://github.com/flightpkg/flight/releases/download/v0.34.0/v0.34.0.tar.gz
  elif [ "$1" = '--rc' ]; then
    url=https://github.com/flightpkg/flight/releases/download/v0.34.0/v0.34.0.tar.gz
  elif [ "$1" = '--version' ]; then
    # Validate that the version matches MAJOR.MINOR.PATCH to avoid garbage-in/garbage-out behavior
    version=$2
    if echo $version | grep -qE "^[[:digit:]]+\.[[:digit:]]+\.[[:digit:]]+$"; then
      url="https://github.com/flightpkg/flight/archive/refs/tags/$version.tar.gz"
    else
      printf "$red> Version number must match MAJOR.MINOR.PATCH.$reset\n"
      exit 1;
    fi
  else
    url=https://github.com/flightpkg/flight/releases/download/v0.34.0/v0.34.0.tar.gz
  fi
  # Get both the tarball and its GPG signature
  tarball_tmp=`mktemp -t flight.tar.gz.XXXXXXXXXX`
  if curl --fail -L -o "$tarball_tmp#1" "$url{,.gpg}"; then
    flight_verify_integrity $tarball_tmp

    printf "$cyan> Extracting to ~/flight...$reset\n"
    # All this dance is because `tar --strip=1` does not work everywhere
    temp=$(mktemp -d flight.XXXXXXXXXX)
    tar zxf $tarball_tmp -C "$temp"
    mkdir flight
    mv "$temp"/*/* flight
    rm -rf "$temp"
    rm $tarball_tmp*
    cd flight/bin
    mv cli-linux flight
    rm -rf cli-win.exe cli-macos
  else
    printf "$red> Failed to download $url.$reset\n"
    exit 1;
  fi
}

# Verifies the GPG signature of the tarball
flight_verify_integrity() {
  # Check if GPG is installed
  if [[ -z "$(command -v gpg)" ]]; then
    printf "$yellow> WARNING: GPG is not installed, integrity can not be verified!$reset\n"
    return
  fi

  if [ "$flight_GPG" == "no" ]; then
    printf "$cyan> WARNING: Skipping GPG integrity check!$reset\n"
    return
  fi

  printf "$cyan> Verifying integrity...$reset\n"
  # Grab the public key if it doesn't already exist
  gpg --list-keys $gpg_key >/dev/null 2>&1 || (curl -sS https://raw.githubusercontent.com/flightpkg/flight/main/pubKey.pgp | gpg --import)

  if [ ! -f "$1.gpg" ]; then
    printf "$red> Could not download GPG signature for this flight release. This means the release can not be verified!$reset\n"
    flight_verify_or_quit "> Do you really want to continue?"
    return
  fi

  # Actually perform the verification
  if gpg --verify "$1.gpg"; then
    printf "$green> GPG signature looks good$reset\n"
  else
    printf "$red> GPG signature for this flight release is invalid! This is BAD and may mean the release has been tampered with. It is strongly recommended that you report this to the flight developers.$reset\n"
    flight_verify_or_quit "> Do you really want to continue?"
  fi
}



flight_detect_profile() {
  if [ -n "${PROFILE}" ] && [ -f "${PROFILE}" ]; then
    echo "${PROFILE}"
    return
  fi

  local DETECTED_PROFILE
  DETECTED_PROFILE=''
  local SHELLTYPE
  SHELLTYPE="$(basename "/$SHELL")"

  if [ "$SHELLTYPE" = "bash" ]; then
    if [ -f "$HOME/.bashrc" ]; then
      DETECTED_PROFILE="$HOME/.bashrc"
    elif [ -f "$HOME/.bash_profile" ]; then
      DETECTED_PROFILE="$HOME/.bash_profile"
    fi
  elif [ "$SHELLTYPE" = "zsh" ]; then
    DETECTED_PROFILE="$HOME/.zshrc"
  elif [ "$SHELLTYPE" = "fish" ]; then
    DETECTED_PROFILE="$HOME/.config/fish/config.fish"
  fi

  if [ -z "$DETECTED_PROFILE" ]; then
    if [ -f "$HOME/.profile" ]; then
      DETECTED_PROFILE="$HOME/.profile"
      # echo "export PATH=~/flight/bin:$PATH" >> $DETECTED_PROFILE
    elif [ -f "$HOME/.bashrc" ]; then
      DETECTED_PROFILE="$HOME/.bashrc"
      # echo "export PATH=~/flight/bin:$PATH" >> $DETECTED_PROFILE
    elif [ -f "$HOME/.bash_profile" ]; then
      DETECTED_PROFILE="$HOME/.bash_profile"
      # echo "export PATH=~/flight/bin:$PATH" >> $DETECTED_PROFILE
    elif [ -f "$HOME/.zshrc" ]; then
      DETECTED_PROFILE="$HOME/.zshrc"
      # echo "export PATH=~/flight/bin:$PATH" >> $DETECTED_PROFILE
    elif [ -f "$HOME/.config/fish/config.fish" ]; then
      DETECTED_PROFILE="$HOME/.config/fish/config.fish"
      # echo "export PATH=~/flight/bin:$PATH" >> $DETECTED_PROFILE
    fi
  fi

  if [ ! -z "$DETECTED_PROFILE" ]; then
    echo "export PATH=~/flight/bin:$PATH" >> $DETECTED_PROFILE
  fi
}

flight_reset() {
  unset -f flight_install flight_reset flight_get_tarball flight_detect_profile flight_verify_integrity flight_verify_or_quit
}

flight_install() {
  printf "${white}Installing flight!$reset\n"

  if [ -d "$HOME/flight" ]; then
    if which flight; then
      local latest_url
      local specified_version
      local version_type
      if [ "$1" = '--nightly' ]; then
        latest_url=https://github.com/flightpkg/flight/releases/download/v0.34.0/v0.34.0.tar.gz
        specified_version=`curl -sS $latest_url`
        version_type='latest'
      elif [ "$1" = '--version' ]; then
        specified_version=$2
        version_type='specified'
      elif [ "$1" = '--rc' ]; then
        latest_url=https://github.com/flightpkg/flight/releases/download/v0.34.0/v0.34.0.tar.gz
        specified_version=`curl -sS $latest_url`
        version_type='rc'
      else
        latest_url=https://github.com/flightpkg/flight/releases/download/v0.34.0/v0.34.0.tar.gz
        specified_version=`curl -sS $latest_url`
        version_type='latest'
      fi
      flight_version=`v0.34.0`
      flight_alt_version=`v0.34.0`

      if [ "$specified_version" = "$flight_version" = "$specified_version" = "$flight_alt_version" ]; then
        printf "$green> flight is already at the $specified_version version.$reset\n"
        exit 0
      else
      	printf "$yellow> $flight_alt_version is already installed, Specified version: $specified_version.$reset\n"
        rm -rf "$HOME/flight"
      fi
    else
      rm -rf $HOME/flight
      printf "$red> $HOME/flight already exists, possibly from a past flight install.$reset\n"
      printf "$red> Remove it (rm -rf $HOME/flight) and run this script again.$reset\n"
      exit 0
    fi
  fi

  flight_detect_profile
  
 
  
  

  flight_get_tarball $1 $2
  flight_reset
}

flight_verify_or_quit() {
  read -p "$1 [y/N] " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]
  then
    printf "$red> Aborting$reset\n"
    exit 1
  fi
}

cd ~
flight_install $1 $2
