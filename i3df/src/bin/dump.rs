use std::error::Error;
use std::fs::File;
use std::io::{stdin, stdout, BufReader, Read};

use clap::clap_app;

use serde_derive::{Deserialize, Serialize};
use serde_json;
use serde_yaml;

use i3df;

#[derive(Deserialize, Serialize)]
enum Output {
    FileScene(i3df::Scene),
    FileSceneStats {
        size: u64,
    },
    RenderableScene(i3df::renderables::Scene),
    RenderableSceneStats(i3df::renderables::SceneStatistics),
}

fn main() -> Result<(), Box<dyn Error>> {
    let matches = clap_app!(("i3df-parser") =>
        (@arg file: +takes_value)
        (@arg yaml: -y --yaml)
        (@arg compact: -c --compact)
        (@arg renderables: -r --renderables)
        (@arg stats: -s --stats)
    )
    .get_matches();

    let file = matches.value_of("file");
    let use_yaml = matches.is_present("yaml");
    let use_compact = matches.is_present("compact");
    let to_renderables = matches.is_present("renderables");
    let stats = matches.is_present("stats");

    let reader: Box<dyn Read> = if let Some(file) = file {
        Box::new(File::open(file)?)
    } else {
        Box::new(stdin())
    };
    let reader = BufReader::new(reader);
    let file_scene = i3df::parse_scene(reader)?;
    let scene: Output = if to_renderables {
        Output::RenderableScene(i3df::renderables::convert_scene(&file_scene))
    } else {
        Output::FileScene(file_scene)
    };

    let output = if stats {
        match scene {
            Output::FileScene(_) => Output::FileSceneStats { size: 1000 },
            Output::RenderableScene(x) => Output::RenderableSceneStats(x.statistics()),
            x => x,
        }
    } else {
        scene
    };

    if use_compact {
        serde_json::to_writer(stdout(), &output)?;
    } else if use_yaml {
        serde_yaml::to_writer(stdout(), &output)?;
    } else {
        serde_json::to_writer_pretty(stdout(), &output)?;
    }

    Ok(())
}
