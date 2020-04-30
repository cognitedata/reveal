use clap::clap_app;
use i3df;
use log::info;
use nalgebra;
use openctm;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::error::Error;
use std::fs::File;
use std::io::prelude::*;
use std::mem;
use std::path::Path;
use winit::{
    dpi::PhysicalPosition,
    event::{self, WindowEvent},
    event::{ElementState, MouseButton, MouseScrollDelta},
    event_loop::{ControlFlow, EventLoop},
    window::Window,
};

mod data;
mod pipelines;

use data::meshes::Meshes;

#[cfg_attr(rustfmt, rustfmt_skip)]
pub const OPENGL_TO_WGPU_MATRIX: cgmath::Matrix4<f32> = cgmath::Matrix4::new(
    1.0, 0.0, 0.0, 0.0,
    0.0, 1.0, 0.0, 0.0, // TODO should this not be -1.0? Look at wgpu-rs examples to verify...
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
    _matrix: nalgebra::Matrix4<f32>,
    _color: [u8; 4],
}

pub struct Instances {
    geometry: Geometry,
    instance_buf: wgpu::Buffer,
    instance_count: usize,
}

// TODO split into one version with the vertices and indices and one with the buffers
pub struct CtmData {
    indices: Vec<u32>,
    vertices: Vec<openctm::Vertex>,
    vertex_buf: wgpu::Buffer,
    index_buf: wgpu::Buffer,
}

struct Geometry {
    index_count: usize,
    vertex_buf: wgpu::Buffer,
    index_buf: wgpu::Buffer,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "PascalCase")]
struct ParentId {
    value: u64,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
struct UploadedScene {
    version: u64,
    sectors: Vec<UploadedSector>,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
struct IndexFile {
    file_name: String,
    peripheral_files: Vec<String>,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
struct FacesFile {
    file_name: Option<String>,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
struct UploadedSector {
    id: u64,
    path: String,
    depth: u64,
    parent_id: i64,
    index_file: IndexFile,
    faces_file: FacesFile,
}

#[derive(Clone, Debug)]
struct Sector {
    f3df_filename: Option<String>,
    sector_id: u64,
    i3df_filename: String,
    parent_id: Option<u64>,
    depth: u64,
}

struct DrawableSector {
    faces: Option<Instances>,
    primitives: Option<Instances>,
    meshes: Meshes,
    instanced_meshes: Vec<data::instanced_meshes::LoadedInstancedMesh>,
}

fn vertex(pos: [f32; 3], tc: [i8; 2]) -> Vertex {
    Vertex {
        _pos: [pos[0] as f32, pos[1] as f32, pos[2] as f32, 1.0],
        _tex_coord: [tc[0] as f32, tc[1] as f32],
    }
}

fn create_depth_texture(device: &wgpu::Device, width: u32, height: u32) -> wgpu::TextureView {
    let depth_texture = device.create_texture(&wgpu::TextureDescriptor {
        size: wgpu::Extent3d {
            width,
            height,
            depth: 1,
        },
        mip_level_count: 1,
        sample_count: 1,
        dimension: wgpu::TextureDimension::D2,
        format: wgpu::TextureFormat::Depth32Float,
        usage: wgpu::TextureUsage::OUTPUT_ATTACHMENT,
        label: None,
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

fn generate_matrix(
    aspect_ratio: f32,
    yaw: f32,
    pitch: f32,
    view_length: f32,
    center: cgmath::Vector3<f32>,
) -> cgmath::Matrix4<f32> {
    let mx_projection = cgmath::perspective(cgmath::Deg(70f32), aspect_ratio, 1.0, 10000.0);
    let px = view_length * yaw.cos() * pitch.sin();
    let py = view_length * yaw.sin() * pitch.sin();
    let pz = view_length * pitch.cos();

    let x = center.x;
    let y = center.y;
    let z = center.z;

    let mx_view = cgmath::Matrix4::look_at(
        cgmath::Point3::new(x + px, y + py, z + pz),
        cgmath::Point3::new(x, y, z),
        cgmath::Vector3::unit_z(),
    );

    let mx_correction = OPENGL_TO_WGPU_MATRIX;

    mx_correction * mx_projection * mx_view
}

fn create_face_vertices() -> (Vec<Vertex>, Vec<u16>) {
    let vertex_data = [
        vertex([-0.5, -0.5, 0.0], [0, 0]),
        vertex([0.5, -0.5, 0.0], [1, 0]),
        vertex([0.5, 0.5, 0.0], [1, 1]),
        vertex([-0.5, 0.5, 0.0], [0, 1]),
    ];

    let index_data: &[u16] = &[0, 1, 2, 2, 3, 0];

    (vertex_data.to_vec(), index_data.to_vec())
}

fn main() -> Result<(), Box<dyn Error>> {
    run()?;
    Ok(())
}

fn create_buffer_from<T>(
    device: &wgpu::Device,
    data: &Vec<T>,
    usage: wgpu::BufferUsage,
) -> wgpu::Buffer {
    device.create_buffer_with_data(
        unsafe {
            std::slice::from_raw_parts(
                data.as_ptr() as *const T as *const u8,
                data.len() * std::mem::size_of::<T>(),
            )
            .clone()
        },
        usage,
    )
}

fn run() -> Result<(), Box<dyn Error>> {
    println!("Started!");

    let event_loop = EventLoop::new();
    let mut builder = winit::window::WindowBuilder::new();
    builder = builder.with_title("Reveal debug viewer");

    info!("Initializing the window...");

    let window = builder.build(&event_loop).unwrap();

    #[cfg(not(target_arch = "wasm32"))]
    {
        env_logger::init();
        futures::executor::block_on(run_async(event_loop, window))?;
    }
    #[cfg(target_arch = "wasm32")]
    {
        std::panic::set_hook(Box::new(console_error_panic_hook::hook));
        console_log::init().expect("could not initialize logger");
        use winit::platform::web::WindowExtWebSys;
        // On wasm, append the canvas to the document body
        web_sys::window()
            .and_then(|win| win.document())
            .and_then(|doc| doc.body())
            .and_then(|body| {
                body.append_child(&web_sys::Element::from(window.canvas()))
                    .ok()
            })
            .expect("couldn't append canvas to document body");
        wasm_bindgen_futures::spawn_local(run_async::<E>(event_loop, window));
    }

    Ok(())
}

async fn run_async(event_loop: EventLoop<()>, window: Window) -> Result<(), Box<dyn Error>> {
    let (size, surface) = {
        let size = window.inner_size();
        let surface = wgpu::Surface::create(&window);
        (size, surface)
    };
    let adapter = wgpu::Adapter::request(
        &wgpu::RequestAdapterOptions {
            power_preference: wgpu::PowerPreference::Default,
            compatible_surface: Some(&surface),
        },
        wgpu::BackendBit::PRIMARY,
    )
    .await
    .unwrap();

    let (device, queue) = adapter
        .request_device(&wgpu::DeviceDescriptor {
            extensions: wgpu::Extensions {
                anisotropic_filtering: false,
            },
            limits: wgpu::Limits::default(),
        })
        .await;

    let mut sc_desc = wgpu::SwapChainDescriptor {
        usage: wgpu::TextureUsage::OUTPUT_ATTACHMENT,
        // TODO: Allow srgb unconditionally
        format: if cfg!(target_arch = "wasm32") {
            wgpu::TextureFormat::Bgra8Unorm
        } else {
            wgpu::TextureFormat::Bgra8UnormSrgb
        },
        width: size.width,
        height: size.height,
        present_mode: wgpu::PresentMode::Mailbox,
    };
    let mut swap_chain = device.create_swap_chain(&surface, &sc_desc);

    let matches = clap_app!(("reveal-viewer") =>
        (@arg folder: +takes_value)
    )
    .get_matches();

    let folder = matches.value_of("folder").unwrap();
    let folder_path = Path::new(folder);
    let load_timer = std::time::Instant::now();
    let scene = {
        let path = folder_path.join("scene.json");
        let mut contents = String::new();
        File::open(path)?.read_to_string(&mut contents)?;
        serde_json::from_str::<UploadedScene>(&contents)?
    };

    let (uploaded_sectors, ctm_cache) = {
        let mut sectors = Vec::new();
        let mut ctm_cache = HashMap::new();
        for sector in &scene.sectors {
            let &UploadedSector {
                parent_id,
                id: sector_id,
                depth,
                ..
            } = sector;
            let i3df_filename = sector.index_file.file_name.clone();
            let f3df_filename: Option<String> = sector.faces_file.file_name.clone();
            for filename in &sector.index_file.peripheral_files {
                if ctm_cache.contains_key(filename) {
                    continue;
                }
                println!("Loading {}", filename);
                // TODO move to mesh parsing below
                let reader = openctm::parse(std::io::BufReader::new(
                    std::fs::File::open(folder_path.join(filename)).unwrap(),
                ))?;

                let (vertex_data, index_data) = (&reader.vertices, &reader.indices);
                let vertex_buf =
                    create_buffer_from(&device, &vertex_data, wgpu::BufferUsage::VERTEX);
                let index_buf = create_buffer_from(&device, &index_data, wgpu::BufferUsage::INDEX);

                ctm_cache.insert(
                    filename.clone(),
                    CtmData {
                        indices: reader.indices,
                        vertices: reader.vertices,
                        vertex_buf,
                        index_buf,
                    },
                );
            }
            sectors.push(Sector {
                i3df_filename,
                f3df_filename,
                parent_id: if parent_id == -1 {
                    None
                } else {
                    Some(parent_id as u64)
                },
                sector_id,
                depth,
            });
        }

        (sectors, ctm_cache)
    };

    let mut instanced_meshes: HashMap<String, data::instanced_meshes::InstancedMesh> =
        HashMap::new();
    let mut drawable_sectors: Vec<DrawableSector> = Vec::new();
    println!("Sector count: {}", uploaded_sectors.len());
    for sector in &uploaded_sectors {
        let faces = {
            if let Some(filename) = &sector.f3df_filename {
                let f3df_path = folder_path.join(&filename);
                println!("Loading {:?}", &f3df_path);
                let parsed_sector = f3df::parse_sector(File::open(&f3df_path)?)?;
                let f3df_sector = f3df::renderables::convert_sector(&parsed_sector);
                data::faces::create_faces(&device, &f3df_sector)
            } else {
                None
            }
        };

        // I3DF
        println!("Parsing I3DF");

        let i3df_path = folder_path.join(&sector.i3df_filename);
        println!("Loading {:?}", &i3df_path);
        let mut reader = std::io::BufReader::new(File::open(i3df_path).unwrap());
        let i3df_file_sector = i3df::parse_sector(&mut reader).unwrap();
        println!("Loading data from I3DF");
        let i3df_sector = i3df::renderables::convert_sector(&i3df_file_sector);

        let primitives = data::primitives::create_primitives(&device, &i3df_sector);
        let meshes = data::meshes::create_meshes(&device, &i3df_sector);
        let loaded_instanced_meshes = data::instanced_meshes::create_instanced_meshes(
            &device,
            &i3df_sector,
            &ctm_cache,
            &mut instanced_meshes,
        );

        drawable_sectors.push(DrawableSector {
            faces,
            primitives,
            meshes,
            instanced_meshes: loaded_instanced_meshes,
        });
    }

    info!("Initializing the example...");

    let init_encoder =
        device.create_command_encoder(&wgpu::CommandEncoderDescriptor { label: None });

    // Create pipeline layout
    let bind_group_layout = device.create_bind_group_layout(&wgpu::BindGroupLayoutDescriptor {
        label: None,
        bindings: &[
            wgpu::BindGroupLayoutEntry {
                binding: 0,
                visibility: wgpu::ShaderStage::VERTEX,
                ty: wgpu::BindingType::UniformBuffer { dynamic: false },
            },
            wgpu::BindGroupLayoutEntry {
                binding: 1,
                visibility: wgpu::ShaderStage::FRAGMENT,
                ty: wgpu::BindingType::UniformBuffer { dynamic: false },
            },
        ],
    });
    // Create the texture
    let mx_total = generate_matrix(
        sc_desc.width as f32 / sc_desc.height as f32,
        0.0,
        0.0,
        0.0,
        cgmath::Vector3::new(0.0, 0.0, 0.0),
    );
    let mx_ref: &[f32; 16] = mx_total.as_ref();
    let uniform_buf = create_buffer_from(
        &device,
        &mx_ref.to_vec(),
        wgpu::BufferUsage::UNIFORM | wgpu::BufferUsage::COPY_DST,
    );

    let green_buffer = create_buffer_from(
        &device,
        &[0.0 as f32, 1.0, 0.0, 1.0].to_vec(),
        wgpu::BufferUsage::UNIFORM | wgpu::BufferUsage::COPY_DST,
    );

    let red_buffer = create_buffer_from(
        &device,
        &[1.0 as f32, 0.0, 0.0, 1.0].to_vec(),
        wgpu::BufferUsage::UNIFORM | wgpu::BufferUsage::COPY_DST,
    );

    // Create bind group
    let green_bind_group = device.create_bind_group(&wgpu::BindGroupDescriptor {
        label: None,
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
        label: None,
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

    let faces_pipeline =
        pipelines::faces_pipeline::create_faces_pipeline(&device, &bind_group_layout, &sc_desc)?;
    let primitives_pipeline = pipelines::primitives_pipeline::create_primitives_pipeline(
        &device,
        &bind_group_layout,
        &sc_desc,
    )?;
    let mesh_pipeline =
        pipelines::mesh_pipeline::create_mesh_pipeline(&device, &bind_group_layout, &sc_desc)?;
    let instanced_mesh_pipeline =
        pipelines::instanced_mesh_pipeline::create_instanced_mesh_pipeline(
            &device,
            &bind_group_layout,
            &sc_desc,
        )?;

    let mut depth_texture = create_depth_texture(&device, sc_desc.width, sc_desc.height);

    // Done
    let init_command_buf = init_encoder.finish();
    queue.submit(&[init_command_buf]);

    let load_time = load_timer.elapsed();
    let load_time = (load_time.as_secs() * 1_000) + (load_time.subsec_nanos() / 1_000_000) as u64;
    println!("Loaded in {}", load_time);
    info!("Entering render loop...");
    let mut left_pressed = false;
    let mut right_pressed = false;
    let mut previous_position: Option<PhysicalPosition<f64>> = None;
    let mut yaw = 0.5;
    let mut pitch = 0.5;
    let mut view_length = 50.0;
    let mut previous_time = std::time::Instant::now();
    let x = 0.0 as f32;
    let y = 0.0 as f32;
    let z = 0.0 as f32;
    //let x = 344.0 as f32;
    //let y = 115.0 as f32;
    //let z = 500.0 as f32;
    let mut center = cgmath::Vector3::new(x, y, z);
    let mut draw_indexed = true;

    event_loop.run(move |event, _, control_flow| {
        *control_flow = if cfg!(feature = "metal-auto-capture") {
            ControlFlow::Exit
        } else {
            ControlFlow::Poll
        };
        match &event {
            event::Event::WindowEvent { event, .. } => match event {
                WindowEvent::Resized(size) => {
                    info!("Resizing to {:?}", size);
                    sc_desc.width = size.width;
                    sc_desc.height = size.height;
                    swap_chain = device.create_swap_chain(&surface, &sc_desc);
                }
                WindowEvent::MouseWheel { delta, .. } => {
                    view_length -= match delta {
                        MouseScrollDelta::PixelDelta(p) => 0.01 * p.y as f32,
                        MouseScrollDelta::LineDelta(_, y) => *y,
                    };
                }
                WindowEvent::CursorMoved { position, .. } => {
                    match previous_position {
                        Some(prev) => {
                            let delta_position = PhysicalPosition {
                                x: position.x - prev.x,
                                y: position.y - prev.y,
                            };
                            if left_pressed {
                                yaw = yaw - 0.01 * delta_position.x as f32;
                                pitch = pitch - 0.01 * delta_position.y as f32;
                                //resize(&sc_desc, &mut device);
                            }
                            if right_pressed {
                                center.x += 0.1
                                    * (yaw.sin() * delta_position.x as f32
                                        + yaw.cos() * delta_position.y as f32);
                                center.y -= 0.1
                                    * (yaw.cos() * delta_position.x as f32
                                        + yaw.sin() * delta_position.y as f32);
                            }
                        }
                        None => (),
                    }
                    previous_position = Some(*position);
                }
                WindowEvent::MouseInput { state, button, .. } => match button {
                    MouseButton::Left => match state {
                        ElementState::Pressed => left_pressed = true,
                        ElementState::Released => left_pressed = false,
                    },
                    MouseButton::Right => match state {
                        ElementState::Pressed => right_pressed = true,
                        ElementState::Released => right_pressed = false,
                    },
                    _ => (),
                },
                WindowEvent::KeyboardInput {
                    input:
                        event::KeyboardInput {
                            virtual_keycode,
                            state: ElementState::Pressed,
                            ..
                        },
                    ..
                } => match virtual_keycode {
                    Some(code) => match code {
                        event::VirtualKeyCode::Escape => *control_flow = ControlFlow::Exit,
                        event::VirtualKeyCode::Return => draw_indexed = !draw_indexed,
                        _ => {}
                    },
                    None => {}
                },
                WindowEvent::CloseRequested => {
                    *control_flow = ControlFlow::Exit;
                }
                _ => {}
            },
            event::Event::MainEventsCleared => {
                let frame = swap_chain.get_next_texture().unwrap();
                previous_time = std::time::Instant::now();

                {
                    let mx_total = generate_matrix(
                        sc_desc.width as f32 / sc_desc.height as f32,
                        yaw,
                        pitch,
                        view_length,
                        center,
                    );
                    let mx_ref: &[f32; 16] = mx_total.as_ref();

                    let temp_buf =
                        create_buffer_from(&device, &mx_ref.to_vec(), wgpu::BufferUsage::COPY_SRC);

                    let mut encoder = device
                        .create_command_encoder(&wgpu::CommandEncoderDescriptor { label: None });
                    encoder.copy_buffer_to_buffer(&temp_buf, 0, &uniform_buf, 0, 64);
                    queue.submit(&[encoder.finish()]);
                }
                depth_texture = create_depth_texture(&device, sc_desc.width, sc_desc.height);

                let mut encoder =
                    device.create_command_encoder(&wgpu::CommandEncoderDescriptor { label: None });
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
                        depth_stencil_attachment: Some(
                            wgpu::RenderPassDepthStencilAttachmentDescriptor {
                                attachment: &depth_texture,
                                depth_load_op: wgpu::LoadOp::Clear,
                                depth_store_op: wgpu::StoreOp::Store,
                                stencil_load_op: wgpu::LoadOp::Clear,
                                stencil_store_op: wgpu::StoreOp::Store,
                                clear_depth: 1.0,
                                clear_stencil: 0,
                            },
                        ),
                    });

                    for sector in &drawable_sectors {
                        if draw_indexed {
                            {
                                rpass.set_pipeline(&mesh_pipeline);
                                rpass.set_bind_group(0, &green_bind_group, &[]);
                                for mesh in &sector.meshes.meshes {
                                    let ctm_data =
                                        &ctm_cache[&format!("mesh_{}.ctm", &mesh.file_id)];
                                    let index_buf = &ctm_data.index_buf;
                                    let vertex_buf = &ctm_data.vertex_buf;
                                    let color_buf =
                                        &sector.meshes.triangle_mesh_color_bufs[&mesh.file_id];
                                    //let index_count = mesh.index_count;
                                    let index_range = mesh.index_range.clone();

                                    rpass.set_index_buffer(index_buf, 0, 0);
                                    rpass.set_vertex_buffer(0, vertex_buf, 0, 0);
                                    rpass.set_vertex_buffer(1, color_buf, 0, 0);
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

                                    rpass.set_index_buffer(&index_buf, 0, 0);
                                    rpass.set_vertex_buffer(0, &vertex_buf, 0, 0);
                                    rpass.set_vertex_buffer(1, &instance_buf, 0, 0);
                                    rpass.set_vertex_buffer(2, &color_buf, 0, 0);
                                    rpass.draw_indexed(
                                        0..index_count as u32,
                                        0,
                                        0..instance_count as u32,
                                    );
                                }
                            }

                            if let Some(boxes) = &sector.primitives {
                                rpass.set_pipeline(&primitives_pipeline);
                                rpass.set_bind_group(0, &green_bind_group, &[]);

                                let index_buf = &boxes.geometry.index_buf;
                                let index_count = boxes.geometry.index_count;
                                let vertex_buf = &boxes.geometry.vertex_buf;
                                let instance_buf = &boxes.instance_buf;
                                let instance_count = boxes.instance_count;

                                rpass.set_index_buffer(&index_buf, 0, 0);
                                rpass.set_vertex_buffer(0, &vertex_buf, 0, 0);
                                rpass.set_vertex_buffer(1, &instance_buf, 0, 0);
                                rpass.draw_indexed(
                                    0..index_count as u32,
                                    0,
                                    0..instance_count as u32,
                                );
                            }
                        } else {
                            if let Some(boxes) = &sector.faces {
                                rpass.set_pipeline(&faces_pipeline);
                                rpass.set_bind_group(0, &red_bind_group, &[]);

                                let index_buf = &boxes.geometry.index_buf;
                                let index_count = boxes.geometry.index_count;
                                let vertex_buf = &boxes.geometry.vertex_buf;
                                let instance_buf = &boxes.instance_buf;
                                let instance_count = boxes.instance_count;

                                rpass.set_index_buffer(&index_buf, 0, 0);
                                rpass.set_vertex_buffer(0, &vertex_buf, 0, 0);
                                rpass.set_vertex_buffer(1, &instance_buf, 0, 0);
                                rpass.draw_indexed(
                                    0..index_count as u32,
                                    0,
                                    0..instance_count as u32,
                                );
                            }
                        }
                    }
                }
                queue.submit(&[encoder.finish()]);
            }
            _ => (),
        };
    });
}
