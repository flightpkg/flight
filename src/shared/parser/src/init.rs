use std::fs::File;
use std::io::prelude::*;

pub fn launch() -> std::io::Result<()> {
    let mut file = File::create("~/.config/flight.toml")?;
    file.write_all(b"test")?;
    Ok(())
}
