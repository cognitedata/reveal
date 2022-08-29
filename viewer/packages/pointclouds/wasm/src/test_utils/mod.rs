/// Takes a u32, perturbs it, and scales it down to a
/// number between -1.0
pub fn normalize_coordinate(a: u32) -> f64 {
    const COORD_GRANULARITY: i32 = 100_000;

    ((a % (COORD_GRANULARITY as u32)) as f64 / (COORD_GRANULARITY as f64)) * 2.0 - 1.0
}
