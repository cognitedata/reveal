/*!
 * Copyright 2022 Cognite AS
 */

pub fn add_three(input: u32) -> u32 {
    input + 3
}

#[cfg(test)]
mod tests {

    use super::add_three;

    use wasm_bindgen_test::wasm_bindgen_test;

    wasm_bindgen_test::wasm_bindgen_test_configure!(run_in_browser);

    #[wasm_bindgen_test]
    fn assert_adds_three() {
        assert_eq!(add_three(2), 5);
        assert_eq!(add_three(8), 11);
        assert_eq!(add_three(20), 23);
    }
}
