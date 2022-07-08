use neon::prelude::*;
use serde_derive::Deserialize;

#[derive(Deserialize)]
struct Config {
    debug: String,
}



fn parse(mut cx: FunctionContext) -> JsResult<JsString> {
    let config: Config = toml::from_str(r#"
        debug = 'true'
    "#).unwrap();

    assert_eq!(config.debug, "true");
    Ok(cx.string(config.debug))
}



#[neon::main]
fn main(mut cx: ModuleContext) -> NeonResult<()> {
    cx.export_function("parse", parse)?;
    Ok(())
}
