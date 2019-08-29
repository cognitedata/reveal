use std::error::Error;
use std::fs::File;
use std::io::{stdin, stdout, Read};

use clap::clap_app;

use serde_derive::{Deserialize, Serialize};
use serde_json;
use serde_yaml;

use i3df;

#[derive(Deserialize, Serialize)]
enum Scene {
    Basic(i3df::Scene),
    Renderables(i3df::renderables::Scene),
}

fn main() -> Result<(), Box<dyn Error>> {
    let matches = clap_app!(("i3df-parser") =>
        (@arg file: +takes_value)
        (@arg yaml: -y --yaml)
        (@arg compact: -c --compact)
        (@arg renderables: -r --renderables)
    )
    .get_matches();

    let file = matches.value_of("file");
    let use_yaml = matches.is_present("yaml");
    let use_compact = matches.is_present("compact");
    let to_renderables = matches.is_present("renderables");

    let reader: Box<dyn Read> = if let Some(file) = file {
        Box::new(File::open(file)?)
    } else {
        Box::new(stdin())
    };

    let scene: Scene = if to_renderables {
        Scene::Renderables(i3df::parse_scene_to_renderables(reader)?)
    } else {
        Scene::Basic(i3df::parse_scene(reader)?)
    };

    if use_compact {
        serde_json::to_writer(stdout(), &scene)?;
    } else if use_yaml {
        serde_yaml::to_writer(stdout(), &scene)?;
    } else {
        serde_json::to_writer_pretty(stdout(), &scene)?;
    }

    Ok(())
}
