// Allow unreadable literals to make it easier to copy-paste numbers into the source code for
// testing
#![allow(clippy::unreadable_literal)]

use openctm::{parse, TextureCoordinate, UvMap, Vertex};

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn box_ctm() {
        let reader = parse(std::io::BufReader::new(
            std::fs::File::open("tests/box.ctm").unwrap(),
        ))
        .unwrap();

        let vertices = vec![
            Vertex {
                x: -19.68505,
                y: -19.68505,
                z: -19.685051,
            },
            Vertex {
                x: 19.68505,
                y: -19.68505,
                z: -19.685051,
            },
            Vertex {
                x: 19.68505,
                y: -19.685051,
                z: 19.68505,
            },
            Vertex {
                x: -19.68505,
                y: -19.685051,
                z: 19.68505,
            },
            Vertex {
                x: -19.68505,
                y: 19.685051,
                z: -19.68505,
            },
            Vertex {
                x: 19.68505,
                y: 19.685051,
                z: -19.68505,
            },
            Vertex {
                x: 19.68505,
                y: 19.68505,
                z: 19.685051,
            },
            Vertex {
                x: -19.68505,
                y: 19.68505,
                z: 19.685051,
            },
            Vertex {
                x: -19.68505,
                y: -19.68505,
                z: -19.685051,
            },
            Vertex {
                x: -19.68505,
                y: -19.68505,
                z: -19.685051,
            },
            Vertex {
                x: 19.68505,
                y: -19.68505,
                z: -19.685051,
            },
            Vertex {
                x: -19.68505,
                y: 19.685051,
                z: -19.68505,
            },
            Vertex {
                x: -19.68505,
                y: 19.685051,
                z: -19.68505,
            },
            Vertex {
                x: 19.68505,
                y: 19.685051,
                z: -19.68505,
            },
        ];

        let indices = vec![
            0 as u32, 1, 3, 1, 2, 3, 2, 6, 7, 2, 7, 3, 2, 10, 6, 3, 7, 11, 3, 11, 9, 4, 5, 8, 5, 6,
            10, 5, 10, 8, 6, 13, 7, 7, 13, 12,
        ];
        let uv_maps = vec![UvMap {
            name: "Diffuse color".into(),
            file_name: "".into(),
            coordinates: vec![
                TextureCoordinate { u: 0.25, v: 0.5 },
                TextureCoordinate { u: 0.5, v: 0.25 },
                TextureCoordinate { u: 1.0, v: 0.75 },
                TextureCoordinate { u: 0.5, v: 0.25 },
                TextureCoordinate { u: 1.0, v: 0.0 },
                TextureCoordinate { u: 0.75, v: 0.0 },
                TextureCoordinate { u: 0.25, v: 0.5 },
                TextureCoordinate { u: 0.0, v: 0.0 },
                TextureCoordinate {
                    u: 0.3333333,
                    v: 0.3333333,
                },
                TextureCoordinate {
                    u: 0.6666667,
                    v: 0.6666667,
                },
                TextureCoordinate {
                    u: 0.6666667,
                    v: 0.6666667,
                },
                TextureCoordinate {
                    u: 0.3333333,
                    v: 0.3333333,
                },
                TextureCoordinate {
                    u: 0.3333333,
                    v: 0.6666667,
                },
                TextureCoordinate { u: 1.0, v: 1.0 },
            ],
        }];

        assert_eq!(reader.get_vertices(), vertices);
        assert_eq!(reader.indices, indices);
        assert_eq!(reader.uv_maps, uv_maps);
    }
}
