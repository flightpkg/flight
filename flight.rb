require "language/node"
require 'fileutils'

class Flight < Formula
  desc "Flight homebrew formula."
  homepage "https://flightpkg.js.org"
  url "https://github.com/flightpkg/flight/archive/refs/tags/v0.0.5.zip"
  version "v0.0.5"
  sha256 "c56d37a87a33b921b9feb29c15980dfc549606a2afb11578ba8aa52c67bb1c23"
  license "Apache-2.0"

  depends_on "node"

  def install
    FileUtils.mkdir_p '../../../usr/local/flight'
    origin = Dir.getwd
    destination = '../../../usr/local/flight'
    
    Dir.glob(File.join(origin, '*')).each do |file|
      if File.exists? File.join(destination, File.basename(file))
        FileUtils.move file, File.join(destination, "1-#{File.basename(file)}")
      else
        FileUtils.move file, File.join(destination, File.basename(file))
      end
    end
    system `export FLIGHT_DIR='export FLIGHT_HOME="~/usr/local/flight/dist/js"' ; echo $FLIGHT_DIR >> ~/.bashrc ; . ~/.bashrc ; echo 'export PATH=$FLIGHT_HOME:$PATH' >> ~/.bashrc`
  end
end
