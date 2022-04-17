require "language/node"
require 'fileutils'

class Flight < Formula
  desc "thing"
  homepage "example.com"
  url "https://github.com/flightpkg/flight/archive/refs/tags/v0.0.1.zip"
  version "v0.0.1"
  sha256 "01ccffbd0d6c8a2a1935b9cc9256567b8c66abeef6171c3f813920b831ec1e47"
  license "Apache-2.0"

  depends_on "node"

  def install
    # ENV.deparallelize  # if your formula fails when building in parallel
    FileUtils.mkdir_p '../../../usr/local/flight'
    # system "mkdir ~/usr/local/flight"
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
