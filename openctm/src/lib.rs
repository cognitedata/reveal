use byteorder::{LittleEndian, ReadBytesExt};
use num_derive::FromPrimitive;
use serde::{Deserialize, Serialize};
use std::{io, str};

#[macro_use]
pub mod error;
use error::Error;

// The header size is usually 9 bytes in LZMA, but because OpenCTM deduces the unpacked size in
// a non-standard way, the unpacked size is removed from the header
static LZMA_HEADER_SIZE: usize = 5;

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct File {
    pub indices: Vec<u32>,
    pub vertices: Vec<Vertex>,
    pub normals: Option<Vec<Normal>>,
    pub uv_maps: Vec<UvMap>,
}

#[derive(FromPrimitive, Deserialize, Serialize)]
pub enum CompressionMethod {
    RAW = 0x0057_4152,
    MG1 = 0x0031_474d,
    MG2 = 0x0032_474d,
}

#[derive(Clone, Copy, Debug, Default, Deserialize, Serialize)]
pub struct Triangle {
    pub a: u32,
    pub b: u32,
    pub c: u32,
}

#[derive(Clone, Copy, Debug, Default, Deserialize, Serialize)]
pub struct Normal {
    pub x: f32,
    pub y: f32,
    pub z: f32,
}

#[derive(Clone, Copy, Debug, Default, Deserialize, Serialize)]
pub struct Vertex {
    pub x: f32,
    pub y: f32,
    pub z: f32,
}

#[derive(Clone, Debug, Default, Deserialize, Serialize)]
pub struct UvMap {
    pub name: String,
    pub file_name: String,
    pub coordinates: Vec<TextureCoordinate>,
}

#[derive(Clone, Copy, Debug, Default, Deserialize, Serialize)]
pub struct TextureCoordinate {
    pub u: f32,
    pub v: f32,
}

impl PartialEq for TextureCoordinate {
    fn eq(&self, other: &Self) -> bool {
        self.u == other.u && self.v == other.v
    }
}

impl PartialEq for UvMap {
    fn eq(&self, other: &Self) -> bool {
        self.name == other.name
            && self.file_name == other.file_name
            && self.coordinates == other.coordinates
    }
}

impl PartialEq for Vertex {
    fn eq(&self, other: &Self) -> bool {
        self.x == other.x && self.y == other.y && self.z == other.z
    }
}

struct InterleavedWriter<'a> {
    data: &'a mut Vec<u8>,
    byte_count: usize,
    offset: usize,
}

impl<'a> InterleavedWriter<'a> {
    pub fn new(data: &'a mut Vec<u8>, byte_count: usize) -> InterleavedWriter<'a> {
        InterleavedWriter {
            data,
            byte_count,
            // TODO figure out why we need to use 3 here to pretend like it is opposite endian
            offset: 3,
        }
    }
}

impl<'a> io::Write for InterleavedWriter<'a> {
    fn write(&mut self, buf: &[u8]) -> Result<usize, io::Error> {
        for val in buf {
            self.data[self.offset] = *val;
            self.offset += self.byte_count;
            if self.offset >= self.data.len() {
                self.offset -= self.data.len() - 4;
                if self.offset > self.byte_count {
                    self.offset -= self.byte_count + 1;
                }
            }
        }
        Ok(buf.len())
    }

    fn flush(&mut self) -> Result<(), io::Error> {
        Ok(())
    }
}

pub trait ReadExt: io::Read {
    fn read_ctm_string(&mut self) -> Result<String, Error> {
        let result_length = self.read_i32::<LittleEndian>()?;
        let mut result = vec![0; result_length as usize];
        self.read_exact(&mut result)?;
        Ok(str::from_utf8(&result)?.to_string())
    }

    fn read_packed_data(
        &mut self,
        unpacked_size: usize,
        interleaved_byte_count: usize,
    ) -> Result<Vec<u8>, Error> {
        let packed_data_size = self.read_i32::<LittleEndian>()? as usize;
        let packed_data_size_with_header = packed_data_size + LZMA_HEADER_SIZE;

        // TODO do not read the data first, just give a view to the input
        let mut packed_data = vec![0 as u8; packed_data_size_with_header];
        self.read_exact(&mut packed_data)?;

        let mut cursor = io::Cursor::new(packed_data);

        let mut decomp = vec![0 as u8; unpacked_size];
        let mut writer = InterleavedWriter::new(&mut decomp, interleaved_byte_count);
        lzma_rs::lzma_decompress_with_options(
            &mut cursor,
            &mut writer,
            &lzma_rs::decompress::Options {
                unpacked_size: lzma_rs::decompress::UnpackedSize::UseProvided(Some(
                    unpacked_size as u64,
                )),
            },
        )?;
        Ok(decomp)
    }
}

impl<T: io::Read> ReadExt for T {}

pub fn parse(mut input: impl io::BufRead) -> Result<File, Error> {
    {
        let mut magic_bytes = [0 as u8; 4];
        input.read_exact(&mut magic_bytes)?;
        // TODO do not assert, but return Error instead
        assert_eq!(b"OCTM", &magic_bytes);
    }

    let file_format = input.read_i32::<LittleEndian>()?;
    if file_format != 5 {
        return Err(error!(
            "Unexpected OpenCTM format version. Expected 5, got {}",
            file_format
        ));
    }
    let compression_method = input.read_i32::<LittleEndian>()?;
    let vertex_count = input.read_i32::<LittleEndian>()? as usize;
    let triangle_count = input.read_i32::<LittleEndian>()? as usize;
    let uv_map_count = input.read_i32::<LittleEndian>()?;
    let attribute_map_count = input.read_i32::<LittleEndian>()?;
    if attribute_map_count != 0 {
        unimplemented!();
    }
    let flags = input.read_i32::<LittleEndian>()?;
    let comment_length = input.read_i32::<LittleEndian>()?;
    let mut comment = vec![0; comment_length as usize];
    input.read_exact(&mut comment)?;

    let has_normals = (flags & 0x0000_0001) == 0x0000_0001;

    match num::FromPrimitive::from_i32(compression_method) {
        Some(CompressionMethod::MG1) => {}
        Some(_) => return Err(error!("Compression method not yet implemented")), // TODO replace with Result
        None => return Err(error!("Unknown compression method")), // TODO replace with Result
    };

    let indices = {
        let mut magic_bytes = [0 as u8; 4];
        input.read_exact(&mut magic_bytes)?;
        assert_eq!(b"INDX", &magic_bytes);

        let index_count = 3 * triangle_count;
        let decomp = input.read_packed_data(4 * index_count, 3 * 4)?;

        let mut indices = vec![Default::default(); index_count];
        let mut rdr = io::Cursor::new(decomp);
        rdr.read_u32_into::<LittleEndian>(&mut indices)?;

        indices[1] += indices[0]; // i_(k, 2) + i_(k, 1)
        indices[2] += indices[0]; // i_(k, 3) + i_(k, 1)

        for i in (3..indices.len()).step_by(3) {
            indices[i] += indices[i - 3];
            if indices[i] == indices[i - 3] {
                indices[i + 1] += indices[i - 3 + 1]; // i_(k, 2) + i_(k-1, 2)
            } else {
                indices[i + 1] += indices[i]; // i_(k, 2) + i_(k, 1)
            }

            indices[i + 2] += indices[i]; // i_(k, 3) + i_(k, 1)
        }

        let mut triangles = vec![Default::default(); triangle_count];
        for i in 0..triangle_count {
            triangles[i] = Triangle {
                a: indices[3 * i],
                b: indices[3 * i + 1],
                c: indices[3 * i + 2],
            }
        }
        indices
    };

    let vertices = {
        let mut magic_bytes = [0 as u8; 4];
        input.read_exact(&mut magic_bytes)?;
        assert_eq!(b"VERT", &magic_bytes);

        let component_count = vertex_count * 3;
        let decomp = input.read_packed_data(4 * component_count, 4)?;

        let mut components = vec![Default::default(); component_count];
        let mut rdr = io::Cursor::new(decomp);
        rdr.read_f32_into::<LittleEndian>(&mut components)?;

        let mut vertices = vec![Default::default(); vertex_count];
        for i in 0..vertex_count {
            vertices[i] = Vertex {
                x: components[3 * i],
                y: components[3 * i + 1],
                z: components[3 * i + 2],
            }
        }
        vertices
    };

    let normals = if !has_normals {
        None
    } else {
        let mut magic_bytes = [0 as u8; 4];
        input.read_exact(&mut magic_bytes)?;
        assert_eq!(b"NORM", &magic_bytes);

        let component_count = vertex_count * 3;

        let decomp = input.read_packed_data(4 * component_count, 4)?;

        let mut components = vec![Default::default(); component_count];
        let mut rdr = io::Cursor::new(decomp);
        rdr.read_f32_into::<LittleEndian>(&mut components)?;

        let mut normals = vec![Default::default(); vertex_count];
        for i in 0..vertex_count {
            normals[i] = Normal {
                x: components[3 * i],
                y: components[3 * i + 1],
                z: components[3 * i + 2],
            }
        }
        Some(normals)
    };

    let uv_maps = {
        let mut uv_maps = Vec::new();
        for _ in 0..uv_map_count {
            let mut magic_bytes = [0 as u8; 4];
            input.read_exact(&mut magic_bytes)?;
            assert_eq!(b"TEXC", &magic_bytes);

            let name = input.read_ctm_string()?;
            let file_name = input.read_ctm_string()?;

            let component_count = vertex_count * 2;

            let decomp = input.read_packed_data(4 * component_count, 4)?;

            let mut components = vec![Default::default(); component_count];
            let mut rdr = io::Cursor::new(decomp);
            rdr.read_f32_into::<LittleEndian>(&mut components)?;

            let mut coordinates = vec![Default::default(); vertex_count];
            for i in 0..vertex_count {
                coordinates[i] = TextureCoordinate {
                    u: components[2 * i],
                    v: components[2 * i + 1],
                }
            }

            uv_maps.push(UvMap {
                name,
                file_name,
                coordinates,
            });
        }
        uv_maps
    };

    let mut buffer = vec![];
    input.read_to_end(&mut buffer)?;

    Ok(File {
        indices,
        vertices,
        normals,
        uv_maps,
    })
}
