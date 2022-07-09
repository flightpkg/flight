use neon::prelude::*;
use serde_derive::Deserialize;
use indoc::formatdoc;
mod init;
mod constants;


#[derive(Deserialize)]
struct Config {
    version: String,
    logging: Logging
}

#[derive(Deserialize)]
struct Logging {
    debug: String,
}

#[allow(unused_must_use)]
fn parse(mut cx: FunctionContext) -> JsResult<JsString> {
    init::launch();
        let configs = formatdoc!{r#"
            version = {VERSION}
            
            [logging]
            debug = 'true'
            "#,
            VERSION = constants::VERSION
        };

    let config: Config = toml::from_str(&configs).unwrap();

    assert_eq!(config.version, "true");
    assert_eq!(config.logging.debug, "t");
    Ok(cx.string(config.logging.debug))
}

#[neon::main]
fn main(mut cx: ModuleContext) -> NeonResult<()> {
    cx.export_function("parse", parse)?;
    Ok(())
}
