use std::fmt;
use wasm_bindgen::prelude::*;

// TODO dragly 2019-10-12 figure out why this cannot be called Error - wasm-pack complains that it
// "cannot shadow already defined class Error", probably because something else called Error
// is pulled into the same namespace
#[wasm_bindgen]
#[derive(Debug, Clone)]
pub struct ParserError {
    message: String,
}

impl ParserError {
    pub fn new(message: impl ToString) -> ParserError {
        ParserError {
            message: message.to_string(),
        }
    }
}

impl fmt::Display for ParserError {
    fn fmt(&self, fmt: &mut fmt::Formatter) -> fmt::Result {
        write!(fmt, "3dwebparser::ParserError({:?})", self.message)
    }
}

impl std::error::Error for ParserError {}

impl From<i3df::error::Error> for ParserError {
    fn from(err: i3df::error::Error) -> ParserError {
        ParserError {
            message: format!("i3df error: {}", err),
        }
    }
}

impl From<f3df::error::Error> for ParserError {
    fn from(err: f3df::error::Error) -> ParserError {
        ParserError {
            message: format!("f3df error: {}", err),
        }
    }
}
