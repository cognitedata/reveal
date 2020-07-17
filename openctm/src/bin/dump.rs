use serde_derive::{Deserialize, Serialize};
use std::error::Error;
use std::fs::File;
use std::io::{stdout, Cursor, Read, Seek, SeekFrom};
use std::{fs, time};
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
    #[structopt(short, long)]
    benchmark: bool,
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
    Benchmark {
        runs: usize,
        avg_time_micros: u64,
        best_time: u64,
    },
}

fn get_file_as_byte_vec(filename: &str) -> Result<Vec<u8>, Box<dyn Error>> {
    let mut f = File::open(&filename)?;
    let metadata = fs::metadata(&filename)?;
    let mut buffer = vec![0; metadata.len() as usize];
    f.read_exact(&mut buffer)?;

    Ok(buffer)
}

fn main() -> Result<(), Box<dyn Error>> {
    let options = Options::from_args();

    let file_bytes = get_file_as_byte_vec(&options.file)?;
    let cursor = Cursor::new(file_bytes);
    let mut buf_reader = std::io::BufReader::new(cursor);

    let parsed_file = openctm::parse(&mut buf_reader)?;

    let output = if options.stats {
        Output::FileStats {
            indices: parsed_file.indices.len(),
            vertices: parsed_file.vertices.len(),
            normals: match parsed_file.normals {
                Some(x) => Some(x.len()),
                None => None,
            },
            uv_maps: parsed_file
                .uv_maps
                .into_iter()
                .map(|x| UvMapStats {
                    name: x.name,
                    file_name: x.file_name,
                    coordinates: x.coordinates.len(),
                })
                .collect(),
        }
    } else if options.benchmark {
        let runs = 1000;
        let mut times = vec![0; runs];
        for time in times.iter_mut().take(runs) {
            buf_reader.seek(SeekFrom::Start(0))?;
            let t1 = time::Instant::now();
            openctm::parse(&mut buf_reader)?;
            let t2 = time::Instant::now();
            *time = t2.duration_since(t1).as_micros() as u64;
        }
        let total_time: u64 = times.iter().sum();
        let avg_time = total_time / runs as u64;
        let best_time = *times.iter().min().unwrap();

        Output::Benchmark {
            runs,
            avg_time_micros: avg_time,
            best_time,
        }
    } else {
        Output::File(parsed_file)
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
