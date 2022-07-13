/*
 *
 *    Copyright 2022 flightpkg Contributors
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */

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
