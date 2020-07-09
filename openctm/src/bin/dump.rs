use serde_derive::{Deserialize, Serialize};
use std::error::Error;
use std::fs::File;
use std::io::stdout;
use structopt::StructOpt;

#[derive(StructOpt)]
struct Options {
    file: String,
    #[structopt(short, long)]
    yaml: bool,
    #[structopt(short, long)]
    compact: bool,
    #[structopt(short, long)]
    stats: bool,
}

#[derive(Deserialize, Serialize)]
struct UvMapStats {
    pub name: String,
    pub file_name: String,
    pub coordinates: usize,
}

#[derive(Deserialize, Serialize)]
enum Output {
    File(openctm::File),
    FileStats {
        vertices: usize,
        indices: usize,
        normals: Option<usize>,
        uv_maps: Vec<UvMapStats>,
    },
}

fn main() -> Result<(), Box<dyn Error>> {
    let options = Options::from_args();

    let reader = Box::new(File::open(options.file)?);

    let file = openctm::parse(std::io::BufReader::new(reader))?;

    let output = if options.stats {
        Output::FileStats {
            indices: file.indices.len(),
            vertices: file.vertices.len(),
            normals: match file.normals {
                Some(x) => Some(x.len()),
                None => None,
            },
            uv_maps: file
                .uv_maps
                .into_iter()
                .map(|x| UvMapStats {
                    name: x.name,
                    file_name: x.file_name,
                    coordinates: x.coordinates.len(),
                })
                .collect(),
        }
    } else {
        Output::File(file)
    };

    if options.compact {
        serde_json::to_writer(stdout(), &output)?;
    } else if options.yaml {
        serde_yaml::to_writer(stdout(), &output)?;
    } else {
        serde_json::to_writer_pretty(stdout(), &output)?;
    }

    Ok(())
}
