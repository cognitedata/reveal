use std::io::{self, BufRead, BufReader, Cursor, Read};

use byteorder::{LittleEndian, ReadBytesExt};

use serde_derive::{Deserialize, Serialize};
use nalgebra;

#[macro_use]
extern crate impl_ops;
use std::ops;

#[macro_use]
pub mod error;
use error::*;

mod fib;
use fib::*;

pub mod renderables;

mod generated;
mod generated_renderables;

pub use generated::*;

type Vector3 = nalgebra::Vector3::<f32>;
type Vector4 = nalgebra::Vector4::<f32>;
type Matrix<X, Y, Z> = nalgebra::Matrix::<f32, X, Y, Z>;
type Rotation3 = nalgebra::Rotation3::<f32>;

const MAGIC_BYTES: u32 = 0x4644_3349;
const ATTRIBUTE_COUNT: u32 = 18;

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct Scene {
    pub root_sector_id: usize,
    pub sectors: Vec<Sector>,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct Sector {
    pub header: SectorHeader,
    pub primitive_collections: generated::PrimitiveCollections,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct SectorHeader {
    pub magic_bytes: u32,
    pub format_version: u32,
    pub optimizer_version: u32,
    pub sector_id: u64,
    pub parent_sector_id: Option<u64>,

    pub bbox_min: [f32; 3],
    pub bbox_max: [f32; 3],

    pub attributes: Option<SectorAttributes>,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct SectorAttributes {
    pub color: Vec<[u8; 4]>,
    pub diagonal: Vec<f32>,
    pub center_x: Vec<f32>,
    pub center_y: Vec<f32>,
    pub center_z: Vec<f32>,
    pub normal: Vec<[f32; 3]>,
    pub delta: Vec<f32>,
    pub height: Vec<f32>,
    pub radius: Vec<f32>,
    pub angle: Vec<f32>,
    pub translation_x: Vec<f32>,
    pub translation_y: Vec<f32>,
    pub translation_z: Vec<f32>,
    pub scale_x: Vec<f32>,
    pub scale_y: Vec<f32>,
    pub scale_z: Vec<f32>,
    pub file_id: Vec<u64>,
    pub texture: Vec<Texture>,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct SectorAttribute {
    pub item_count: u32,
    pub item_size: u32,

    pub attribute_data: SectorAttributeData,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(untagged)]
pub enum SectorAttributeData {
    Color(Vec<(u8, u8, u8, u8)>),
    Normal(Vec<(f32, f32, f32)>),
    Float32(Vec<f32>),
    Uint64(Vec<u64>),
    Texture(Vec<Texture>),
}

#[derive(Clone, Debug, Default, Deserialize, Serialize)]
pub struct Texture {
    pub file_id: u64,
    pub width: u16,
    pub height: u16,
}

pub fn parse_scene(reader: impl BufRead) -> Result<Scene, Error> {
    parse_scene_data(reader)
}

pub fn parse_root_sector(mut reader: impl BufRead) -> Result<Sector, Error> {
    //let mut reader = BufReader::new(reader);
    let size = reader.read_u32::<LittleEndian>()?;

    // read bytes
    let mut sector = vec![0; size as usize].into_boxed_slice();
    reader.read_exact(&mut sector)?;

    // parse sector
    let mut input = BufReader::new(Cursor::new(sector));
    let header = parse_sector_header(&mut input)?;
    let attributes = match &header.attributes {
        Some(x) => x,
        None => return Err(error!("Attributes missing on root sector")),
    };
    let primitive_collections = generated::parse_primitives(&mut input, &attributes)?;
    //assert!(reader.eof()?);
    Ok(Sector {
        header,
        primitive_collections,
    })
}

pub fn parse_sector(attributes: &SectorAttributes, mut reader: impl BufRead) -> Result<Sector, Error> {
    //let mut reader = BufReader::new(reader);
    // read number of bytes
    let size = reader.read_u32::<LittleEndian>()?;

    // read bytes
    let mut sector = vec![0; size as usize].into_boxed_slice();
    reader.read_exact(&mut sector)?;

    // parse sector
    let mut input = BufReader::new(Cursor::new(sector));
    let header = parse_sector_header(&mut input)?;
    let primitive_collections = generated::parse_primitives(&mut input, attributes)?;
    Ok(Sector {
        header,
        primitive_collections,
    })
}

pub fn parse_scene_data(mut reader: impl BufRead) -> Result<Scene, Error> {
    //let mut reader = BufReader::new(reader);

    let root_sector = parse_root_sector(&mut reader)?;
    let attributes = match &root_sector.header.attributes {
        Some(x) => x,
        None => return Err(error!("Attributes missing on root sector")),
    };
    let root_sector_id = root_sector.header.sector_id as usize;

    let mut other_sectors = Vec::new();
    loop {
        // check for eof
        if reader.eof()? {
            break;
        }

        let sector = parse_sector(&attributes, &mut reader)?;

        other_sectors.push(sector);
    }

    let mut sectors = vec![root_sector];
    sectors.append(&mut other_sectors);

    Ok(Scene {
        root_sector_id, // TODO consider u64
        sectors,
    })
}

pub fn parse_sector_header(mut input: &mut impl BufRead) -> Result<SectorHeader, Error> {
    // read header
    let magic_bytes = input.read_u32::<LittleEndian>()?;
    if magic_bytes != MAGIC_BYTES {
        return Err(error!(
            "Invalid magic bytes. Got {:x}, but expected {:x}.",
            magic_bytes, MAGIC_BYTES
        ));
    }
    let format_version = input.read_u32::<LittleEndian>()?;
    assert_eq!(format_version, 7);
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

    // read attributes
    let attribute_count = input.read_u32::<LittleEndian>()?;

    if attribute_count != 0 && attribute_count != ATTRIBUTE_COUNT {}

    let attributes = match attribute_count {
        0 => Ok(None),
        ATTRIBUTE_COUNT => Ok(Some(SectorAttributes {
            color: decode_array_rgba(&mut input)?,
            diagonal: decode_array_f32(&mut input)?,
            center_x: decode_array_f32(&mut input)?,
            center_y: decode_array_f32(&mut input)?,
            center_z: decode_array_f32(&mut input)?,
            normal: decode_array_normal(&mut input)?,
            delta: decode_array_f32(&mut input)?,
            height: decode_array_f32(&mut input)?,
            radius: decode_array_f32(&mut input)?,
            angle: decode_array_f32(&mut input)?,
            translation_x: decode_array_f32(&mut input)?,
            translation_y: decode_array_f32(&mut input)?,
            translation_z: decode_array_f32(&mut input)?,
            scale_x: decode_array_f32(&mut input)?,
            scale_y: decode_array_f32(&mut input)?,
            scale_z: decode_array_f32(&mut input)?,
            file_id: decode_array_u64(&mut input)?,
            texture: decode_array_texture(&mut input)?,
        })),
        _ => Err(error!(
            "Wrong number of attributes. Expected 0 or {}, but found {}.",
            ATTRIBUTE_COUNT, attribute_count
        )),
    }?;

    Ok(SectorHeader {
        magic_bytes,
        format_version,
        optimizer_version,
        sector_id,
        parent_sector_id,

        bbox_min: [bbox_min_x, bbox_min_y, bbox_min_z],
        bbox_max: [bbox_max_x, bbox_max_y, bbox_max_z],

        attributes,
    })
}

pub fn decode_array_f32(mut reader: impl Read) -> Result<Vec<f32>, Error> {
    let item_count = reader.read_u32::<LittleEndian>()?;
    let item_size = u32::from(reader.read_u8()?);

    if item_size % 4 != 0 {
        return Err(error!("Wrong item size for Vec<f32>"));
    }

    let count = ((item_size / 4) * item_count) as usize;
    let mut array = vec![Default::default(); count];
    reader.read_f32_into::<LittleEndian>(&mut array)?;

    Ok(array)
}

pub fn decode_array_normal(mut reader: impl Read) -> Result<Vec<[f32; 3]>, Error> {
    let item_count = reader.read_u32::<LittleEndian>()?;
    let item_size = u32::from(reader.read_u8()?);

    if item_size % (4 * 3) != 0 {
        return Err(error!("Wrong item size for Vec<f32>"));
    }

    let count = ((item_size / 4) * item_count) as usize;
    let mut array = vec![Default::default(); count];
    reader.read_f32_into::<LittleEndian>(&mut array)?;

    let mut result = Vec::new();
    for i in 0..item_count as usize {
        result.push([
            #[allow(clippy::identity_op)]
            array[i * 3 + 0],
            array[i * 3 + 1],
            array[i * 3 + 2],
        ])
    }

    Ok(result)
}

pub fn decode_array_u64(mut reader: impl Read) -> Result<Vec<u64>, Error> {
    let item_count = reader.read_u32::<LittleEndian>()?;
    let item_size = u32::from(reader.read_u8()?);

    if item_size % 8 != 0 {
        return Err(error!("Wrong item size for Vec<u64>"));
    }

    let count = ((item_size / 8) * item_count) as usize;
    let mut array = vec![Default::default(); count];
    reader.read_u64_into::<LittleEndian>(&mut array)?;

    Ok(array)
}

pub fn decode_array_rgba(mut reader: impl Read) -> Result<Vec<[u8; 4]>, Error> {
    let item_count = reader.read_u32::<LittleEndian>()?;
    let item_size = reader.read_u8()?;

    if item_size != 4 {
        return Err(error!(
            "Wrong item size for Vec<RGBA>. Expected 4, got {}.",
            item_size
        ));
    }

    let mut array = Vec::new();

    for _ in 0..item_count {
        let mut rgba = [Default::default(); 4];
        reader.read_exact(&mut rgba)?;

        array.push(rgba);
    }

    Ok(array)
}

pub fn decode_array_texture(mut reader: impl Read) -> Result<Vec<Texture>, Error> {
    let item_count = reader.read_u32::<LittleEndian>()?;
    let item_size = reader.read_u8()?;

    if item_size != 16 {
        return Err(error!("Wrong item size for Vec<Texture>"));
    }

    let mut array = Vec::new();

    for _ in 0..item_count {
        let file_id = reader.read_u64::<LittleEndian>()?;
        let width = reader.read_u16::<LittleEndian>()?;
        let height = reader.read_u16::<LittleEndian>()?;
        let _reserved = reader.read_u32::<LittleEndian>()?;

        array.push(Texture {
            file_id,
            width,
            height,
        });
    }

    Ok(array)
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
