use serde_derive::Serialize;
use std::error::Error;
use std::fs::File;
use std::io::{stdout, BufReader};
use structopt::StructOpt;

#[derive(StructOpt)]
struct Options {
    file: String,
    #[structopt(short, long)]
    yaml: bool,
    #[structopt(short, long)]
    compact: bool,
    #[structopt(short, long)]
    renderables: bool,
    #[structopt(short, long)]
    stats: bool,
}

#[derive(Clone, Debug, Serialize)]
struct FileSectorContentsStats {
    pub grid_size: [u32; 3],
    pub grid_origin: [f32; 3],
    pub grid_increment: f32,
    pub node_count: usize,
}

#[derive(Serialize)]
#[serde(untagged)]
enum Output {
    FileSector(f3df::Sector),
    FileSectorStats {
        sector_id: u64,
        parent_sector_id: Option<u64>,
        bbox_min: [f32; 3],
        bbox_max: [f32; 3],
        sector_contents: Option<FileSectorContentsStats>,
    },
    RenderableSector(f3df::renderables::Sector),
}

fn run() -> Result<(), Box<dyn Error>> {
    let options = Options::from_args();

    let file = options.file;
    let use_yaml = options.yaml;
    let use_compact = options.compact;
    let to_renderables = options.renderables;

    let reader = BufReader::new(File::open(file)?);
    let file_sector = f3df::parse_sector(reader)?;
    let sector: Output = if to_renderables {
        Output::RenderableSector(f3df::renderables::convert_sector(&file_sector))
    } else if options.stats {
        Output::FileSectorStats {
            sector_id: file_sector.sector_id,
            parent_sector_id: file_sector.parent_sector_id,
            bbox_min: file_sector.bbox_min,
            bbox_max: file_sector.bbox_max,
            sector_contents: match file_sector.sector_contents {
                None => None,
                Some(x) => Some(FileSectorContentsStats {
                    grid_size: x.grid_size,
                    grid_origin: x.grid_origin,
                    grid_increment: x.grid_increment,
                    node_count: x.nodes.len(),
                }),
            },
        }
    } else {
        Output::FileSector(file_sector)
    };

    if use_compact {
        serde_json::to_writer(stdout(), &sector)?;
    } else if use_yaml {
        serde_yaml::to_writer(stdout(), &sector)?;
    } else {
        serde_json::to_writer_pretty(stdout(), &sector)?;
    }

    Ok(())
}

fn main() {
    run().unwrap();
}
