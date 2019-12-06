use std::io::{self, BufRead, BufReader, Read};

use byteorder::{LittleEndian, ReadBytesExt};

use serde::Serialize;

pub mod renderables;

#[macro_use]
pub mod error;
use error::*;

#[macro_use]
extern crate bitflags;

const MAGIC_BYTES: u32 = 0x4644_3346;

#[derive(Debug, Serialize)]
pub struct Scene {
    pub sectors: Vec<Sector>,
    pub root_sector_id: usize,
}

#[derive(Debug, Serialize)]
pub struct Sector {
    pub magic_bytes: u32,
    pub format_version: u32,
    pub optimizer_version: u32,
    pub sector_id: u64,
    pub parent_sector_id: Option<u64>,

    pub bbox_min: [f32; 3],
    pub bbox_max: [f32; 3],

    pub sector_contents: Option<SectorContents>,
}


#[derive(Debug, Serialize)]
pub struct SectorContents {
    pub grid_size: [u32; 3],
    pub grid_origin: [f32; 3],
    pub grid_increment: f32,
    pub nodes: Vec<Node>,
}


#[derive(Debug, Serialize)]
pub struct Node {
    pub compress_type: CompressFlags,
    pub node_id: u64,
    pub color: Option<[u8; 3]>,
    pub faces: Vec<Face>,
}

#[derive(Debug, Serialize)]
pub struct Face {
    pub face_flags: FaceFlags,
    pub repetitions: u8,
    pub index: u64,
    pub color: Option<[u8; 3]>,
}

bitflags! {
    #[derive(Serialize)]
    pub struct FaceFlags: u8 {
        const POSITIVE_X_VISIBLE = 0b0000_0001;
        const POSITIVE_Y_VISIBLE = 0b0000_0010;
        const POSITIVE_Z_VISIBLE = 0b0000_0100;
        const NEGATIVE_X_VISIBLE = 0b0000_1000;
        const NEGATIVE_Y_VISIBLE = 0b0001_0000;
        const NEGATIVE_Z_VISIBLE = 0b0010_0000;
        const RESERVED = 0b0100_0000;
        const MULTIPLE = 0b1000_0000;
    }
}

// TODO rename so that it matches the correct repeats
bitflags! {
    #[derive(Serialize)]
    pub struct CompressFlags: u8 {
        const POSITIVE_X_REPEAT_Y = 0b0000_0001;
        const POSITIVE_Y_REPEAT_X = 0b0000_0010;
        const POSITIVE_Z_REPEAT_X = 0b0000_0100;
        const NEGATIVE_X_REPEAT_Y = 0b0000_1000;
        const NEGATIVE_Y_REPEAT_X = 0b0001_0000;
        const NEGATIVE_Z_REPEAT_X = 0b0010_0000;
        const HAS_COLOR_ON_EACH_CELL = 0b0100_0000;
        const INDEX_IS_LONG = 0b1000_0000;
    }
}

pub trait IsEOF {
    fn eof(&mut self) -> io::Result<bool>;
}

impl<T: BufRead> IsEOF for T {
    fn eof(&mut self) -> io::Result<bool> {
        let buf = self.fill_buf()?;
        Ok(buf.is_empty())
    }
}

pub fn parse_sector(reader: impl Read) -> Result<Sector, Error> {
    let mut input = BufReader::new(reader);

    let magic_bytes = input.read_u32::<LittleEndian>()?;
    if magic_bytes != MAGIC_BYTES {
        return Err(error!("Invalid magic bytes"));
    }
    let format_version = input.read_u32::<LittleEndian>()?;
    // TODO add back assert_eq!(format_version, 5);
    let optimizer_version = input.read_u32::<LittleEndian>()?;

    let sector_id = input.read_u64::<LittleEndian>()?;
    let parent_sector_id = match input.read_u64::<LittleEndian>()? {
        std::u64::MAX => None,
        x => Some(x),
    };

    let bbox_min_x = input.read_f32::<LittleEndian>()?;
    let bbox_min_y = input.read_f32::<LittleEndian>()?;
    let bbox_min_z = input.read_f32::<LittleEndian>()?;
    let bbox_max_x = input.read_f32::<LittleEndian>()?;
    let bbox_max_y = input.read_f32::<LittleEndian>()?;
    let bbox_max_z = input.read_f32::<LittleEndian>()?;

    let node_count = input.read_u32::<LittleEndian>()?;
    if node_count == 0 {
        return Ok(Sector {
            magic_bytes,
            format_version,
            optimizer_version,
            sector_id,
            parent_sector_id,
            bbox_min: [bbox_min_x, bbox_min_y, bbox_min_z],
            bbox_max: [bbox_max_x, bbox_max_y, bbox_max_z],
            sector_contents: None,
        })
    }

    let grid_size_x = input.read_u32::<LittleEndian>()?;
    let grid_size_y = input.read_u32::<LittleEndian>()?;
    let grid_size_z = input.read_u32::<LittleEndian>()?;

    let grid_origin_x = input.read_f32::<LittleEndian>()?;
    let grid_origin_y = input.read_f32::<LittleEndian>()?;
    let grid_origin_z = input.read_f32::<LittleEndian>()?;

    let grid_increment = input.read_f32::<LittleEndian>()?;

    let mut nodes = Vec::with_capacity(node_count as usize);
    for _ in 0..node_count {
        let node_id = input.read_u64::<LittleEndian>()?;
        let face_count = input.read_u32::<LittleEndian>()?;

        // TODO replace with from_bits and return error if unknown bits found
        let compress_type = CompressFlags::from_bits_truncate(input.read_u8()?);

        let has_color_on_each_cell = compress_type.intersects(CompressFlags::HAS_COLOR_ON_EACH_CELL);

        let node_color = if has_color_on_each_cell {
            None
        } else {
            let mut color = [0 as u8; 3];
            input.read_exact(&mut color)?;
            Some(color)
        };

        let mut faces = Vec::with_capacity(face_count as usize);
        for _ in 0..face_count {
            let index = if compress_type.intersects(CompressFlags::INDEX_IS_LONG) {
                input.read_u64::<LittleEndian>()?
            } else {
                u64::from(input.read_u32::<LittleEndian>()?)
            };

            // TODO do not use truncate
            let face_flags = FaceFlags::from_bits_truncate(input.read_u8()?);
            // TODO verify that the empty flag is not set while other flags are
            let multiple_faces = face_flags.intersects(FaceFlags::MULTIPLE);
            let repetitions = if multiple_faces { input.read_u8()? } else { 0 };
            let face_color = if has_color_on_each_cell {
                let mut color = [0 as u8; 3];
                input.read_exact(&mut color)?;
                Some(color)
            } else {
                None
            };
            faces.push(Face {
                face_flags,
                repetitions,
                index,
                color: face_color,
            })
        }

        nodes.push(Node {
            compress_type,
            node_id,
            color: node_color,
            faces,
        });
    }

    Ok(Sector {
        magic_bytes,
        format_version,
        optimizer_version,
        sector_id,
        parent_sector_id,
        bbox_min: [bbox_min_x, bbox_min_y, bbox_min_z],
        bbox_max: [bbox_max_x, bbox_max_y, bbox_max_z],
        sector_contents: Some(SectorContents {
            grid_size: [grid_size_x, grid_size_y, grid_size_z],
            grid_origin: [grid_origin_x, grid_origin_y, grid_origin_z],
            grid_increment,
            nodes,
        })
    })
}
