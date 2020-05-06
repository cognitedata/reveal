use std::io::BufReader;

#[test]
fn parse_file() {
    let file = std::fs::File::open("tests/files/primitives.i3d").unwrap();
    let reader = BufReader::new(file);
    let file_sector = i3df::parse_sector(reader).unwrap();
    let _renderable_sector = i3df::renderables::convert_sector(&file_sector);
    // TODO verify contents of file
}
