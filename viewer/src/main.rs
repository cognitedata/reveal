use cgmath::*;
use clap::clap_app;
use i3df;
use log::info;
use nalgebra;
use nalgebra_glm as glm;
use serde::{Deserialize, Serialize};
use openctm;
use std::collections::HashMap;
use std::error::Error;
use std::fs::File;
use std::io::prelude::*;
use std::io::{BufRead, BufReader};
use std::mem;
use std::ops;
use std::path::Path;
use wgpu::winit::{
    dpi::LogicalSize, VirtualKeyCode, WindowBuilder,
    dpi::LogicalPosition, ElementState, Event, EventsLoop, KeyboardInput, MouseButton,
    WindowEvent, MouseScrollDelta
};
use byteorder::{LittleEndian, ReadBytesExt};
use imgui::*;
use imgui_wgpu::Renderer;
use imgui_winit_support;
use std::time::Instant;
use wgpu::winit::{
};

#[cfg_attr(rustfmt, rustfmt_skip)]
pub const OPENGL_TO_WGPU_MATRIX: cgmath::Matrix4<f32> = cgmath::Matrix4::new(
    1.0, 0.0, 0.0, 0.0,
    0.0, -1.0, 0.0, 0.0,
    0.0, 0.0, 0.5, 0.0,
    0.0, 0.0, 0.5, 1.0,
);

#[allow(dead_code)]
pub fn cast_slice<T>(data: &[T]) -> &[u8] {
    use std::mem::size_of;
    use std::slice::from_raw_parts;

    unsafe { from_raw_parts(data.as_ptr() as *const u8, data.len() * size_of::<T>()) }
}

#[allow(dead_code)]
pub enum ShaderStage {
    Vertex,
    Fragment,
    Compute,
}

pub fn load_glsl(code: &str, stage: ShaderStage) -> Vec<u8> {
    use std::io::Read;

    let ty = match stage {
        ShaderStage::Vertex => glsl_to_spirv::ShaderType::Vertex,
        ShaderStage::Fragment => glsl_to_spirv::ShaderType::Fragment,
        ShaderStage::Compute => glsl_to_spirv::ShaderType::Compute,
    };

    let mut output = glsl_to_spirv::compile(&code, ty).unwrap();
    let mut spv = Vec::new();
    output.read_to_end(&mut spv).unwrap();
    spv
}

#[derive(Clone, Copy)]
struct Vertex {
    _pos: [f32; 4],
    _tex_coord: [f32; 2],
}

#[derive(Clone, Copy)]
struct Instance {
    _pos: [f32; 3],
    _delta: [f32; 3],
    _color: [f32; 3],
    _matrix: cgmath::Matrix4<f32>,
}

struct Boxes {
    vertex_buf: wgpu::Buffer,
    index_buf: wgpu::Buffer,
    index_count: usize,
    instance_buf: wgpu::Buffer,
    instance_count: usize,
}

struct Mesh {
    file_id: u64,
    index_range: core::ops::Range<u32>,
}

struct InstancedMesh<'a> {
    indices: Vec<u32>,
    vertices: Vec<openctm::Vertex>,
    colors: Vec<[f32; 3]>,
    vertex_buf: &'a wgpu::Buffer,
    index_buf: &'a wgpu::Buffer,
    index_range: core::ops::Range<u32>,
    instances: Vec<InstancedMeshInstance>,
}

struct LoadedInstancedMesh {
    vertex_buf: wgpu::Buffer,
    color_buf: wgpu::Buffer,
    index_buf: wgpu::Buffer,
    index_count: usize,
    instance_buf: wgpu::Buffer,
    instance_count: usize,
}

// TODO split into one version with the vertices and indices and one with the buffers
struct CtmData {
    indices: Vec<u32>,
    vertices: Vec<openctm::Vertex>,
    vertex_buf: wgpu::Buffer,
    index_buf: wgpu::Buffer,
}

struct SectorTreeNode {
    id: u64,
    parent: Option<u64>,
    children: Vec<u64>,
}

struct SectorTree {
    root: u64,
    nodes: HashMap<u64, SectorTreeNode>,
}

#[derive(Clone, Copy)]
struct Face {
    _color: [f32; 3],
    _normal: cgmath::Vector3<f32>,
    _matrix: cgmath::Matrix4<f32>,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "PascalCase")]
struct ParentId {
    value: u64,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "PascalCase")]
struct UploadedSector {
    sector_id: u64,
    parent_id: Option<ParentId>,
    files: HashMap<u64, u64>,
    depth: u64,
}

#[derive(Debug)]
struct Sector {
    i3df_filename: String,
    f3df_filename: String,
    sector_id: u64,
    parent_id: Option<u64>,
    depth: u64,
}

struct DrawableSector {
    sector_id: u64,
    faces: Boxes,
    primitives: Boxes,
    meshes: Vec<Mesh>,
    instanced_meshes: Vec<LoadedInstancedMesh>,
    triangle_mesh_color_bufs: HashMap::<u64, wgpu::Buffer>,
}

// TODO rename, please
#[derive(Clone, Copy)]
struct InstancedMeshInstance {
    matrix: cgmath::Matrix4<f32>,
}

fn vertex(pos: [f32; 3], tc: [i8; 2]) -> Vertex {
    Vertex {
        _pos: [pos[0] as f32, pos[1] as f32, pos[2] as f32, 1.0],
        _tex_coord: [tc[0] as f32, tc[1] as f32],
    }
}

fn create_depth_texture(device: &mut wgpu::Device, width: u32, height: u32) -> wgpu::TextureView {
    let depth_texture = device.create_texture(&wgpu::TextureDescriptor {
        size: wgpu::Extent3d {
            width: width,
            height: height,
            depth: 1,
        },
        array_layer_count: 1,
        mip_level_count: 1,
        sample_count: 1,
        dimension: wgpu::TextureDimension::D2,
        format: wgpu::TextureFormat::D32Float,
        usage: wgpu::TextureUsage::OUTPUT_ATTACHMENT,
    });
    depth_texture.create_default_view()
}

fn create_vertices() -> (Vec<Vertex>, Vec<u16>) {
    let vertex_data = [
        // top (0, 0, 1)
        vertex([-0.5, -0.5, 0.5], [0, 0]),
        vertex([0.5, -0.5, 0.5], [1, 0]),
        vertex([0.5, 0.5, 0.5], [1, 1]),
        vertex([-0.5, 0.5, 0.5], [0, 1]),
        // bottom (0, 0, -1)
        vertex([-0.5, 0.5, -0.5], [1, 0]),
        vertex([0.5, 0.5, -0.5], [0, 0]),
        vertex([0.5, -0.5, -0.5], [0, 1]),
        vertex([-0.5, -0.5, -0.5], [1, 1]),
        // right (1, 0, 0)
        vertex([0.5, -0.5, -0.5], [0, 0]),
        vertex([0.5, 0.5, -0.5], [1, 0]),
        vertex([0.5, 0.5, 0.5], [1, 1]),
        vertex([0.5, -0.5, 0.5], [0, 1]),
        // left (-1, 0, 0)
        vertex([-0.5, -0.5, 0.5], [1, 0]),
        vertex([-0.5, 0.5, 0.5], [0, 0]),
        vertex([-0.5, 0.5, -0.5], [0, 1]),
        vertex([-0.5, -0.5, -0.5], [1, 1]),
        // front (0, 1, 0)
        vertex([0.5, 0.5, -0.5], [1, 0]),
        vertex([-0.5, 0.5, -0.5], [0, 0]),
        vertex([-0.5, 0.5, 0.5], [0, 1]),
        vertex([0.5, 0.5, 0.5], [1, 1]),
        // back (0, -1, 0)
        vertex([0.5, -0.5, 0.5], [0, 0]),
        vertex([-0.5, -0.5, 0.5], [1, 0]),
        vertex([-0.5, -0.5, -0.5], [1, 1]),
        vertex([0.5, -0.5, -0.5], [0, 1]),
    ];

    let index_data: &[u16] = &[
        0, 1, 2, 2, 3, 0, // top
        4, 5, 6, 6, 7, 4, // bottom
        8, 9, 10, 10, 11, 8, // right
        12, 13, 14, 14, 15, 12, // left
        16, 17, 18, 18, 19, 16, // front
        20, 21, 22, 22, 23, 20, // back
    ];

    (vertex_data.to_vec(), index_data.to_vec())
}

fn create_texels(size: usize) -> Vec<u8> {
    use std::iter;

    (0..size * size)
        .flat_map(|id| {
            iter::once((id / size) as u8)
                .chain(iter::once(0x00 as u8))
                .chain(iter::once(0xAA as u8))
                .chain(iter::once(1))
        })
        .collect()
}

fn generate_matrix(aspect_ratio: f32, yaw: f32, pitch: f32, view_length: f32, center: cgmath::Vector3<f32>) -> cgmath::Matrix4<f32> {
    let mx_projection = cgmath::perspective(cgmath::Deg(70f32), aspect_ratio, 1.0, 10000.0);
    let px = view_length * yaw.cos() * pitch.sin();
    let py = view_length * yaw.sin() * pitch.sin();
    let pz = view_length * pitch.cos();

    let x = center.x;
    let y = center.y;
    let z = center.z;

    //let x = 100.0;
    //let y = 70.0;
    //let z = 50.0;

    //let x = 400.0;
    //let y = 200.0;
    //let z = 520.0;

    //let x = 1000.0;
    //let y = 1500.0;
    //let z = 500.0;

    let mx_view = cgmath::Matrix4::look_at(
        cgmath::Point3::new(x + px, y + py, z + pz),
        cgmath::Point3::new(x, y, z),
        cgmath::Vector3::unit_z(),
    );

    let mx_correction = OPENGL_TO_WGPU_MATRIX;

    mx_correction * mx_projection * mx_view
}

fn compose_matrix_trs(
    translation: &cgmath::Vector3<f32>,
    rotation: &cgmath::Vector3<f32>,
    scale: &cgmath::Vector3<f32>,
) -> cgmath::Matrix4<f32> {
    let translation_matrix = cgmath::Matrix4::from_translation(*translation);
    let scale_matrix = cgmath::Matrix4::from_nonuniform_scale(scale.x, scale.y, scale.z);
    let rotation_matrix_z = cgmath::Matrix4::from_angle_z(Rad(rotation.z));
    let rotation_matrix_y = cgmath::Matrix4::from_angle_y(Rad(rotation.y));
    let rotation_matrix_x = cgmath::Matrix4::from_angle_x(Rad(rotation.x));
    let rotation_matrix = rotation_matrix_z * rotation_matrix_y * rotation_matrix_x;

    translation_matrix * rotation_matrix * scale_matrix
}

fn compose_matrix(
    center: &cgmath::Vector3<f32>,
    scale: &cgmath::Vector3<f32>,
    normal: &cgmath::Vector3<f32>,
    angle: f32,
) -> cgmath::Matrix4<f32> {
    let rad_angle = cgmath::Rad(angle);
    let translation_matrix = cgmath::Matrix4::from_translation(*center);
    let scale_matrix = cgmath::Matrix4::from_nonuniform_scale(scale.x, scale.y, scale.z);
    let first_rotation = cgmath::Quaternion::from_angle_z(rad_angle);
    let second_rotation = cgmath::Quaternion::from_arc(cgmath::Vector3::unit_z(), *normal, None);
    let rotation_matrix = cgmath::Matrix4::from(second_rotation * first_rotation);

    translation_matrix * rotation_matrix * scale_matrix
}

fn compose_face_matrix(
    center: &cgmath::Vector3<f32>,
    offset: &cgmath::Vector3<f32>,
    scale: &cgmath::Vector3<f32>,
    normal: &cgmath::Vector3<f32>,
) -> cgmath::Matrix4<f32> {
    let translation_matrix = cgmath::Matrix4::from_translation(*center);
    let offset_matrix = cgmath::Matrix4::from_translation(*offset);
    let scale_matrix = cgmath::Matrix4::from_nonuniform_scale(scale.x, scale.y, scale.z);
    let rotation_matrix = cgmath::Matrix4::from(cgmath::Quaternion::from_arc(cgmath::Vector3::unit_z(), *normal, None));

    // NOTE rotation purposefully happens first to make the face point in the correct direction
    translation_matrix * scale_matrix * offset_matrix * rotation_matrix
}

fn create_face_vertices() -> (Vec<Vertex>, Vec<u16>) {
    let vertex_data = [
        vertex([-0.5, -0.5, 0.0], [0, 0]),
        vertex([0.5, -0.5, 0.0], [1, 0]),
        vertex([0.5, 0.5, 0.0], [1, 1]),
        vertex([-0.5, 0.5, 0.0], [0, 1]),
    ];

    let index_data: &[u16] = &[
        0, 1, 2, 2, 3, 0,
    ];

    (vertex_data.to_vec(), index_data.to_vec())
}

fn main() {
    run().unwrap();
}

fn run() -> Result<(), Box<dyn Error>> {
    let load_timer = std::time::Instant::now();
    println!("Started!");

    env_logger::init();

    let mut events_loop = EventsLoop::new();

    info!("Initializing the window...");

    let (window, instance, hidpi_factor, size, surface) = {
        use wgpu::winit::Window;

        let instance = wgpu::Instance::new();

        let window = Window::new(&events_loop).unwrap();
        window.set_title("Hello, world!");
        //window.set_inner_size(wgpu::winit::dpi::LogicalSize{ width: 1920.0, height: 1080.0});
        let hidpi_factor = window.get_hidpi_factor();
        let size = window.get_inner_size().unwrap().to_physical(hidpi_factor);

        let surface = instance.create_surface(&window);

        (window, instance, hidpi_factor, size, surface)
    };

    let adapter = instance.get_adapter(&wgpu::AdapterDescriptor {
        power_preference: wgpu::PowerPreference::LowPower,
    });

    let mut device = adapter.request_device(&wgpu::DeviceDescriptor {
        extensions: wgpu::Extensions {
            anisotropic_filtering: false,
        },
        limits: wgpu::Limits::default(),
    });

    let matches = clap_app!(("reveal-viewer") =>
        (@arg folder: +takes_value)
    )
    .get_matches();

    let folder = matches.value_of("folder").unwrap();
    let folder_path = Path::new(folder);
    let file_path = folder_path.join("web_scene_7.i3d");

    let uploaded_files = {
        let path = folder_path.join("uploaded_files.txt");
        let mut contents = String::new();
        File::open(path)?.read_to_string(&mut contents)?;
        let lines = contents.split("\n");
        let result: HashMap<u64, String> = lines
            .filter_map(|line| {
                let mut line_split = line.split_whitespace();
                let file_id = match line_split.next() {
                    Some(x) => x,
                    None => return None,
                };
                let file_id = match file_id.parse::<u64>() {
                    Ok(x) => x,
                    Err(_) => return None,
                };
                let filename = match line_split.next() {
                    Some(x) => x,
                    None => return None,
                };
                Some((file_id, filename.to_string()))
            })
            .collect();
        result
    };

    let uploaded_sectors = {
        let path = folder_path.join("uploaded_sectors.txt");
        let mut contents = String::new();
        File::open(path)?.read_to_string(&mut contents)?;
        let lines = contents.split("\n");
        let sectors: Vec<Sector> = lines
            .filter_map(|line| {
                let sector = match serde_json::from_str::<UploadedSector>(&line) {
                    Ok(sector) => sector,
                    Err(e) => {
                        println!("Parsing issue: {}", e);
                        return None;
                    }
                };
                let parent_id = match sector.parent_id {
                    Some(p) => Some(p.value),
                    None => None,
                };
                // TODO replace 5 with dynamic version
                let i3df_filename = uploaded_files[&sector.files[&7]].clone();
                let f3df_filename = uploaded_files[&sector.files[&7]].replace(".i3d", ".f3d");
                Some(Sector {
                    i3df_filename,
                    f3df_filename,
                    parent_id,
                    sector_id: sector.sector_id,
                    depth: sector.depth,
                })
            })
            .collect();

        sectors
    };

    let sector_tree = {
        let mut result = HashMap::<u64, SectorTreeNode>::new();
        let mut root = None;
        // TODO replace with map
        for sector in &uploaded_sectors {
            result.insert(sector.sector_id, SectorTreeNode {
                id: sector.sector_id,
                parent: sector.parent_id,
                children: Vec::new(),
            });
            if sector.parent_id == None {
                root = Some(sector.sector_id);
            }
        }
        // TODO replace with map
        for sector in &uploaded_sectors {
            match sector.parent_id {
                Some(parent) => result.get_mut(&parent).unwrap().children.push(sector.sector_id),
                None => {}
            }
        }
        SectorTree {
            root: root.unwrap(),
            nodes: result
        }
    };

    let mut children = vec![(0, sector_tree.root)];
    loop {
        let (depth, next) = match children.pop() {
            Some((depth, next)) => (depth, next),
            None => break,
        };
        let next = match sector_tree.nodes.get(&next) {
            Some(x) => x.clone(),
            None => break, // TODO make error
        };

        for i in 0..depth {
            print!(" ");
        }
        println!("- {}", next.id);

        for child in &next.children {
            children.push((depth + 1, *child));
        }
    }

    // TODO do this in the merged mesh loading
    let uploaded_files_path = folder_path.join("uploaded_files.txt");
    let mut uploaded_files = String::new();
    File::open(uploaded_files_path)?.read_to_string(&mut uploaded_files)?;

    let mut instanced_meshes: HashMap<String, InstancedMesh> = HashMap::new();
    let mut file_id_to_filename = HashMap::new();
    let mut ctm_cache = HashMap::new();

    for line in uploaded_files.split("\n") {
        let mut line_split = line.split_whitespace();
        let file_id = match line_split.next() {
            Some(x) => x,
            None => continue,
        }.parse::<u64>()?;
        let filename = match line_split.next() {
            Some(x) => x,
            None => continue,
        };

        file_id_to_filename.insert(file_id, filename);

        if !filename.starts_with("mesh_7") || !filename.ends_with(".ctm") {
            continue;
        }
        // TODO figure out what is wrong with these files
        if filename == "mesh_7_3_1.ctm" {
            continue;
        }
        if filename == "mesh_7_167_0.ctm" {
            continue;
        }
        if filename == "mesh_7_369_0.ctm" {
            continue;
        }
        if filename == "mesh_7_290_1.ctm" {
            continue;
        }
        if filename == "mesh_7_322_0.ctm" {
            continue;
        }
        println!("Loading {}", filename);
        // TODO move to mesh parsing below
        let reader = openctm::parse(std::io::BufReader::new(
            std::fs::File::open(folder_path.join(filename)).unwrap(),
        ))?;

        let (vertex_data, index_data) = (&reader.vertices, &reader.indices);
        let vertex_buf = device
            .create_buffer_mapped(vertex_data.len(), wgpu::BufferUsage::VERTEX)
            .fill_from_slice(&vertex_data);

        let index_buf = device
            .create_buffer_mapped(index_data.len(), wgpu::BufferUsage::INDEX)
            .fill_from_slice(&index_data);

        //meshes.push(Box::new(Mesh {
            //vertex_buf,
            //index_buf,
            //index_count: index_data.len(),
        //}));

        ctm_cache.insert(file_id, CtmData {
            indices: reader.indices,
            vertices: reader.vertices,
            vertex_buf,
            index_buf,
        });
    }

    let root_sector = {
        let i3df_path = folder_path.join("web_node_7_0.i3d");
        println!("Loading {:?}", &i3df_path);
        let mut reader = std::io::BufReader::new(File::open(i3df_path).unwrap());
        i3df::parse_root_sector(&mut reader).unwrap()
    };
    let attributes = root_sector.header.attributes.unwrap();

    let mut drawable_sectors: Vec<DrawableSector> = Vec::new();
    println!("Sector count: {}", uploaded_sectors.len());
    for sector in &uploaded_sectors {
        let sector_id = sector.sector_id;
        let f3df_path = folder_path.join(&sector.f3df_filename);
        println!("Loading {:?}", &f3df_path);
        let parsed_sector = f3df::parse_sector(File::open(&f3df_path)?)?;
        println!("Loaded {:?}", &f3df_path);
        let mut instance_data = Vec::new();
        let contents = match parsed_sector.sector_contents {
            Some(x) => x,
            None => continue,
        };
        let origin = contents.grid_origin;
        let cell_size = [
            (contents.grid_size[0] - 1) as u64,
            (contents.grid_size[1] - 1) as u64,
            (contents.grid_size[2] - 1) as u64,
        ];
        let cell_size_i_j = cell_size[0] * cell_size[1];
        let increment = contents.grid_increment;
        let origin = cgmath::Vector3::new(origin[0], origin[1], origin[2]);
        for node in &contents.nodes {
            let color = node.color;
            let compress_type = node.compress_type;
            for face in &node.faces {
                let cell_index = face.index as u64;
                let cell_index_i_j = cell_index % cell_size_i_j;
                let i = cell_index_i_j % (cell_size[0]);
                let j = cell_index_i_j / (cell_size[0]);
                let k = cell_index / (cell_size_i_j);
                let x = i as f32 + 0.5;
                let y = j as f32 + 0.5;
                let z = k as f32 + 0.5;

                //if x < 35.0 || x > 45.0 {
                    //continue;
                //}

                //println!("Node idx {:?} k {:?} z {:?}", cell_index, k, z);

                //assert_eq!(cell_index, i + j * cell_size[0] + k * cell_size_i_j);

                let center = cgmath::Vector3::new(
                    origin[0] + increment * x,
                    origin[1] + increment * y,
                    origin[2] + increment * z,
                );

                // TODO remove
                //if center.x < 348.0 || center.x > 350.0 {
                    //continue;
                //}
                //if center.y < 100.0 || center.y > 130.0 {
                    //continue;
                //}

                //let center = cell_center_from_index(face.index, &contents);
                let count = (face.repetitions as u32 + 1) as f32;
                //let count = 1.0; // TODO remove
                if face
                    .face_flags
                    .intersects(f3df::FaceFlags::POSITIVE_X_VISIBLE)
                {
                    let offset = cgmath::Vector3::new(1.0, 0.5, 0.5);
                    let normal = cgmath::Vector3::new(1.0, 0.0, 0.0);
                    let scale = if compress_type.intersects(f3df::CompressFlags::POSITIVE_X_REPEAT_Y) {
                        cgmath::Vector3::new(increment, increment, count * increment)
                    } else {
                        cgmath::Vector3::new(increment, count * increment, increment)
                    };
                    instance_data.push(Face {
                        _color: [
                            color[0] as f32 / 255.0,
                            color[1] as f32 / 255.0,
                            color[2] as f32 / 255.0,
                        ],
                        _normal: normal,
                        _matrix: compose_face_matrix(&center, &offset, &scale, &normal),
                    });
                }
                if face
                    .face_flags
                    .intersects(f3df::FaceFlags::POSITIVE_Y_VISIBLE)
                {
                    let offset = cgmath::Vector3::new(0.5, 1.0, 0.5);
                    let normal = cgmath::Vector3::new(0.0, 1.0, 0.0);
                    let scale = if compress_type.intersects(f3df::CompressFlags::POSITIVE_Y_REPEAT_X) {
                        cgmath::Vector3::new(increment, increment, count * increment)
                    } else {
                        cgmath::Vector3::new(count * increment, increment, increment)
                    };
                    instance_data.push(Face {
                        _color: [
                            color[0] as f32 / 255.0,
                            color[1] as f32 / 255.0,
                            color[2] as f32 / 255.0,
                        ],
                        _normal: normal,
                        _matrix: compose_face_matrix(&center, &offset, &scale, &normal),
                    });
                }
                if face
                    .face_flags
                    .intersects(f3df::FaceFlags::POSITIVE_Z_VISIBLE)
                {
                    let offset = cgmath::Vector3::new(0.5, 0.5, 1.0);
                    let normal = cgmath::Vector3::new(0.0, 0.0, 1.0);
                    let scale = if compress_type.intersects(f3df::CompressFlags::POSITIVE_Z_REPEAT_X) {
                        cgmath::Vector3::new(increment, count * increment, increment)
                    } else {
                        cgmath::Vector3::new(count * increment, increment, increment)
                    };
                    instance_data.push(Face {
                        _color: [
                            color[0] as f32 / 255.0,
                            color[1] as f32 / 255.0,
                            color[2] as f32 / 255.0,
                        ],
                        _normal: normal,
                        _matrix: compose_face_matrix(&center, &offset, &scale, &normal),
                    });
                }
                if face
                    .face_flags
                    .intersects(f3df::FaceFlags::NEGATIVE_X_VISIBLE)
                {
                    let offset = cgmath::Vector3::new(0.0, 0.5, 0.5);
                    let normal = cgmath::Vector3::new(-1.0, 0.0, 0.0);
                    let scale = if compress_type.intersects(f3df::CompressFlags::NEGATIVE_X_REPEAT_Y) {
                        cgmath::Vector3::new(increment, increment, count * increment)
                    } else {
                        cgmath::Vector3::new(increment, count * increment, increment)
                    };
                    instance_data.push(Face {
                        _color: [
                            color[0] as f32 / 255.0,
                            color[1] as f32 / 255.0,
                            color[2] as f32 / 255.0,
                        ],
                        _normal: normal,
                        _matrix: compose_face_matrix(&center, &offset, &scale, &normal),
                    });
                }
                if face
                    .face_flags
                    .intersects(f3df::FaceFlags::NEGATIVE_Y_VISIBLE)
                {
                    let offset = cgmath::Vector3::new(0.5, 0.0, 0.5);
                    let normal = cgmath::Vector3::new(0.0, -1.0, 0.0);
                    let scale = if compress_type.intersects(f3df::CompressFlags::NEGATIVE_Y_REPEAT_X) {
                        cgmath::Vector3::new(increment, increment, count * increment)
                    } else {
                        cgmath::Vector3::new(increment * count, increment, increment)
                    };
                    instance_data.push(Face {
                        _color: [
                            color[0] as f32 / 255.0,
                            color[1] as f32 / 255.0,
                            color[2] as f32 / 255.0,
                        ],
                        _normal: normal,
                        _matrix: compose_face_matrix(&center, &offset, &scale, &normal),
                    });
                }
                if face
                    .face_flags
                    .intersects(f3df::FaceFlags::NEGATIVE_Z_VISIBLE)
                {
                    let offset = cgmath::Vector3::new(0.5, 0.5, 0.0);
                    let normal = cgmath::Vector3::new(0.0, 0.0, -1.0);
                    let scale = if compress_type.intersects(f3df::CompressFlags::NEGATIVE_Z_REPEAT_X) {
                        cgmath::Vector3::new(increment, count * increment, increment)
                    } else {
                        cgmath::Vector3::new(increment * count, increment, increment)
                    };
                    instance_data.push(Face {
                        _color: [
                            color[0] as f32 / 255.0,
                            color[1] as f32 / 255.0,
                            color[2] as f32 / 255.0,
                        ],
                        _normal: normal,
                        _matrix: compose_face_matrix(&center, &offset, &scale, &normal),
                    });
                }
            }
        }

        let faces = {
            // Prepare for the GPU
            let (vertex_data, index_data) = create_face_vertices();
            let vertex_buf = device
                .create_buffer_mapped(vertex_data.len(), wgpu::BufferUsage::VERTEX)
                .fill_from_slice(&vertex_data);

            let index_buf = device
                .create_buffer_mapped(index_data.len(), wgpu::BufferUsage::INDEX)
                .fill_from_slice(&index_data);

            let instance_buf = device
                .create_buffer_mapped(instance_data.len(), wgpu::BufferUsage::VERTEX)
                .fill_from_slice(&instance_data);

            Boxes {
                vertex_buf,
                index_buf,
                index_count: index_data.len(),
                instance_buf: instance_buf,
                instance_count: instance_data.len(),
            }
        };

        // I3DF
        println!("Parsing I3DF");

        let i3df_path = folder_path.join(&sector.i3df_filename);
        println!("Loading {:?}", &i3df_path);
        let mut reader = std::io::BufReader::new(File::open(i3df_path).unwrap());
        let i3df_sector = i3df::parse_sector(&mut reader, &attributes).unwrap();

        // TODO fix this so it is not necessary
        //let i3df_sector = i3df::Sector {
            //scene_data: &dummy_scene_data,
            //sector_data: &i3df_sector_data,
        //};

        println!("Loading data from I3DF");

        let mut triangle_mesh_colors = HashMap::<u64, Vec<[f32; 3]>>::new();
        let mut triangle_mesh_offsets = HashMap::<u64, u64>::new();
        let mut meshes = Vec::new();
        let mut boxes_instance_data: Vec<Instance> = Vec::new();
        let mut instance_mesh_merged_vertex_data: Vec<openctm::Vertex> = Vec::new();
        let mut instance_mesh_merged_index_data: Vec<u32> = Vec::new();
        let mut instance_mesh_merged_color_data: Vec<[f32; 3]> = Vec::new();
        for item in i3df_sector.primitive_collections.box_collection {
            let color = item.color;
            let center_x = item.center_x;
            let center_y = item.center_y;
            let center_z = item.center_z;
            let delta_x = item.delta_x;
            let delta_y = item.delta_y;
            let delta_z = item.delta_z;
            let center = cgmath::Vector3 {
                x: center_x,
                y: center_y,
                z: center_z,
            };
            let scale = cgmath::Vector3 {
                x: delta_x,
                y: delta_y,
                z: delta_z,
            };
            let normal = item.normal;
            let normal = cgmath::Vector3::from(normal);
            let angle = item.rotation_angle;
            boxes_instance_data.push(Instance {
                //_pos: [center_x, center_y, center_z],
                //_delta: [delta_x, delta_y, delta_z],
                _pos: [0.0, 0.0, 0.0],
                _delta: [0.0, 0.0, 0.0],
                _color: [
                    color[0] as f32 / 255.0,
                    color[1] as f32 / 255.0,
                    color[2] as f32 / 255.0,
                ],
                _matrix: compose_matrix(&center, &scale, &normal, angle),
            });
        }
        for item in i3df_sector.primitive_collections.circle_collection {
            let color = item.color;
            let center_x = item.center_x;
            let center_y = item.center_y;
            let center_z = item.center_z;
            let delta_x = item.radius;
            let delta_y = item.radius;
            let delta_z = item.radius;
            let center = cgmath::Vector3 {
                x: center_x,
                y: center_y,
                z: center_z,
            };
            let scale = cgmath::Vector3 {
                x: delta_x,
                y: delta_y,
                z: delta_z,
            };
            let normal = item.normal;
            let normal = cgmath::Vector3::from(normal);
            let angle = 0.0;
            boxes_instance_data.push(Instance {
                //_pos: [center_x, center_y, center_z],
                //_delta: [delta_x, delta_y, delta_z],
                _pos: [0.0, 0.0, 0.0],
                _delta: [0.0, 0.0, 0.0],
                _color: [
                    color[0] as f32 / 255.0,
                    color[1] as f32 / 255.0,
                    color[2] as f32 / 255.0,
                ],
                _matrix: compose_matrix(&center, &scale, &normal, angle),
            });
        }
        //for item in i3df_sector.iter::<i3df::ClosedCone>() {
            //let color = item.color();
            //let center_x = item.center_x();
            //let center_y = item.center_y();
            //let center_z = item.center_z();
            //let delta_x = item.radius_a();
            //let delta_y = item.radius_b();
            //let delta_z = item.height();
            //let center = cgmath::Vector3 {
                //x: center_x,
                //y: center_y,
                //z: center_z,
            //};
            //let scale = cgmath::Vector3 {
                //x: delta_x,
                //y: delta_y,
                //z: delta_z,
            //};
            //let normal = item.center_axis();
            //let normal = cgmath::Vector3::from(normal);
            //let angle = 0.0;
            //boxes_instance_data.push(Instance {
                ////_pos: [center_x, center_y, center_z],
                ////_delta: [delta_x, delta_y, delta_z],
                //_pos: [0.0, 0.0, 0.0],
                //_delta: [0.0, 0.0, 0.0],
                //_color: [
                    //color[0] as f32 / 255.0,
                    //color[1] as f32 / 255.0,
                    //color[2] as f32 / 255.0,
                //],
                //_matrix: compose_matrix(&center, &scale, &normal, angle),
            //});
        //}
        //for item in i3df_sector.iter::<i3df::ClosedCylinder>() {
            //let color = item.color();
            //let center_x = item.center_x();
            //let center_y = item.center_y();
            //let center_z = item.center_z();
            //let delta_x = item.radius();
            //let delta_y = item.radius();
            //let delta_z = item.height();
            //let center = cgmath::Vector3 {
                //x: center_x,
                //y: center_y,
                //z: center_z,
            //};
            //let scale = cgmath::Vector3 {
                //x: delta_x,
                //y: delta_y,
                //z: delta_z,
            //};
            //let normal = item.center_axis();
            //let normal = cgmath::Vector3::from(normal);
            //let angle = 0.0;
            //boxes_instance_data.push(Instance {
                ////_pos: [center_x, center_y, center_z],
                ////_delta: [delta_x, delta_y, delta_z],
                //_pos: [0.0, 0.0, 0.0],
                //_delta: [0.0, 0.0, 0.0],
                //_color: [
                    //color[0] as f32 / 255.0,
                    //color[1] as f32 / 255.0,
                    //color[2] as f32 / 255.0,
                //],
                //_matrix: compose_matrix(&center, &scale, &normal, angle),
            //});
        //}
        //for item in i3df_sector.iter::<i3df::ClosedEccentricCone>() {
            //let color = item.color();
            //let center_x = item.center_x();
            //let center_y = item.center_y();
            //let center_z = item.center_z();
            //let delta_x = item.radius_a();
            //let delta_y = item.radius_b();
            //let delta_z = item.height();
            //let center = cgmath::Vector3 {
                //x: center_x,
                //y: center_y,
                //z: center_z,
            //};
            //let scale = cgmath::Vector3 {
                //x: delta_x,
                //y: delta_y,
                //z: delta_z,
            //};
            //let normal = item.center_axis();
            //let normal = cgmath::Vector3::from(normal);
            //let angle = 0.0;
            //boxes_instance_data.push(Instance {
                ////_pos: [center_x, center_y, center_z],
                ////_delta: [delta_x, delta_y, delta_z],
                //_pos: [0.0, 0.0, 0.0],
                //_delta: [0.0, 0.0, 0.0],
                //_color: [
                    //color[0] as f32 / 255.0,
                    //color[1] as f32 / 255.0,
                    //color[2] as f32 / 255.0,
                //],
                //_matrix: compose_matrix(&center, &scale, &normal, angle),
            //});
        //}
        //for item in i3df_sector.iter::<i3df::ClosedEllipsoidSegment>() {
            //let color = item.color();
            //let center_x = item.center_x();
            //let center_y = item.center_y();
            //let center_z = item.center_z();
            //let delta_x = item.horizontal_radius();
            //let delta_y = item.vertical_radius();
            //let delta_z = item.height();
            //let center = cgmath::Vector3 {
                //x: center_x,
                //y: center_y,
                //z: center_z,
            //};
            //let scale = cgmath::Vector3 {
                //x: delta_x,
                //y: delta_y,
                //z: delta_z,
            //};
            //let normal = item.normal();
            //let normal = cgmath::Vector3::from(normal);
            //let angle = 0.0;
            //boxes_instance_data.push(Instance {
                ////_pos: [center_x, center_y, center_z],
                ////_delta: [delta_x, delta_y, delta_z],
                //_pos: [0.0, 0.0, 0.0],
                //_delta: [0.0, 0.0, 0.0],
                //_color: [
                    //color[0] as f32 / 255.0,
                    //color[1] as f32 / 255.0,
                    //color[2] as f32 / 255.0,
                //],
                //_matrix: compose_matrix(&center, &scale, &normal, angle),
            //});
        //}
        //for item in i3df_sector.iter::<i3df::ClosedExtrudedRingSegment>() {
            //let color = item.color();
            //let center_x = item.center_x();
            //let center_y = item.center_y();
            //let center_z = item.center_z();
            //let delta_x = item.inner_radius();
            //let delta_y = item.outer_radius();
            //let delta_z = item.height();
            //let center = cgmath::Vector3 {
                //x: center_x,
                //y: center_y,
                //z: center_z,
            //};
            //let scale = cgmath::Vector3 {
                //x: delta_x,
                //y: delta_y,
                //z: delta_z,
            //};
            //let normal = item.center_axis();
            //let normal = cgmath::Vector3::from(normal);
            //let angle = item.rotation_angle();
            //boxes_instance_data.push(Instance {
                ////_pos: [center_x, center_y, center_z],
                ////_delta: [delta_x, delta_y, delta_z],
                //_pos: [0.0, 0.0, 0.0],
                //_delta: [0.0, 0.0, 0.0],
                //_color: [
                    //color[0] as f32 / 255.0,
                    //color[1] as f32 / 255.0,
                    //color[2] as f32 / 255.0,
                //],
                //_matrix: compose_matrix(&center, &scale, &normal, angle),
            //});
        //}
        //for item in i3df_sector.iter::<i3df::ClosedSphericalSegment>() {
            //let color = item.color();
            //let center_x = item.center_x();
            //let center_y = item.center_y();
            //let center_z = item.center_z();
            //let delta_x = item.height();
            //let delta_y = item.radius();
            //let delta_z = item.radius();
            //let center = cgmath::Vector3 {
                //x: center_x,
                //y: center_y,
                //z: center_z,
            //};
            //let scale = cgmath::Vector3 {
                //x: delta_x,
                //y: delta_y,
                //z: delta_z,
            //};
            //let normal = item.normal();
            //let normal = cgmath::Vector3::from(normal);
            //let angle = 0.0;
            //boxes_instance_data.push(Instance {
                ////_pos: [center_x, center_y, center_z],
                ////_delta: [delta_x, delta_y, delta_z],
                //_pos: [0.0, 0.0, 0.0],
                //_delta: [0.0, 0.0, 0.0],
                //_color: [
                    //color[0] as f32 / 255.0,
                    //color[1] as f32 / 255.0,
                    //color[2] as f32 / 255.0,
                //],
                //_matrix: compose_matrix(&center, &scale, &normal, angle),
            //});
        //}
        //for item in i3df_sector.iter::<i3df::ClosedTorusSegment>() {
            //let color = item.color();
            //let center_x = item.center_x();
            //let center_y = item.center_y();
            //let center_z = item.center_z();
            //let delta_x = item.radius();
            //let delta_y = item.radius();
            //let delta_z = item.tube_radius();
            //let center = cgmath::Vector3 {
                //x: center_x,
                //y: center_y,
                //z: center_z,
            //};
            //let scale = cgmath::Vector3 {
                //x: delta_x,
                //y: delta_y,
                //z: delta_z,
            //};
            //let normal = item.normal();
            //let normal = cgmath::Vector3::from(normal);
            //let angle = item.rotation_angle();
            //boxes_instance_data.push(Instance {
                ////_pos: [center_x, center_y, center_z],
                ////_delta: [delta_x, delta_y, delta_z],
                //_pos: [0.0, 0.0, 0.0],
                //_delta: [0.0, 0.0, 0.0],
                //_color: [
                    //color[0] as f32 / 255.0,
                    //color[1] as f32 / 255.0,
                    //color[2] as f32 / 255.0,
                //],
                //_matrix: compose_matrix(&center, &scale, &normal, angle),
            //});
        //}
        //for item in i3df_sector.iter::<i3df::Ellipsoid>() {
            //let color = item.color();
            //let center_x = item.center_x();
            //let center_y = item.center_y();
            //let center_z = item.center_z();
            //let delta_x = item.horizontal_radius();
            //let delta_y = item.horizontal_radius();
            //let delta_z = item.vertical_radius();
            //let center = cgmath::Vector3 {
                //x: center_x,
                //y: center_y,
                //z: center_z,
            //};
            //let scale = cgmath::Vector3 {
                //x: delta_x,
                //y: delta_y,
                //z: delta_z,
            //};
            //let normal = item.normal();
            //let normal = cgmath::Vector3::from(normal);
            //let angle = 0.0;
            //boxes_instance_data.push(Instance {
                ////_pos: [center_x, center_y, center_z],
                ////_delta: [delta_x, delta_y, delta_z],
                //_pos: [0.0, 0.0, 0.0],
                //_delta: [0.0, 0.0, 0.0],
                //_color: [
                    //color[0] as f32 / 255.0,
                    //color[1] as f32 / 255.0,
                    //color[2] as f32 / 255.0,
                //],
                //_matrix: compose_matrix(&center, &scale, &normal, angle),
            //});
        //}
        //for item in i3df_sector.iter::<i3df::ExtrudedRing>() {
            //let color = item.color();
            //let center_x = item.center_x();
            //let center_y = item.center_y();
            //let center_z = item.center_z();
            //let delta_x = item.inner_radius();
            //let delta_y = item.outer_radius();
            //let delta_z = item.height();
            //let center = cgmath::Vector3 {
                //x: center_x,
                //y: center_y,
                //z: center_z,
            //};
            //let scale = cgmath::Vector3 {
                //x: delta_x,
                //y: delta_y,
                //z: delta_z,
            //};
            //let normal = item.center_axis();
            //let normal = cgmath::Vector3::from(normal);
            //let angle = 0.0;
            //boxes_instance_data.push(Instance {
                ////_pos: [center_x, center_y, center_z],
                ////_delta: [delta_x, delta_y, delta_z],
                //_pos: [0.0, 0.0, 0.0],
                //_delta: [0.0, 0.0, 0.0],
                //_color: [
                    //color[0] as f32 / 255.0,
                    //color[1] as f32 / 255.0,
                    //color[2] as f32 / 255.0,
                //],
                //_matrix: compose_matrix(&center, &scale, &normal, angle),
            //});
        //}
        //for item in i3df_sector.iter::<i3df::Nut>() {
            //let color = item.color();
            //let center_x = item.center_x();
            //let center_y = item.center_y();
            //let center_z = item.center_z();
            //let delta_x = item.radius();
            //let delta_y = item.radius();
            //let delta_z = item.height();
            //let center = cgmath::Vector3 {
                //x: center_x,
                //y: center_y,
                //z: center_z,
            //};
            //let scale = cgmath::Vector3 {
                //x: delta_x,
                //y: delta_y,
                //z: delta_z,
            //};
            //let normal = item.center_axis();
            //let normal = cgmath::Vector3::from(normal);
            //let angle = item.rotation_angle();
            //boxes_instance_data.push(Instance {
                ////_pos: [center_x, center_y, center_z],
                ////_delta: [delta_x, delta_y, delta_z],
                //_pos: [0.0, 0.0, 0.0],
                //_delta: [0.0, 0.0, 0.0],
                //_color: [
                    //color[0] as f32 / 255.0,
                    //color[1] as f32 / 255.0,
                    //color[2] as f32 / 255.0,
                //],
                //_matrix: compose_matrix(&center, &scale, &normal, angle),
            //});
        //}
        //for item in i3df_sector.iter::<i3df::OpenCone>() {
            //let color = item.color();
            //let center_x = item.center_x();
            //let center_y = item.center_y();
            //let center_z = item.center_z();
            //let delta_x = item.radius_a();
            //let delta_y = item.radius_b();
            //let delta_z = item.height();
            //let center = cgmath::Vector3 {
                //x: center_x,
                //y: center_y,
                //z: center_z,
            //};
            //let scale = cgmath::Vector3 {
                //x: delta_x,
                //y: delta_y,
                //z: delta_z,
            //};
            //let normal = item.center_axis();
            //let normal = cgmath::Vector3::from(normal);
            //let angle = 0.0;
            //boxes_instance_data.push(Instance {
                ////_pos: [center_x, center_y, center_z],
                ////_delta: [delta_x, delta_y, delta_z],
                //_pos: [0.0, 0.0, 0.0],
                //_delta: [0.0, 0.0, 0.0],
                //_color: [
                    //color[0] as f32 / 255.0,
                    //color[1] as f32 / 255.0,
                    //color[2] as f32 / 255.0,
                //],
                //_matrix: compose_matrix(&center, &scale, &normal, angle),
            //});
        //}
        //for item in i3df_sector.iter::<i3df::OpenCylinder>() {
            //let color = item.color();
            //let center_x = item.center_x();
            //let center_y = item.center_y();
            //let center_z = item.center_z();
            //let delta_x = item.radius();
            //let delta_y = item.radius();
            //let delta_z = item.height();
            //let center = cgmath::Vector3 {
                //x: center_x,
                //y: center_y,
                //z: center_z,
            //};
            //let scale = cgmath::Vector3 {
                //x: delta_x,
                //y: delta_y,
                //z: delta_z,
            //};
            //let normal = item.center_axis();
            //let normal = cgmath::Vector3::from(normal);
            //let angle = 0.0;
            //boxes_instance_data.push(Instance {
                ////_pos: [center_x, center_y, center_z],
                ////_delta: [delta_x, delta_y, delta_z],
                //_pos: [0.0, 0.0, 0.0],
                //_delta: [0.0, 0.0, 0.0],
                //_color: [
                    //color[0] as f32 / 255.0,
                    //color[1] as f32 / 255.0,
                    //color[2] as f32 / 255.0,
                //],
                //_matrix: compose_matrix(&center, &scale, &normal, angle),
            //});
        //}
        //for item in i3df_sector.iter::<i3df::OpenEccentricCone>() {
            //let color = item.color();
            //let center_x = item.center_x();
            //let center_y = item.center_y();
            //let center_z = item.center_z();
            //let delta_x = item.radius_a();
            //let delta_y = item.radius_b();
            //let delta_z = item.height();
            //let center = cgmath::Vector3 {
                //x: center_x,
                //y: center_y,
                //z: center_z,
            //};
            //let scale = cgmath::Vector3 {
                //x: delta_x,
                //y: delta_y,
                //z: delta_z,
            //};
            //let normal = item.center_axis();
            //let normal = cgmath::Vector3::from(normal);
            //let angle = 0.0;
            //boxes_instance_data.push(Instance {
                ////_pos: [center_x, center_y, center_z],
                ////_delta: [delta_x, delta_y, delta_z],
                //_pos: [0.0, 0.0, 0.0],
                //_delta: [0.0, 0.0, 0.0],
                //_color: [
                    //color[0] as f32 / 255.0,
                    //color[1] as f32 / 255.0,
                    //color[2] as f32 / 255.0,
                //],
                //_matrix: compose_matrix(&center, &scale, &normal, angle),
            //});
        //}
        //for item in i3df_sector.iter::<i3df::OpenEllipsoidSegment>() {
            //let color = item.color();
            //let center_x = item.center_x();
            //let center_y = item.center_y();
            //let center_z = item.center_z();
            //let delta_x = item.horizontal_radius();
            //let delta_y = item.vertical_radius();
            //let delta_z = item.height();
            //let center = cgmath::Vector3 {
                //x: center_x,
                //y: center_y,
                //z: center_z,
            //};
            //let scale = cgmath::Vector3 {
                //x: delta_x,
                //y: delta_y,
                //z: delta_z,
            //};
            //let normal = item.normal();
            //let normal = cgmath::Vector3::from(normal);
            //let angle = 0.0;
            //boxes_instance_data.push(Instance {
                ////_pos: [center_x, center_y, center_z],
                ////_delta: [delta_x, delta_y, delta_z],
                //_pos: [0.0, 0.0, 0.0],
                //_delta: [0.0, 0.0, 0.0],
                //_color: [
                    //color[0] as f32 / 255.0,
                    //color[1] as f32 / 255.0,
                    //color[2] as f32 / 255.0,
                //],
                //_matrix: compose_matrix(&center, &scale, &normal, angle),
            //});
        //}
        //for item in i3df_sector.iter::<i3df::OpenExtrudedRingSegment>() {
            //let color = item.color();
            //let center_x = item.center_x();
            //let center_y = item.center_y();
            //let center_z = item.center_z();
            //let delta_x = item.inner_radius();
            //let delta_y = item.outer_radius();
            //let delta_z = item.height();
            //let center = cgmath::Vector3 {
                //x: center_x,
                //y: center_y,
                //z: center_z,
            //};
            //let scale = cgmath::Vector3 {
                //x: delta_x,
                //y: delta_y,
                //z: delta_z,
            //};
            //let normal = item.center_axis();
            //let normal = cgmath::Vector3::from(normal);
            //let angle = item.rotation_angle();
            //boxes_instance_data.push(Instance {
                ////_pos: [center_x, center_y, center_z],
                ////_delta: [delta_x, delta_y, delta_z],
                //_pos: [0.0, 0.0, 0.0],
                //_delta: [0.0, 0.0, 0.0],
                //_color: [
                    //color[0] as f32 / 255.0,
                    //color[1] as f32 / 255.0,
                    //color[2] as f32 / 255.0,
                //],
                //_matrix: compose_matrix(&center, &scale, &normal, angle),
            //});
        //}
        //for item in i3df_sector.iter::<i3df::OpenSphericalSegment>() {
            //let color = item.color();
            //let center_x = item.center_x();
            //let center_y = item.center_y();
            //let center_z = item.center_z();
            //let delta_x = item.radius();
            //let delta_y = item.radius();
            //let delta_z = item.height();
            //let center = cgmath::Vector3 {
                //x: center_x,
                //y: center_y,
                //z: center_z,
            //};
            //let scale = cgmath::Vector3 {
                //x: delta_x,
                //y: delta_y,
                //z: delta_z,
            //};
            //let normal = item.normal();
            //let normal = cgmath::Vector3::from(normal);
            //let angle = 0.0;
            //boxes_instance_data.push(Instance {
                ////_pos: [center_x, center_y, center_z],
                ////_delta: [delta_x, delta_y, delta_z],
                //_pos: [0.0, 0.0, 0.0],
                //_delta: [0.0, 0.0, 0.0],
                //_color: [
                    //color[0] as f32 / 255.0,
                    //color[1] as f32 / 255.0,
                    //color[2] as f32 / 255.0,
                //],
                //_matrix: compose_matrix(&center, &scale, &normal, angle),
            //});
        //}
        //for item in i3df_sector.iter::<i3df::OpenTorusSegment>() {
            //let color = item.color();
            //let center_x = item.center_x();
            //let center_y = item.center_y();
            //let center_z = item.center_z();
            //let delta_x = item.radius();
            //let delta_y = item.radius();
            //let delta_z = item.tube_radius();
            //let center = cgmath::Vector3 {
                //x: center_x,
                //y: center_y,
                //z: center_z,
            //};
            //let scale = cgmath::Vector3 {
                //x: delta_x,
                //y: delta_y,
                //z: delta_z,
            //};
            //let normal = item.normal();
            //let normal = cgmath::Vector3::from(normal);
            //let angle = item.rotation_angle();
            //boxes_instance_data.push(Instance {
                ////_pos: [center_x, center_y, center_z],
                ////_delta: [delta_x, delta_y, delta_z],
                //_pos: [0.0, 0.0, 0.0],
                //_delta: [0.0, 0.0, 0.0],
                //_color: [
                    //color[0] as f32 / 255.0,
                    //color[1] as f32 / 255.0,
                    //color[2] as f32 / 255.0,
                //],
                //_matrix: compose_matrix(&center, &scale, &normal, angle),
            //});
        //}
        //for item in i3df_sector.iter::<i3df::Ring>() {
            //let color = item.color();
            //let center_x = item.center_x();
            //let center_y = item.center_y();
            //let center_z = item.center_z();
            //let delta_x = item.inner_radius();
            //let delta_y = item.outer_radius();
            //let delta_z = 1.0;
            //let center = cgmath::Vector3 {
                //x: center_x,
                //y: center_y,
                //z: center_z,
            //};
            //let scale = cgmath::Vector3 {
                //x: delta_x,
                //y: delta_y,
                //z: delta_z,
            //};
            //let normal = item.normal();
            //let normal = cgmath::Vector3::from(normal);
            //let angle = 0.0;
            //boxes_instance_data.push(Instance {
                ////_pos: [center_x, center_y, center_z],
                ////_delta: [delta_x, delta_y, delta_z],
                //_pos: [0.0, 0.0, 0.0],
                //_delta: [0.0, 0.0, 0.0],
                //_color: [
                    //color[0] as f32 / 255.0,
                    //color[1] as f32 / 255.0,
                    //color[2] as f32 / 255.0,
                //],
                //_matrix: compose_matrix(&center, &scale, &normal, angle),
            //});
        //}
        //for item in i3df_sector.iter::<i3df::Sphere>() {
            //let color = item.color();
            //let center_x = item.center_x();
            //let center_y = item.center_y();
            //let center_z = item.center_z();
            //let delta_x = item.radius();
            //let delta_y = item.radius();
            //let delta_z = item.radius();
            //let center = cgmath::Vector3 {
                //x: center_x,
                //y: center_y,
                //z: center_z,
            //};
            //let scale = cgmath::Vector3 {
                //x: delta_x,
                //y: delta_y,
                //z: delta_z,
            //};
            //let normal = cgmath::Vector3::unit_z();
            //let normal = cgmath::Vector3::from(normal);
            //let angle = 0.0;
            //boxes_instance_data.push(Instance {
                ////_pos: [center_x, center_y, center_z],
                ////_delta: [delta_x, delta_y, delta_z],
                //_pos: [0.0, 0.0, 0.0],
                //_delta: [0.0, 0.0, 0.0],
                //_color: [
                    //color[0] as f32 / 255.0,
                    //color[1] as f32 / 255.0,
                    //color[2] as f32 / 255.0,
                //],
                //_matrix: compose_matrix(&center, &scale, &normal, angle),
            //});
        //}
        //for item in i3df_sector.iter::<i3df::Torus>() {
            //let color = item.color();
            //let center_x = item.center_x();
            //let center_y = item.center_y();
            //let center_z = item.center_z();
            //let delta_x = item.radius();
            //let delta_y = item.radius();
            //let delta_z = item.tube_radius();
            //let center = cgmath::Vector3 {
                //x: center_x,
                //y: center_y,
                //z: center_z,
            //};
            //let scale = cgmath::Vector3 {
                //x: delta_x,
                //y: delta_y,
                //z: delta_z,
            //};
            //let normal = item.normal();
            //let normal = cgmath::Vector3::from(normal);
            //let angle = 0.0;
            //boxes_instance_data.push(Instance {
                ////_pos: [center_x, center_y, center_z],
                ////_delta: [delta_x, delta_y, delta_z],
                //_pos: [0.0, 0.0, 0.0],
                //_delta: [0.0, 0.0, 0.0],
                //_color: [
                    //color[0] as f32 / 255.0,
                    //color[1] as f32 / 255.0,
                    //color[2] as f32 / 255.0,
                //],
                //_matrix: compose_matrix(&center, &scale, &normal, angle),
            //});
        //}
        //for item in i3df_sector.iter::<i3df::ClosedGeneralCylinder>() {
            //let color = item.color();
            //let center_x = item.center_x();
            //let center_y = item.center_y();
            //let center_z = item.center_z();
            //let delta_x = item.radius();
            //let delta_y = item.radius();
            //let delta_z = item.height();
            //let center = cgmath::Vector3 {
                //x: center_x,
                //y: center_y,
                //z: center_z,
            //};
            //let scale = cgmath::Vector3 {
                //x: delta_x,
                //y: delta_y,
                //z: delta_z,
            //};
            //let normal = item.center_axis();
            //let normal = cgmath::Vector3::from(normal);
            //let angle = item.rotation_angle();
            //boxes_instance_data.push(Instance {
                ////_pos: [center_x, center_y, center_z],
                ////_delta: [delta_x, delta_y, delta_z],
                //_pos: [0.0, 0.0, 0.0],
                //_delta: [0.0, 0.0, 0.0],
                //_color: [
                    //color[0] as f32 / 255.0,
                    //color[1] as f32 / 255.0,
                    //color[2] as f32 / 255.0,
                //],
                //_matrix: compose_matrix(&center, &scale, &normal, angle),
            //});
        //}
        //for item in i3df_sector.iter::<i3df::OpenGeneralCylinder>() {
            //let color = item.color();
            //let center_x = item.center_x();
            //let center_y = item.center_y();
            //let center_z = item.center_z();
            //let delta_x = item.radius();
            //let delta_y = item.radius();
            //let delta_z = item.height();
            //let center = cgmath::Vector3 {
                //x: center_x,
                //y: center_y,
                //z: center_z,
            //};
            //let scale = cgmath::Vector3 {
                //x: delta_x,
                //y: delta_y,
                //z: delta_z,
            //};
            //let normal = item.center_axis();
            //let normal = cgmath::Vector3::from(normal);
            //let angle = item.rotation_angle();
            //boxes_instance_data.push(Instance {
                ////_pos: [center_x, center_y, center_z],
                ////_delta: [delta_x, delta_y, delta_z],
                //_pos: [0.0, 0.0, 0.0],
                //_delta: [0.0, 0.0, 0.0],
                //_color: [
                    //color[0] as f32 / 255.0,
                    //color[1] as f32 / 255.0,
                    //color[2] as f32 / 255.0,
                //],
                //_matrix: compose_matrix(&center, &scale, &normal, angle),
            //});
        //}
        //for item in i3df_sector.iter::<i3df::SolidOpenGeneralCylinder>() {
            //let color = item.color();
            //let center_x = item.center_x();
            //let center_y = item.center_y();
            //let center_z = item.center_z();
            //let delta_x = item.radius();
            //let delta_y = item.radius();
            //let delta_z = item.height();
            //let center = cgmath::Vector3 {
                //x: center_x,
                //y: center_y,
                //z: center_z,
            //};
            //let scale = cgmath::Vector3 {
                //x: delta_x,
                //y: delta_y,
                //z: delta_z,
            //};
            //let normal = item.center_axis();
            //let normal = cgmath::Vector3::from(normal);
            //let angle = item.rotation_angle();
            //boxes_instance_data.push(Instance {
                ////_pos: [center_x, center_y, center_z],
                ////_delta: [delta_x, delta_y, delta_z],
                //_pos: [0.0, 0.0, 0.0],
                //_delta: [0.0, 0.0, 0.0],
                //_color: [
                    //color[0] as f32 / 255.0,
                    //color[1] as f32 / 255.0,
                    //color[2] as f32 / 255.0,
                //],
                //_matrix: compose_matrix(&center, &scale, &normal, angle),
            //});
        //}
        //for item in i3df_sector.iter::<i3df::SolidClosedGeneralCylinder>() {
            //let color = item.color();
            //let center_x = item.center_x();
            //let center_y = item.center_y();
            //let center_z = item.center_z();
            //let delta_x = item.radius();
            //let delta_y = item.radius();
            //let delta_z = item.height();
            //let center = cgmath::Vector3 {
                //x: center_x,
                //y: center_y,
                //z: center_z,
            //};
            //let scale = cgmath::Vector3 {
                //x: delta_x,
                //y: delta_y,
                //z: delta_z,
            //};
            //let normal = item.center_axis();
            //let normal = cgmath::Vector3::from(normal);
            //let angle = item.rotation_angle();
            //boxes_instance_data.push(Instance {
                ////_pos: [center_x, center_y, center_z],
                ////_delta: [delta_x, delta_y, delta_z],
                //_pos: [0.0, 0.0, 0.0],
                //_delta: [0.0, 0.0, 0.0],
                //_color: [
                    //color[0] as f32 / 255.0,
                    //color[1] as f32 / 255.0,
                    //color[2] as f32 / 255.0,
                //],
                //_matrix: compose_matrix(&center, &scale, &normal, angle),
            //});
        //}
        //for item in i3df_sector.iter::<i3df::OpenGeneralCone>() {
            //let color = item.color();
            //let center_x = item.center_x();
            //let center_y = item.center_y();
            //let center_z = item.center_z();
            //let delta_x = item.radius_a();
            //let delta_y = item.radius_b();
            //let delta_z = item.height();
            //let center = cgmath::Vector3 {
                //x: center_x,
                //y: center_y,
                //z: center_z,
            //};
            //let scale = cgmath::Vector3 {
                //x: delta_x,
                //y: delta_y,
                //z: delta_z,
            //};
            //let normal = item.center_axis();
            //let normal = cgmath::Vector3::from(normal);
            //let angle = item.rotation_angle();
            //boxes_instance_data.push(Instance {
                ////_pos: [center_x, center_y, center_z],
                ////_delta: [delta_x, delta_y, delta_z],
                //_pos: [0.0, 0.0, 0.0],
                //_delta: [0.0, 0.0, 0.0],
                //_color: [
                    //color[0] as f32 / 255.0,
                    //color[1] as f32 / 255.0,
                    //color[2] as f32 / 255.0,
                //],
                //_matrix: compose_matrix(&center, &scale, &normal, angle),
            //});
        //}
        //for item in i3df_sector.iter::<i3df::ClosedGeneralCone>() {
            //let color = item.color();
            //let center_x = item.center_x();
            //let center_y = item.center_y();
            //let center_z = item.center_z();
            //let delta_x = item.radius_a();
            //let delta_y = item.radius_b();
            //let delta_z = item.height();
            //let center = cgmath::Vector3 {
                //x: center_x,
                //y: center_y,
                //z: center_z,
            //};
            //let scale = cgmath::Vector3 {
                //x: delta_x,
                //y: delta_y,
                //z: delta_z,
            //};
            //let normal = item.center_axis();
            //let normal = cgmath::Vector3::from(normal);
            //let angle = item.rotation_angle();
            //boxes_instance_data.push(Instance {
                ////_pos: [center_x, center_y, center_z],
                ////_delta: [delta_x, delta_y, delta_z],
                //_pos: [0.0, 0.0, 0.0],
                //_delta: [0.0, 0.0, 0.0],
                //_color: [
                    //color[0] as f32 / 255.0,
                    //color[1] as f32 / 255.0,
                    //color[2] as f32 / 255.0,
                //],
                //_matrix: compose_matrix(&center, &scale, &normal, angle),
            //});
        //}
        //for item in i3df_sector.iter::<i3df::SolidOpenGeneralCone>() {
            //let color = item.color();
            //let center_x = item.center_x();
            //let center_y = item.center_y();
            //let center_z = item.center_z();
            //let delta_x = item.radius_a();
            //let delta_y = item.radius_b();
            //let delta_z = item.height();
            //let center = cgmath::Vector3 {
                //x: center_x,
                //y: center_y,
                //z: center_z,
            //};
            //let scale = cgmath::Vector3 {
                //x: delta_x,
                //y: delta_y,
                //z: delta_z,
            //};
            //let normal = item.center_axis();
            //let normal = cgmath::Vector3::from(normal);
            //let angle = item.rotation_angle();
            //boxes_instance_data.push(Instance {
                ////_pos: [center_x, center_y, center_z],
                ////_delta: [delta_x, delta_y, delta_z],
                //_pos: [0.0, 0.0, 0.0],
                //_delta: [0.0, 0.0, 0.0],
                //_color: [
                    //color[0] as f32 / 255.0,
                    //color[1] as f32 / 255.0,
                    //color[2] as f32 / 255.0,
                //],
                //_matrix: compose_matrix(&center, &scale, &normal, angle),
            //});
        //}
        //for item in i3df_sector.iter::<i3df::SolidClosedGeneralCone>() {
            //let color = item.color();
            //let center_x = item.center_x();
            //let center_y = item.center_y();
            //let center_z = item.center_z();
            //let delta_x = item.radius_a();
            //let delta_y = item.radius_b();
            //let delta_z = item.height();
            //let center = cgmath::Vector3 {
                //x: center_x,
                //y: center_y,
                //z: center_z,
            //};
            //let scale = cgmath::Vector3 {
                //x: delta_x,
                //y: delta_y,
                //z: delta_z,
            //};
            //let normal = item.center_axis();
            //let normal = cgmath::Vector3::from(normal);
            //let angle = item.rotation_angle();
            //boxes_instance_data.push(Instance {
                ////_pos: [center_x, center_y, center_z],
                ////_delta: [delta_x, delta_y, delta_z],
                //_pos: [0.0, 0.0, 0.0],
                //_delta: [0.0, 0.0, 0.0],
                //_color: [
                    //color[0] as f32 / 255.0,
                    //color[1] as f32 / 255.0,
                    //color[2] as f32 / 255.0,
                //],
                //_matrix: compose_matrix(&center, &scale, &normal, angle),
            //});
        //}
        for item in i3df_sector.primitive_collections.triangle_mesh_collection {
            let tree_index = item.tree_index;
            let file_id = item.file_id;

            let reader = match ctm_cache.get(&file_id) {
                Some(x) => x,
                None => continue
            };

            let triangle_count = item.triangle_count;
            let triangle_offset = triangle_mesh_offsets.entry(file_id).or_default();
            let index_offset = (*triangle_offset * 3) as u32;
            let index_count = (triangle_count * 3) as u32;
            let index_range = index_offset..(index_offset + index_count);

            let color = [
                item.color[0] as f32 / 255.0,
                item.color[1] as f32 / 255.0,
                item.color[2] as f32 / 255.0,
            ];

            // TODO it is inefficient to have this as an attribute array - rather make one of
            // tree index and look up the color in a buffer
            let mut colors = vec![color; index_count as usize];
            let colors_for_file = triangle_mesh_colors.entry(file_id).or_default();
            colors_for_file.append(&mut colors);

            *triangle_offset += triangle_count;

            meshes.push(Mesh {
                file_id,
                index_range,
            });
        }

        let mut counter = 0;
        for item in i3df_sector.primitive_collections.instanced_mesh_collection {
            // TODO figure out what is wrong with color
            //let color = item.color();
            let tree_index = item.tree_index;
            let triangle_count = item.triangle_count;

            // TODO why is this even possible?
            if triangle_count == 0 {
                continue;
            }

            let file_id = item.file_id;
            let translation = cgmath::Vector3::new(
                item.translation_x,
                item.translation_y,
                item.translation_z,
            );
            let triangle_offset = item.triangle_offset;

            //println!("Filename {}", file_id_to_filename[&file_id]);
            let rotation =
                cgmath::Vector3::new(item.rotation_x, item.rotation_y, item.rotation_z);
            let scale = cgmath::Vector3::new(item.scale_x, item.scale_y, item.scale_z);

            // TODO fix bad rotation in i3df
            //let rotation = cgmath::Vector3::new(0.0, 0.0, 0.0);
            // TODO fix bad scale in i3df
            //let scale = cgmath::Vector3::new(1.0, 1.0, 1.0);

            let matrix = compose_matrix_trs(&translation, &rotation, &scale);

            let reader = match ctm_cache.get(&file_id) {
                Some(x) => x,
                None => continue
            };

            //println!("Instanced mesh: tree_index {}, file_id {}, count {}", tree_index, file_id, reader.vertices.len());
            //println!("Triangle offset {} count {}", triangle_offset, triangle_count);

            // TODO replace with instance count
            let key = format!("{}_{}_{}", file_id, triangle_offset, triangle_count);
            let index_offset = (triangle_offset * 3) as u32;
            let index_count = (triangle_count * 3) as u32;
            let instanced_mesh = match instanced_meshes.contains_key(&key) {
                true => instanced_meshes.get_mut(&key).unwrap(),
                false => {
                    let index_range = index_offset..(index_offset + index_count);
                    let indices = &reader.indices[index_offset as usize..(index_offset + index_count) as usize];
                    //println!("Indexes {} {}", index_offset, index_count);
                    let lowest_index = *indices.iter().min().unwrap() as usize;
                    let highest_index = *indices.iter().max().unwrap() as usize;
                    let indices = indices.iter().map(|index| {
                        index - lowest_index as u32
                    }).collect();

                    ////println!("Instance {} {} {}", key, lowest_index, highest_index);

                    let vertices = reader.vertices[lowest_index..highest_index].to_vec();
                    let color = [
                        item.color[0] as f32 / 255.0,
                        item.color[1] as f32 / 255.0,
                        item.color[2] as f32 / 255.0,
                    ];

                    // TODO it is inefficient to have this as an attribute array - rather make one of
                    // tree index and look up the color in a buffer
                    let mut colors = vec![color; index_count as usize];
                    let instanced_mesh = InstancedMesh {
                        // TODO clone should not be necessary here, but we cannot move
                        // currently
                        indices,
                        vertices,
                        colors,
                        index_buf: &reader.index_buf,
                        vertex_buf: &reader.index_buf,
                        index_range,
                        instances: Vec::new(),
                    };
                    instanced_meshes.insert(key.clone(), instanced_mesh);
                    instanced_meshes.get_mut(&key).unwrap()
                }
            };

            instanced_mesh.instances.push(InstancedMeshInstance {
                matrix,
            });

            counter += 1;
        }
        println!("Instanced mesh count: {}", counter);

        let mut loaded_instanced_meshes: Vec<LoadedInstancedMesh> =
            Vec::new();

        for instanced_mesh in instanced_meshes.values() {
            let vertex_data = &instanced_mesh.vertices;
            let index_data = &instanced_mesh.indices;
            let color_data = &instanced_mesh.colors;
            let instance_data = &instanced_mesh.instances;

            if instance_data.len() < 2 || index_data.len() < 100 {
                //offset local indices to new global indices in the merged mesh
                let index_offset = instance_mesh_merged_vertex_data.len() as u32;
                for instance in instance_data {
                    let index_offset = 0;
                    let indices = index_data.iter().map(|index| {
                        index + index_offset
                    });
                    let vertices = vertex_data.iter().map(|vertex| {
                        let pos = instance.matrix * cgmath::Vector4::new(vertex.x, vertex.y, vertex.z, 1.0);
                        openctm::Vertex {
                            x: pos.x,
                            y: pos.y,
                            z: pos.z,
                        }
                    });

                    instance_mesh_merged_vertex_data.extend(vertices);
                    instance_mesh_merged_index_data.extend(indices);
                    instance_mesh_merged_color_data.extend(color_data);
                }

            } else {

                let index_buf = device
                    .create_buffer_mapped(index_data.len(), wgpu::BufferUsage::INDEX)
                    .fill_from_slice(&index_data);
                let vertex_buf = device
                    .create_buffer_mapped(vertex_data.len(), wgpu::BufferUsage::VERTEX)
                    .fill_from_slice(&vertex_data);
                let instance_buf = device
                    .create_buffer_mapped(instance_data.len(), wgpu::BufferUsage::VERTEX)
                    .fill_from_slice(&instance_data);
                let color_buf = device
                    .create_buffer_mapped(color_data.len(), wgpu::BufferUsage::VERTEX)
                    .fill_from_slice(&color_data);

                //println!("Loaded instanced mesh: index_count {}, vertex_count {}, instance_count {}", index_data.len(), vertex_data.len(), instance_data.len());

                // TODO should be no need for this, we can reference directly into the original
                // buffers
                loaded_instanced_meshes.push(LoadedInstancedMesh {
                    vertex_buf,
                    color_buf,
                    index_buf,
                    index_count: index_data.len(),
                    instance_buf,
                    instance_count: instance_data.len()
                });
            }
        }

        // TODO add back later
        //{
            //let (vertex_data, index_data) = (instance_mesh_merged_vertex_data, instance_mesh_merged_index_data);
            //let vertex_buf = device
                //.create_buffer_mapped(vertex_data.len(), wgpu::BufferUsage::VERTEX)
                //.fill_from_slice(&vertex_data);

            //let index_buf = device
                //.create_buffer_mapped(index_data.len(), wgpu::BufferUsage::INDEX)
                //.fill_from_slice(&index_data);

            //// Just some random id
            //ctm_cache.insert(1, CtmData {
                //indices: index_data,
                //vertices: vertex_data,
                //vertex_buf,
                //index_buf,
            //});

            //triangle_mesh_colors.insert(1, instance_mesh_merged_color_data);

            //meshes.push(Mesh {
                //file_id: 1,
                //index_range: 0..index_data.len() as u32,
            //});
        //}

        println!("Instance count {}", boxes_instance_data.len());
        let instance_buf = device
            .create_buffer_mapped(boxes_instance_data.len(), wgpu::BufferUsage::VERTEX)
            .fill_from_slice(&boxes_instance_data);

        let primitives = {
            let (vertex_data, index_data) = create_vertices();
            let vertex_buf = device
                .create_buffer_mapped(vertex_data.len(), wgpu::BufferUsage::VERTEX)
                .fill_from_slice(&vertex_data);

            let index_buf = device
                .create_buffer_mapped(index_data.len(), wgpu::BufferUsage::INDEX)
                .fill_from_slice(&index_data);

            Boxes {
                vertex_buf,
                index_buf,
                index_count: index_data.len(),
                instance_buf: instance_buf,
                instance_count: boxes_instance_data.len(),
            }
        };

        let triangle_mesh_color_bufs: HashMap::<u64, wgpu::Buffer> = triangle_mesh_colors.iter().map(|(file_id, colors)| {
            let color_buf = device
                .create_buffer_mapped(colors.len(), wgpu::BufferUsage::INDEX)
                .fill_from_slice(&colors);
            (*file_id, color_buf)
        }).collect();

        drawable_sectors.push(DrawableSector {
            sector_id,
            faces,
            primitives,
            meshes,
            triangle_mesh_color_bufs,
            instanced_meshes: loaded_instanced_meshes,
        });
    }

    let mut sc_desc = wgpu::SwapChainDescriptor {
        usage: wgpu::TextureUsage::OUTPUT_ATTACHMENT,
        format: wgpu::TextureFormat::Bgra8Unorm,
        width: size.width.round() as u32,
        height: size.height.round() as u32,
        present_mode: wgpu::PresentMode::Vsync,
    };
    let mut swap_chain = device.create_swap_chain(&surface, &sc_desc);

    // Set up imgui
    let mut imgui = ImGui::init();
    imgui.set_ini_filename(None);

    let font_size = (13.0 * hidpi_factor) as f32;
    imgui.set_font_global_scale((1.0 / hidpi_factor) as f32);

    imgui.fonts().add_default_font_with_config(
        ImFontConfig::new()
            .oversample_h(1)
            .pixel_snap_h(true)
            .size_pixels(font_size),
    );

    imgui_winit_support::configure_keys(&mut imgui);

    let mut renderer = Renderer::new(&mut imgui, &mut device, sc_desc.format, None)
        .expect("Failed to initialize renderer");

    let mut last_frame = Instant::now();
    let mut demo_open = true;

    info!("Initializing the example...");

    let mut init_encoder =
        device.create_command_encoder(&wgpu::CommandEncoderDescriptor { todo: 0 });

    // Create the vertex and index buffers
    let vertex_size = mem::size_of::<Vertex>();
    let instance_size = mem::size_of::<Instance>();

    // Create pipeline layout
    let bind_group_layout = device.create_bind_group_layout(&wgpu::BindGroupLayoutDescriptor {
        bindings: &[
            wgpu::BindGroupLayoutBinding {
                binding: 0,
                visibility: wgpu::ShaderStage::VERTEX,
                ty: wgpu::BindingType::UniformBuffer,
            },
            wgpu::BindGroupLayoutBinding {
                binding: 1,
                visibility: wgpu::ShaderStage::FRAGMENT,
                ty: wgpu::BindingType::UniformBuffer,
            },
        ],
    });
    let pipeline_layout = device.create_pipeline_layout(&wgpu::PipelineLayoutDescriptor {
        bind_group_layouts: &[&bind_group_layout],
    });

    // Create the texture
    let mx_total = generate_matrix(sc_desc.width as f32 / sc_desc.height as f32, 0.0, 0.0, 0.0, cgmath::Vector3::new(0.0, 0.0, 0.0));
    let mx_ref: &[f32; 16] = mx_total.as_ref();
    let uniform_buf = device
        .create_buffer_mapped(
            16,
            wgpu::BufferUsage::UNIFORM | wgpu::BufferUsage::TRANSFER_DST,
        )
        .fill_from_slice(mx_ref); // TODO do not fill here

    let green_buffer = device
        .create_buffer_mapped(
            4,
            wgpu::BufferUsage::UNIFORM | wgpu::BufferUsage::TRANSFER_DST,
        )
        .fill_from_slice(&[0.0 as f32, 1.0, 0.0, 1.0]);

    let red_buffer = device
        .create_buffer_mapped(
            4,
            wgpu::BufferUsage::UNIFORM | wgpu::BufferUsage::TRANSFER_DST,
        )
        .fill_from_slice(&[1.0 as f32, 0.0, 0.0, 1.0]);

    // Create bind group
    let green_bind_group = device.create_bind_group(&wgpu::BindGroupDescriptor {
        layout: &bind_group_layout,
        bindings: &[
            wgpu::Binding {
                binding: 0,
                resource: wgpu::BindingResource::Buffer {
                    buffer: &uniform_buf,
                    range: 0..64,
                },
            },
            wgpu::Binding {
                binding: 1,
                resource: wgpu::BindingResource::Buffer {
                    buffer: &green_buffer,
                    range: 0..4,
                },
            },
        ],
    });

    let red_bind_group = device.create_bind_group(&wgpu::BindGroupDescriptor {
        layout: &bind_group_layout,
        bindings: &[
            wgpu::Binding {
                binding: 0,
                resource: wgpu::BindingResource::Buffer {
                    buffer: &uniform_buf,
                    range: 0..64,
                },
            },
            wgpu::Binding {
                binding: 1,
                resource: wgpu::BindingResource::Buffer {
                    buffer: &red_buffer,
                    range: 0..4,
                },
            },
        ],
    });

    let faces_pipeline = {
        let vertex_size = mem::size_of::<Vertex>();
        let instance_size = mem::size_of::<Face>();
        let vs_bytes = load_glsl(include_str!("faces.vert"), ShaderStage::Vertex);
        let fs_bytes = load_glsl(include_str!("shader.frag"), ShaderStage::Fragment);
        let vs_module = device.create_shader_module(&vs_bytes);
        let fs_module = device.create_shader_module(&fs_bytes);

        let pipeline_layout = device.create_pipeline_layout(&wgpu::PipelineLayoutDescriptor {
            bind_group_layouts: &[&bind_group_layout],
        });

        let pipeline = device.create_render_pipeline(&wgpu::RenderPipelineDescriptor {
            layout: &pipeline_layout,
            vertex_stage: wgpu::PipelineStageDescriptor {
                module: &vs_module,
                entry_point: "main",
            },
            fragment_stage: Some(wgpu::PipelineStageDescriptor {
                module: &fs_module,
                entry_point: "main",
            }),
            rasterization_state: wgpu::RasterizationStateDescriptor {
                front_face: wgpu::FrontFace::Ccw,
                cull_mode: wgpu::CullMode::Back, // TODO should this be none? Ask np
                //cull_mode: wgpu::CullMode::None, // TODO should this be none? Ask np
                depth_bias: 0,
                depth_bias_slope_scale: 0.0,
                depth_bias_clamp: 0.0,
            },
            //primitive_topology: wgpu::PrimitiveTopology::TriangleList,
            primitive_topology: wgpu::PrimitiveTopology::TriangleList,
            color_states: &[wgpu::ColorStateDescriptor {
                format: sc_desc.format,
                color_blend: wgpu::BlendDescriptor::REPLACE,
                alpha_blend: wgpu::BlendDescriptor::REPLACE,
                write_mask: wgpu::ColorWrite::ALL,
            }],
            depth_stencil_state: Some(wgpu::DepthStencilStateDescriptor {
                format: wgpu::TextureFormat::D32Float,
                depth_write_enabled: true,
                depth_compare: wgpu::CompareFunction::Less,
                stencil_front: wgpu::StencilStateFaceDescriptor::IGNORE,
                stencil_back: wgpu::StencilStateFaceDescriptor::IGNORE,
                stencil_read_mask: 0,
                stencil_write_mask: 0,
            }),
            index_format: wgpu::IndexFormat::Uint16,
            vertex_buffers: &[
                wgpu::VertexBufferDescriptor {
                    stride: vertex_size as wgpu::BufferAddress,
                    step_mode: wgpu::InputStepMode::Vertex,
                    attributes: &[
                        wgpu::VertexAttributeDescriptor {
                            format: wgpu::VertexFormat::Float4,
                            offset: 0,
                            shader_location: 0,
                        },
                        wgpu::VertexAttributeDescriptor {
                            format: wgpu::VertexFormat::Float2,
                            offset: 4 * 4,
                            shader_location: 1,
                        },
                    ],
                },
                wgpu::VertexBufferDescriptor {
                    stride: instance_size as wgpu::BufferAddress,
                    step_mode: wgpu::InputStepMode::Instance,
                    attributes: &[
                        wgpu::VertexAttributeDescriptor {
                            format: wgpu::VertexFormat::Float3,
                            offset: 0,
                            shader_location: 2,
                        },
                        wgpu::VertexAttributeDescriptor {
                            format: wgpu::VertexFormat::Float3,
                            offset: 4 * 3,
                            shader_location: 3,
                        },
                        wgpu::VertexAttributeDescriptor {
                            format: wgpu::VertexFormat::Float4,
                            offset: 4 * 3 + 4 * 3,
                            shader_location: 4,
                        },
                        wgpu::VertexAttributeDescriptor {
                            format: wgpu::VertexFormat::Float4,
                            offset: 4 * 3 + 4 * 3 + 4 * 4,
                            shader_location: 5,
                        },
                        wgpu::VertexAttributeDescriptor {
                            format: wgpu::VertexFormat::Float4,
                            offset: 4 * 3 + 4 * 3 + 4 * 4 + 4 * 4,
                            shader_location: 6,
                        },
                        wgpu::VertexAttributeDescriptor {
                            format: wgpu::VertexFormat::Float4,
                            offset: 4 * 3 + 4 * 3 + 4 * 4 + 4 * 4 + 4 * 4,
                            shader_location: 7,
                        },
                    ],
                },
            ],
            sample_count: 1,
        });
        pipeline
    };

    let boxes_pipeline = {
        let vs_bytes = load_glsl(include_str!("boxes.vert"), ShaderStage::Vertex);
        let fs_bytes = load_glsl(include_str!("shader.frag"), ShaderStage::Fragment);
        let vs_module = device.create_shader_module(&vs_bytes);
        let fs_module = device.create_shader_module(&fs_bytes);

        let pipeline = device.create_render_pipeline(&wgpu::RenderPipelineDescriptor {
            layout: &pipeline_layout,
            vertex_stage: wgpu::PipelineStageDescriptor {
                module: &vs_module,
                entry_point: "main",
            },
            fragment_stage: Some(wgpu::PipelineStageDescriptor {
                module: &fs_module,
                entry_point: "main",
            }),
            rasterization_state: wgpu::RasterizationStateDescriptor {
                front_face: wgpu::FrontFace::Ccw,
                cull_mode: wgpu::CullMode::Back,
                depth_bias: 0,
                depth_bias_slope_scale: 0.0,
                depth_bias_clamp: 0.0,
            },
            //primitive_topology: wgpu::PrimitiveTopology::TriangleList,
            primitive_topology: wgpu::PrimitiveTopology::TriangleList,
            color_states: &[wgpu::ColorStateDescriptor {
                format: sc_desc.format,
                color_blend: wgpu::BlendDescriptor::REPLACE,
                alpha_blend: wgpu::BlendDescriptor::REPLACE,
                write_mask: wgpu::ColorWrite::ALL,
            }],
            depth_stencil_state: Some(wgpu::DepthStencilStateDescriptor {
                format: wgpu::TextureFormat::D32Float,
                depth_write_enabled: true,
                depth_compare: wgpu::CompareFunction::Less,
                stencil_front: wgpu::StencilStateFaceDescriptor::IGNORE,
                stencil_back: wgpu::StencilStateFaceDescriptor::IGNORE,
                stencil_read_mask: 0,
                stencil_write_mask: 0,
            }),
            index_format: wgpu::IndexFormat::Uint16,
            vertex_buffers: &[
                wgpu::VertexBufferDescriptor {
                    stride: vertex_size as wgpu::BufferAddress,
                    step_mode: wgpu::InputStepMode::Vertex,
                    attributes: &[
                        wgpu::VertexAttributeDescriptor {
                            format: wgpu::VertexFormat::Float4,
                            offset: 0,
                            shader_location: 0,
                        },
                        wgpu::VertexAttributeDescriptor {
                            format: wgpu::VertexFormat::Float2,
                            offset: 4 * 4,
                            shader_location: 1,
                        },
                    ],
                },
                wgpu::VertexBufferDescriptor {
                    stride: instance_size as wgpu::BufferAddress,
                    step_mode: wgpu::InputStepMode::Instance,
                    attributes: &[
                        wgpu::VertexAttributeDescriptor {
                            format: wgpu::VertexFormat::Float4,
                            offset: 0,
                            shader_location: 2,
                        },
                        wgpu::VertexAttributeDescriptor {
                            format: wgpu::VertexFormat::Float3,
                            offset: 4 * 3,
                            shader_location: 3,
                        },
                        wgpu::VertexAttributeDescriptor {
                            format: wgpu::VertexFormat::Float3,
                            offset: 4 * 3 + 4 * 3,
                            shader_location: 4,
                        },
                        wgpu::VertexAttributeDescriptor {
                            format: wgpu::VertexFormat::Float4,
                            offset: 4 * 3 + 4 * 3 + 4 * 3,
                            shader_location: 5,
                        },
                        wgpu::VertexAttributeDescriptor {
                            format: wgpu::VertexFormat::Float4,
                            offset: 4 * 3 + 4 * 3 + 4 * 3 + 4 * 4,
                            shader_location: 6,
                        },
                        wgpu::VertexAttributeDescriptor {
                            format: wgpu::VertexFormat::Float4,
                            offset: 4 * 3 + 4 * 3 + 4 * 3 + 4 * 4 + 4 * 4,
                            shader_location: 7,
                        },
                        wgpu::VertexAttributeDescriptor {
                            format: wgpu::VertexFormat::Float4,
                            offset: 4 * 3 + 4 * 3 + 4 * 3 + 4 * 4 + 4 * 4 + 4 * 4,
                            shader_location: 8,
                        },
                    ],
                },
            ],
            sample_count: 1,
        });
        pipeline
    };

    let instanced_mesh_pipeline = {
        let vs_bytes = load_glsl(include_str!("instanced_mesh.vert"), ShaderStage::Vertex);
        let fs_bytes = load_glsl(include_str!("shader.frag"), ShaderStage::Fragment);
        let vs_module = device.create_shader_module(&vs_bytes);
        let fs_module = device.create_shader_module(&fs_bytes);

        let pipeline = device.create_render_pipeline(&wgpu::RenderPipelineDescriptor {
            layout: &pipeline_layout,
            vertex_stage: wgpu::PipelineStageDescriptor {
                module: &vs_module,
                entry_point: "main",
            },
            fragment_stage: Some(wgpu::PipelineStageDescriptor {
                module: &fs_module,
                entry_point: "main",
            }),
            rasterization_state: wgpu::RasterizationStateDescriptor {
                front_face: wgpu::FrontFace::Ccw,
                cull_mode: wgpu::CullMode::Back,
                depth_bias: 0,
                depth_bias_slope_scale: 0.0,
                depth_bias_clamp: 0.0,
            },
            //primitive_topology: wgpu::PrimitiveTopology::TriangleList,
            primitive_topology: wgpu::PrimitiveTopology::TriangleList,
            color_states: &[wgpu::ColorStateDescriptor {
                format: sc_desc.format,
                color_blend: wgpu::BlendDescriptor::REPLACE,
                alpha_blend: wgpu::BlendDescriptor::REPLACE,
                write_mask: wgpu::ColorWrite::ALL,
            }],
            depth_stencil_state: Some(wgpu::DepthStencilStateDescriptor {
                format: wgpu::TextureFormat::D32Float,
                depth_write_enabled: true,
                depth_compare: wgpu::CompareFunction::Less,
                stencil_front: wgpu::StencilStateFaceDescriptor::IGNORE,
                stencil_back: wgpu::StencilStateFaceDescriptor::IGNORE,
                stencil_read_mask: 0,
                stencil_write_mask: 0,
            }),
            index_format: wgpu::IndexFormat::Uint32,
            vertex_buffers: &[
                wgpu::VertexBufferDescriptor {
                    stride: 3 * 4 as wgpu::BufferAddress,
                    step_mode: wgpu::InputStepMode::Vertex,
                    attributes: &[wgpu::VertexAttributeDescriptor {
                        format: wgpu::VertexFormat::Float3,
                        offset: 0,
                        shader_location: 0,
                    }],
                },
                wgpu::VertexBufferDescriptor {
                    stride: 4 * 4 * 4 as wgpu::BufferAddress,
                    step_mode: wgpu::InputStepMode::Instance,
                    attributes: &[
                        wgpu::VertexAttributeDescriptor {
                            format: wgpu::VertexFormat::Float4,
                            offset: 0,
                            shader_location: 1,
                        },
                        wgpu::VertexAttributeDescriptor {
                            format: wgpu::VertexFormat::Float4,
                            offset: 4 * 4,
                            shader_location: 2,
                        },
                        wgpu::VertexAttributeDescriptor {
                            format: wgpu::VertexFormat::Float4,
                            offset: 4 * 4 + 4 * 4,
                            shader_location: 3,
                        },
                        wgpu::VertexAttributeDescriptor {
                            format: wgpu::VertexFormat::Float4,
                            offset: 4 * 4 + 4 * 4 + 4 * 4,
                            shader_location: 4,
                        },
                    ],
                },
                wgpu::VertexBufferDescriptor {
                    stride: 3 * 4 as wgpu::BufferAddress,
                    step_mode: wgpu::InputStepMode::Vertex,
                    attributes: &[wgpu::VertexAttributeDescriptor {
                        format: wgpu::VertexFormat::Float3,
                        offset: 0,
                        shader_location: 5,
                    }],
                },
            ],
            sample_count: 1,
        });
        pipeline
    };

    // Create the render pipeline
    let mesh_pipeline = {
        let vs_bytes = load_glsl(include_str!("shader.vert"), ShaderStage::Vertex);
        let fs_bytes = load_glsl(include_str!("shader.frag"), ShaderStage::Fragment);
        let vs_module = device.create_shader_module(&vs_bytes);
        let fs_module = device.create_shader_module(&fs_bytes);

        let pipeline = device.create_render_pipeline(&wgpu::RenderPipelineDescriptor {
            layout: &pipeline_layout,
            vertex_stage: wgpu::PipelineStageDescriptor {
                module: &vs_module,
                entry_point: "main",
            },
            fragment_stage: Some(wgpu::PipelineStageDescriptor {
                module: &fs_module,
                entry_point: "main",
            }),
            rasterization_state: wgpu::RasterizationStateDescriptor {
                front_face: wgpu::FrontFace::Ccw,
                cull_mode: wgpu::CullMode::Back,
                depth_bias: 0,
                depth_bias_slope_scale: 0.0,
                depth_bias_clamp: 0.0,
            },
            //primitive_topology: wgpu::PrimitiveTopology::TriangleList,
            primitive_topology: wgpu::PrimitiveTopology::TriangleList,
            color_states: &[wgpu::ColorStateDescriptor {
                format: sc_desc.format,
                color_blend: wgpu::BlendDescriptor::REPLACE,
                alpha_blend: wgpu::BlendDescriptor::REPLACE,
                write_mask: wgpu::ColorWrite::ALL,
            }],
            depth_stencil_state: Some(wgpu::DepthStencilStateDescriptor {
                format: wgpu::TextureFormat::D32Float,
                depth_write_enabled: true,
                depth_compare: wgpu::CompareFunction::Less,
                stencil_front: wgpu::StencilStateFaceDescriptor::IGNORE,
                stencil_back: wgpu::StencilStateFaceDescriptor::IGNORE,
                stencil_read_mask: 0,
                stencil_write_mask: 0,
            }),
            index_format: wgpu::IndexFormat::Uint32,
            vertex_buffers: &[
                wgpu::VertexBufferDescriptor {
                    stride: 3 * 4 as wgpu::BufferAddress,
                    step_mode: wgpu::InputStepMode::Vertex,
                    attributes: &[wgpu::VertexAttributeDescriptor {
                        format: wgpu::VertexFormat::Float3,
                        offset: 0,
                        shader_location: 0,
                    }],
                },
                wgpu::VertexBufferDescriptor {
                    stride: 3 * 4 as wgpu::BufferAddress,
                    step_mode: wgpu::InputStepMode::Vertex,
                    attributes: &[wgpu::VertexAttributeDescriptor {
                        format: wgpu::VertexFormat::Float4,
                        offset: 0,
                        shader_location: 1,
                    }],
                },
            ],
            sample_count: 1,
        });
        pipeline
    };

    let mut depth_texture = create_depth_texture(&mut device, sc_desc.width, sc_desc.height);

    // Done
    let init_command_buf = init_encoder.finish();
    device.get_queue().submit(&[init_command_buf]);

    let load_time = load_timer.elapsed();
    let load_time = (load_time.as_secs() * 1_000) + (load_time.subsec_nanos() / 1_000_000) as u64;
    println!("Loaded in {}", load_time);
    info!("Entering render loop...");
    let mut running = true;
    let mut left_pressed = false;
    let mut right_pressed = false;
    let mut previousPosition: Option<LogicalPosition> = None;
    let mut yaw = 0.5;
    let mut pitch = 0.5;
    let mut view_length = 50.0;
    let mut previous_time = std::time::Instant::now();
    let x = 344.0 as f32;
    let y = 115.0 as f32;
    let z = 500.0 as f32;
    let mut center = cgmath::Vector3::new(x, y, z);
    let mut imgui_want_capture_mouse = false;
    let mut imgui_want_capture_keyboard = false;
    let mut selected: Vec<u64> = uploaded_sectors.iter().map(|sector| sector.sector_id).collect();
    while running {
        events_loop.poll_events(|event| {
            imgui_winit_support::handle_event(&mut imgui, &event, hidpi_factor, hidpi_factor);
            match &event {
                Event::WindowEvent { event, .. } => match event {
                    WindowEvent::Resized(size) => {
                        let physical = size.to_physical(hidpi_factor);
                        info!("Resizing to {:?}", physical);
                        sc_desc.width = physical.width.round() as u32;
                        sc_desc.height = physical.height.round() as u32;
                        swap_chain = device.create_swap_chain(&surface, &sc_desc);
                    }
                    WindowEvent::MouseWheel { delta, .. } => {
                        if imgui_want_capture_mouse {
                            return;
                        }
                        view_length -= match delta {
                            MouseScrollDelta::PixelDelta(p) => 0.01 * p.y as f32,
                            MouseScrollDelta::LineDelta(x, y) => *y,
                        };
                    }
                    WindowEvent::CursorMoved { position, .. } => {
                        //let deltaPosition = position - previousPosition;

                        if imgui_want_capture_mouse {
                            return;
                        }
                        match previousPosition {
                            Some(prev) => {
                                let deltaPosition = LogicalPosition {
                                    x: position.x - prev.x,
                                    y: position.y - prev.y,
                                };
                                if left_pressed {
                                    yaw = yaw - 0.01 * deltaPosition.x as f32;
                                    pitch = pitch - 0.01 * deltaPosition.y as f32;
                                    //resize(&sc_desc, &mut device);
                                }
                                if right_pressed {
                                    center.x += 0.1 * (yaw.sin() * deltaPosition.x as f32 + yaw.cos() * deltaPosition.y as f32);
                                    center.y -= 0.1 * (yaw.cos() * deltaPosition.x as f32 + yaw.sin() * deltaPosition.y as f32);
                                }
                            }
                            None => (),
                        }
                        previousPosition = Some(*position);
                    }
                    WindowEvent::MouseInput { state, button, .. } => {
                        if imgui_want_capture_mouse {
                            return;
                        }
                        match button {
                            MouseButton::Left => match state {
                                ElementState::Pressed => left_pressed = true,
                                ElementState::Released => left_pressed = false,
                            },
                            MouseButton::Right => match state {
                                ElementState::Pressed => right_pressed = true,
                                ElementState::Released => right_pressed = false,
                            },
                            _ => (),
                        }
                    },
                    WindowEvent::KeyboardInput {
                        input:
                            KeyboardInput {
                                virtual_keycode: Some(VirtualKeyCode::Escape),
                                state: ElementState::Pressed,
                                ..
                            },
                            ..
                    } => {
                        if imgui_want_capture_keyboard {
                            return;
                        }
                        running = false;
                    }
                    WindowEvent::CloseRequested => {
                        running = false;
                    }
                    _ => {}
                },
                _ => (),
            };
        });

        let frame = swap_chain.get_next_texture();
        let diff_time = previous_time.elapsed();
        previous_time = std::time::Instant::now();

        //println!(
            //"Frame time {}",
            //(diff_time.as_secs() * 1_000) + (diff_time.subsec_nanos() / 1_000_000) as u64
        //);
        //yaw += 0.01;
        {
            let mx_total =
                generate_matrix(sc_desc.width as f32 / sc_desc.height as f32, yaw, pitch, view_length, center);
            let mx_ref: &[f32; 16] = mx_total.as_ref();

            let temp_buf = device
                .create_buffer_mapped(16, wgpu::BufferUsage::TRANSFER_SRC)
                .fill_from_slice(mx_ref);

            let mut encoder =
                device.create_command_encoder(&wgpu::CommandEncoderDescriptor { todo: 0 });
            encoder.copy_buffer_to_buffer(&temp_buf, 0, &uniform_buf, 0, 64);
            device.get_queue().submit(&[encoder.finish()]);
        }
        depth_texture = create_depth_texture(&mut device, sc_desc.width, sc_desc.height);

        let mut encoder =
            device.create_command_encoder(&wgpu::CommandEncoderDescriptor { todo: 0 });
        {
            let mut rpass = encoder.begin_render_pass(&wgpu::RenderPassDescriptor {
                color_attachments: &[wgpu::RenderPassColorAttachmentDescriptor {
                    attachment: &frame.view,
                    resolve_target: None,
                    load_op: wgpu::LoadOp::Clear,
                    store_op: wgpu::StoreOp::Store,
                    clear_color: wgpu::Color {
                        r: 0.1,
                        g: 0.2,
                        b: 0.3,
                        a: 1.0,
                    },
                }],
                depth_stencil_attachment: Some(wgpu::RenderPassDepthStencilAttachmentDescriptor {
                    attachment: &depth_texture,
                    depth_load_op: wgpu::LoadOp::Clear,
                    depth_store_op: wgpu::StoreOp::Store,
                    stencil_load_op: wgpu::LoadOp::Clear,
                    stencil_store_op: wgpu::StoreOp::Store,
                    clear_depth: 1.0,
                    clear_stencil: 0,
                }),
            });
// Tree
//- 0
 //- 64
  //- 96
   //- 112
    //- 120
     //- 124
      //- 126
      //- 125
     //- 121
      //- 123
      //- 122
    //- 113
     //- 117
      //- 119
      //- 118
     //- 114
      //- 116
      //- 115
   //- 97
    //- 105
     //- 109
      //- 111
      //- 110
     //- 106
      //- 108
      //- 107
            //let normal_sectors = vec![0, 1, 2];
            //let face_sectors = vec![3, 18, 64];
            //let normal_sectors = vec![0, 1, 2];
            //let normal_sectors = vec![0, 64];
            //let face_sectors = vec![1, 65, 96];

            let mut draw_styles = DrawStyles {
                faces: Vec::new(),
                primitives: Vec::new(),
            };
            make_drawing_rule(&DrawRule::Primitives, &sector_tree, &selected, sector_tree.root, &mut draw_styles);

            for sector in &drawable_sectors {
                if draw_styles.primitives.contains(&sector.sector_id) {
                    {
                        rpass.set_pipeline(&mesh_pipeline);
                        rpass.set_bind_group(0, &green_bind_group, &[]);
                        for mesh in &sector.meshes {
                            let index_buf = &ctm_cache[&mesh.file_id].index_buf;
                            let vertex_buf = &ctm_cache[&mesh.file_id].vertex_buf;
                            let color_buf = &sector.triangle_mesh_color_bufs[&mesh.file_id];
                            //let index_count = mesh.index_count;
                            let index_range = mesh.index_range.clone();

                            rpass.set_index_buffer(&index_buf, 0);
                            rpass.set_vertex_buffers(&[(&vertex_buf, 0), (&color_buf, 0)]);
                            rpass.draw_indexed(index_range, 0, 0..1);
                        }
                    }

                    {
                        rpass.set_pipeline(&instanced_mesh_pipeline);
                        rpass.set_bind_group(0, &green_bind_group, &[]);
                        for instanced_mesh in &sector.instanced_meshes {
                            let index_buf = &instanced_mesh.index_buf;
                            let index_count = instanced_mesh.index_count;
                            let vertex_buf = &instanced_mesh.vertex_buf;
                            let instance_buf = &instanced_mesh.instance_buf;
                            let instance_count = instanced_mesh.instance_count;
                            let color_buf = &instanced_mesh.color_buf;

                            rpass.set_index_buffer(&index_buf, 0);
                            rpass.set_vertex_buffers(&[(&vertex_buf, 0), (&instance_buf, 0), (&color_buf, 0)]);
                            rpass.draw_indexed(0..index_count as u32, 0, 0..instance_count as u32);
                        }
                    }

                    {
                        rpass.set_pipeline(&boxes_pipeline);
                        rpass.set_bind_group(0, &green_bind_group, &[]);

                        let boxes = &sector.primitives;
                        let index_buf = &boxes.index_buf;
                        let index_count = boxes.index_count;
                        let vertex_buf = &boxes.vertex_buf;
                        let instance_buf = &boxes.instance_buf;
                        let instance_count = boxes.instance_count;

                        rpass.set_index_buffer(&index_buf, 0);
                        rpass.set_vertex_buffers(&[(&vertex_buf, 0), (&instance_buf, 0)]);
                        rpass.draw_indexed(0..index_count as u32, 0, 0..instance_count as u32);
                    }
                }

                if draw_styles.faces.contains(&sector.sector_id) {
                    {
                        rpass.set_pipeline(&faces_pipeline);
                        rpass.set_bind_group(0, &red_bind_group, &[]);

                        let boxes = &sector.faces;
                        let index_buf = &boxes.index_buf;
                        let index_count = boxes.index_count;
                        let vertex_buf = &boxes.vertex_buf;
                        let instance_buf = &boxes.instance_buf;
                        let instance_count = boxes.instance_count;

                        rpass.set_index_buffer(&index_buf, 0);
                        rpass.set_vertex_buffers(&[(&vertex_buf, 0), (&instance_buf, 0)]);
                        rpass.draw_indexed(0..index_count as u32, 0, 0..instance_count as u32);
                    }
                }
            }
        }
        device.get_queue().submit(&[encoder.finish()]);

        { // imgui
            let now = Instant::now();
            let delta = now - last_frame;
            let delta_s = delta.as_secs() as f32 + delta.subsec_nanos() as f32 / 1_000_000_000.0;
            last_frame = now;

            imgui_winit_support::update_mouse_cursor(&imgui, &window);

            let frame_size = imgui_winit_support::get_frame_size(&window, hidpi_factor).unwrap();
            let ui = imgui.frame(frame_size, delta_s);
            imgui_want_capture_mouse = ui.want_capture_mouse();
            imgui_want_capture_keyboard = ui.want_capture_mouse();
            {
                ui.window(im_str!("Reveal debug viewer"))
                    .size((300.0, 600.0), ImGuiCond::FirstUseEver)
                    .build(|| {
                        ui.separator();
                        let mouse_pos = ui.imgui().mouse_pos();
                        ui.text(im_str!(
                                "Mouse Position: ({:.1},{:.1})",
                                mouse_pos.0,
                                mouse_pos.1
                        ));
                        if ui.small_button(im_str!("Make all selected!")) {
                            selected = uploaded_sectors.iter().map(|sector| sector.sector_id).collect();
                        }
                        selected = make_node(&ui, &sector_tree, sector_tree.root, &selected);
                        ui.tree_node(im_str!("Root")).build(|| {
                            for i in 0..5 {
                                ui.tree_node(im_str!("Child {}", i)).build(|| {
                                    ui.text(im_str!("blah blah"));
                                    ui.same_line(0.0);
                                });
                            }
                        });
                    });

                //ui.window(im_str!("Hello too"))
                    //.position((300.0, 300.0), ImGuiCond::FirstUseEver)
                    //.size((400.0, 200.0), ImGuiCond::FirstUseEver)
                    //.build(|| {
                        //ui.text(im_str!("Hello world!"));
                    //});

                //ui.show_demo_window(&mut demo_open);
            }

            let mut encoder: wgpu::CommandEncoder =
                device.create_command_encoder(&wgpu::CommandEncoderDescriptor { todo: 0 });

            renderer
                .render(ui, &mut device, &mut encoder, &frame.view)
                .expect("Rendering failed");

            device.get_queue().submit(&[encoder.finish()]);
        }

        running &= !cfg!(feature = "metal-auto-capture");
    }
    Ok(())
}

fn make_node(ui: &imgui::Ui, sector_tree: &SectorTree, node: u64, selected: &Vec<u64>) -> Vec<u64> {
    let mut result = Vec::new();
    ui.tree_node(im_str!("Children of {}", node)).opened(true, imgui::ImGuiCond::Always).build(|| {
        let mut checked = selected.contains(&node);
        ui.checkbox(im_str!("Render {} as faces", node), &mut checked);
        if checked {
            result.push(node);
        }
        let next = match sector_tree.nodes.get(&node) {
            Some(x) => x.clone(),
            None => return, // TODO make error
        };

        for child in &next.children {
            result.append(&mut make_node(&ui, sector_tree, *child, selected));
        }
    });
    return result;
}

enum DrawRule {
    Faces,
    Primitives,
    NoDraw,
}

struct DrawStyles {
    faces: Vec<u64>,
    primitives: Vec<u64>,
}

fn make_drawing_rule(parent_rule: &DrawRule, sector_tree: &SectorTree, selected: &Vec<u64>, node: u64, draw_styles: &mut DrawStyles) {
    let rule = match parent_rule {
        DrawRule::Faces => DrawRule::NoDraw,
        DrawRule::Primitives => match selected.contains(&node) {
            true => DrawRule::Faces,
            false => DrawRule::Primitives,
        },
        DrawRule::NoDraw => DrawRule::NoDraw,
    };
    match &rule {
        DrawRule::Faces => draw_styles.faces.push(node),
        DrawRule::Primitives => draw_styles.primitives.push(node),
        _ => {}
    };
    let next = match sector_tree.nodes.get(&node) {
        Some(x) => x.clone(),
        None => return, // TODO make error
    };

    for child in &next.children {
        make_drawing_rule(&rule, sector_tree, selected, *child, draw_styles);
    }
}
