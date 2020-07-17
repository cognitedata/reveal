use byteorder::{LittleEndian, ReadBytesExt};
use num_derive::FromPrimitive;
use serde::{Deserialize, Serialize};
use std::{io, str};

#[macro_use]
pub mod error;

use error::Error;

// The header size is usually 9 bytes in LZMA, but because OpenCTM deduces the unpacked size in
// a non-standard way, the unpacked size is removed from the header
const LZMA_HEADER_SIZE: usize = 5;

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct File {
    pub indices: Vec<u32>,
    pub vertex_components: Vec<f32>,
    pub normal_components: Option<Vec<f32>>,
    pub uv_maps: Vec<UvMap>,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct OpenCTMHeader {
    pub magic_bytes: [u8; 4],
    pub file_format: i32,
    pub compression_method: CompressionMethod,
    pub vertex_count: u32,
    pub triangle_count: u32,
    pub uv_map_count: u32,
    pub attribute_map_count: u32,
    pub flags: u32,
    pub comment: String,
}

#[derive(Clone, Copy, Debug, FromPrimitive, Deserialize, Serialize)]
pub enum CompressionMethod {
    RAW = 0x0057_4152,
    MG1 = 0x0031_474d,
    MG2 = 0x0032_474d,
}

#[repr(C)]
#[derive(Clone, Copy, Debug, Default, Deserialize, Serialize)]
pub struct Normal {
    pub x: f32,
    pub y: f32,
    pub z: f32,
}

#[repr(C)]
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

#[repr(C)]
#[derive(Clone, Copy, Debug, Default, Deserialize, Serialize)]
pub struct TextureCoordinate {
    pub u: f32,
    pub v: f32,
}

#[derive(Clone, Copy, Debug, Default)]
struct Bound {
    pub x: f32,
    pub y: f32,
    pub z: f32,
}

#[derive(Clone, Copy, Debug, Default)]
struct MG2Header {
    pub vertex_precision: f32,
    pub normal_precision: f32,
    pub lower_bound: Bound,
    pub upper_bound: Bound,
    pub div_x: u32,
    pub div_y: u32,
    pub div_z: u32,
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

    fn read_packed_u32s(
        &mut self,
        element_count: usize,
        interleaved_byte_count: usize,
    ) -> Result<Vec<u32>, Error> {
        let decomp = self.read_packed_data(element_count * 4, interleaved_byte_count)?;
        let mut ints = vec![Default::default(); element_count];
        let mut rdr = io::Cursor::new(decomp);

        rdr.read_u32_into::<LittleEndian>(&mut ints)?;
        Ok(ints)
    }

    fn read_packed_f32s(
        &mut self,
        element_count: usize,
        interleaved_byte_count: usize,
    ) -> Result<Vec<f32>, Error> {
        let decomp = self.read_packed_data(element_count * 4, interleaved_byte_count)?;
        let mut floats = vec![Default::default(); element_count];
        let mut rdr = io::Cursor::new(decomp);

        rdr.read_f32_into::<LittleEndian>(&mut floats)?;
        Ok(floats)
    }

    fn read_magic_bytes(&mut self, magic_bytes: &[u8; 4]) -> Result<[u8; 4], Error> {
        let mut bytes = [0 as u8; 4];
        self.read_exact(&mut bytes)?;
        if magic_bytes == &bytes {
            Ok(bytes)
        } else {
            Err(Error::new(format!(
                "Expected magic bytes {} but got {}",
                std::str::from_utf8(magic_bytes)?,
                std::str::from_utf8(&bytes)?
            )))
        }
    }
}

impl<T: io::Read> ReadExt for T {}

impl File {
    pub fn number_of_vertices(&self) -> usize {
        self.vertex_components.len() / 3
    }

    pub fn number_of_normals(&self) -> usize {
        match &self.normal_components {
            Some(x) => x.len() / 3,
            None => 0,
        }
    }

    pub fn get_vertices(&self) -> Vec<Vertex> {
        let n_vertices = self.number_of_vertices();
        let mut vertices: Vec<Vertex> = vec![Default::default(); n_vertices];
        for (i, vertex) in vertices.iter_mut().enumerate() {
            vertex.x = self.vertex_components[3 * i];
            vertex.y = self.vertex_components[3 * i + 1];
            vertex.z = self.vertex_components[3 * i + 2];
        }
        vertices
    }

    pub fn get_normals(&self) -> Option<Vec<Normal>> {
        let normal_components = self.normal_components.as_ref()?;
        let n_normals = self.number_of_normals();
        let mut normals: Vec<Normal> = vec![Default::default(); n_normals];
        for (i, normal) in normals.iter_mut().enumerate() {
            normal.x = normal_components[3 * i];
            normal.y = normal_components[3 * i + 1];
            normal.z = normal_components[3 * i + 2];
        }
        Some(normals)
    }
}

impl OpenCTMHeader {
    pub fn has_normals(&self) -> bool {
        (self.flags & 0x0000_0001) == 0x0000_0001
    }
}

impl MG2Header {
    pub fn size_x(&self) -> f32 {
        (self.upper_bound.x - self.lower_bound.x) / (self.div_x as f32)
    }
    pub fn size_y(&self) -> f32 {
        (self.upper_bound.y - self.lower_bound.y) / (self.div_y as f32)
    }
    pub fn size_z(&self) -> f32 {
        (self.upper_bound.z - self.lower_bound.z) / (self.div_z as f32)
    }
}

fn restore_indices(indices: &mut Vec<u32>) {
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
}

fn parse_triangle_indices(
    mut input: impl io::BufRead,
    triangle_count: u32,
) -> Result<Vec<u32>, Error> {
    input.read_magic_bytes(b"INDX")?;

    let triangle_count = triangle_count as usize;
    let index_count = 3 * triangle_count;

    let mut indices = input.read_packed_u32s(index_count, 3 * 4)?;
    restore_indices(&mut indices);

    Ok(indices)
}

fn parse_mg1(header: &OpenCTMHeader, mut input: impl io::BufRead) -> Result<File, Error> {
    let indices = parse_triangle_indices(&mut input, header.triangle_count)?;

    let vertex_count = header.vertex_count as usize;
    let vertex_components = {
        input.read_magic_bytes(b"VERT")?;
        let component_count = vertex_count * 3;
        input.read_packed_f32s(component_count, 4)?
    };

    let normal_components = if !header.has_normals() {
        None
    } else {
        input.read_magic_bytes(b"NORM")?;

        let component_count = vertex_count * 3;
        let components = input.read_packed_f32s(component_count, 4)?;
        Some(components)
    };

    let uv_maps = {
        let uv_map_count = header.uv_map_count as usize;
        let mut uv_maps = Vec::new();
        for _ in 0..uv_map_count {
            input.read_magic_bytes(b"TEXC")?;

            let name = input.read_ctm_string()?;
            let file_name = input.read_ctm_string()?;

            let component_count = vertex_count * 2;
            let components = input.read_packed_f32s(component_count, 4)?;

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
        vertex_components,
        normal_components,
        uv_maps,
    })
}

fn restore_grid_indices(grid_indices: &mut Vec<u32>) {
    for i in 1..grid_indices.len() {
        grid_indices[i] += grid_indices[i - 1];
    }
}

fn restore_vertices(
    int_vertex_components: &[u32],
    vertex_count: usize,
    grid_indices: &[u32],
    mg2_header: &MG2Header,
) -> Vec<f32> {
    let vertex_precision = mg2_header.vertex_precision;
    let y_div = mg2_header.div_x;
    let z_div = y_div * mg2_header.div_y;
    let size_x = mg2_header.size_x();
    let size_y = mg2_header.size_y();
    let size_z = mg2_header.size_z();

    let mut prev_grid_index = 0x7fffffff;
    let mut prev_delta_x = 0;

    let component_count = vertex_count * 3;
    let mut vertices: Vec<f32> = vec![Default::default(); component_count];
    for (i, &grid_index) in grid_indices.iter().enumerate().take(vertex_count) {
        let mut idx = grid_index;
        let z: u32 = idx / z_div;
        idx -= z * z_div;
        let y: u32 = idx / y_div;
        idx -= y * y_div;
        let x: u32 = idx;

        let lower_bound = mg2_header.lower_bound;
        let grid_x = x as f32 * size_x + lower_bound.x;
        let grid_y = y as f32 * size_y + lower_bound.y;
        let grid_z = z as f32 * size_z + lower_bound.z;

        let j = 3 * i;
        let mut delta_x = int_vertex_components[j];
        if grid_index == prev_grid_index {
            delta_x += prev_delta_x;
        }

        vertices[j] = vertex_precision * delta_x as f32 + grid_x;
        vertices[j + 1] = vertex_precision * int_vertex_components[j + 1] as f32 + grid_y;
        vertices[j + 2] = vertex_precision * int_vertex_components[j + 2] as f32 + grid_z;

        prev_grid_index = grid_index;
        prev_delta_x = delta_x;
    }
    vertices
}

fn parse_mg2(header: &OpenCTMHeader, mut input: impl io::BufRead) -> Result<File, Error> {
    let mg2_header = {
        input.read_magic_bytes(b"MG2H")?;
        let vertex_precision = input.read_f32::<LittleEndian>()?;
        let normal_precision = input.read_f32::<LittleEndian>()?;
        let lower_bound = Bound {
            x: input.read_f32::<LittleEndian>()?,
            y: input.read_f32::<LittleEndian>()?,
            z: input.read_f32::<LittleEndian>()?,
        };
        let upper_bound = Bound {
            x: input.read_f32::<LittleEndian>()?,
            y: input.read_f32::<LittleEndian>()?,
            z: input.read_f32::<LittleEndian>()?,
        };
        let div_x = input.read_u32::<LittleEndian>()?;
        let div_y = input.read_u32::<LittleEndian>()?;
        let div_z = input.read_u32::<LittleEndian>()?;

        MG2Header {
            vertex_precision,
            normal_precision,
            lower_bound,
            upper_bound,
            div_x,
            div_y,
            div_z,
        }
    };

    let vertex_count = header.vertex_count as usize;

    let int_vertex_components = {
        input.read_magic_bytes(b"VERT")?;

        let component_count = vertex_count * 3;
        input.read_packed_u32s(component_count, 3 * 4)?
    };

    let grid_indices = {
        input.read_magic_bytes(b"GIDX")?;

        let mut grid_indices = input.read_packed_u32s(vertex_count, 4)?;
        restore_grid_indices(&mut grid_indices);

        grid_indices
    };
    let vertices = restore_vertices(
        &int_vertex_components,
        vertex_count,
        &grid_indices,
        &mg2_header,
    );
    let indices = parse_triangle_indices(&mut input, header.triangle_count)?;

    let normal_components = None; // TODO

    let uv_maps = vec![]; // TODO

    Ok(File {
        indices,
        vertex_components: vertices,
        normal_components,
        uv_maps,
    })
}

pub fn parse(mut input: impl io::BufRead) -> Result<File, Error> {
    let magic_bytes = input.read_magic_bytes(b"OCTM")?;

    let file_format = input.read_i32::<LittleEndian>()?;
    if file_format != 5 {
        return Err(error!(
            "Unexpected OpenCTM format version. Expected 5, got {}",
            file_format
        ));
    }
    let compression_method: CompressionMethod =
        match num::FromPrimitive::from_i32(input.read_i32::<LittleEndian>()?) {
            Some(x) => x,
            None => return Err(error!("Unknown OpenCTM compression method")),
        };
    let vertex_count = input.read_u32::<LittleEndian>()?;
    let triangle_count = input.read_u32::<LittleEndian>()?;
    let uv_map_count = input.read_u32::<LittleEndian>()?;
    let attribute_map_count = input.read_u32::<LittleEndian>()?;
    let flags = input.read_u32::<LittleEndian>()?;
    let comment = input.read_ctm_string()?;

    let header = OpenCTMHeader {
        magic_bytes,
        file_format,
        compression_method,
        vertex_count,
        triangle_count,
        uv_map_count,
        attribute_map_count,
        flags,
        comment,
    };

    if attribute_map_count != 0 {
        return Err(Error::new(format!(
            "Attribute maps not implemented. This file contains {} attribute maps",
            attribute_map_count
        )));
    }

    match compression_method {
        CompressionMethod::MG1 => parse_mg1(&header, input),
        CompressionMethod::MG2 => parse_mg2(&header, input),
        CompressionMethod::RAW => Err(error!("RAW compression method not yet implemented")),
    }
}
