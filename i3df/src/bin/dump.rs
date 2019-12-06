use std::fs::File;
use std::io::{stdout, BufReader};
use structopt::StructOpt;

use serde_derive::{Deserialize, Serialize};
use serde_json;
use serde_yaml;

#[derive(StructOpt)]
struct Options {
    root_file: String,
    sector_file: String,
    #[structopt(short, long)]
    yaml: bool,
    #[structopt(short, long)]
    compact: bool,
    #[structopt(short, long)]
    renderables: bool,
    #[structopt(short, long)]
    stats: bool,
}

#[derive(Deserialize, Serialize)]
enum Output {
    FileSector(i3df::Sector),
    FileSectorStats {
        size: u64,
    },
    RenderableSector(i3df::renderables::Sector),
    RenderableSectorStats(i3df::renderables::SectorStatistics),
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let options = Options::from_args();

    let root_file = options.root_file;
    let sector_file = options.sector_file;

    let root_reader = BufReader::new(File::open(root_file)?);
    let sector_reader = BufReader::new(File::open(sector_file)?);
    let root_sector = i3df::parse_root_sector(root_reader)?;
    let attributes = match root_sector.header.attributes {
        Some(x) => x,
        None => return Err(Box::new(i3df::error::Error::new(format!("Attributes missing on root sector"))))
    };
    let raw_sector = i3df::parse_sector(&attributes, sector_reader)?;
    let sector: Output = if options.renderables {
        Output::RenderableSector(i3df::renderables::convert_sector(&raw_sector))
    } else {
        Output::FileSector(raw_sector)
    };

    let output = if options.stats {
        match sector {
            Output::FileSector(_) => Output::FileSectorStats { size: 1000 },
            Output::RenderableSector(x) => Output::RenderableSectorStats(x.statistics()),
            x => x,
        }
    } else {
        sector
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
