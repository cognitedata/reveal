use std::fmt;

#[derive(Debug, Clone)]
pub struct Error {
    message: String,
}

impl Error {
    pub fn new(message: impl ToString) -> Error {
        Error {
            message: message.to_string(),
        }
    }
}

impl fmt::Display for Error {
    fn fmt(&self, fmt: &mut fmt::Formatter) -> fmt::Result {
        write!(fmt, "openctm::Error({:?})", self.message)
    }
}

impl std::error::Error for Error {}

impl From<std::io::Error> for Error {
    fn from(err: std::io::Error) -> Error {
        Error {
            message: format!("IO error {}", err),
        }
    }
}

impl From<std::str::Utf8Error> for Error {
    fn from(err: std::str::Utf8Error) -> Error {
        Error {
            message: format!("UTF8 error {}", err),
        }
    }
}

impl From<lzma_rs::error::Error> for Error {
    fn from(err: lzma_rs::error::Error) -> Error {
        Error {
            message: match err {
                lzma_rs::error::Error::IOError(x) => format!("IO error from LZMA {}", x),
                lzma_rs::error::Error::LZMAError(x) => format!("LZMAError {}", x),
                lzma_rs::error::Error::XZError(x) => format!("XZError {}", x),
            },
        }
    }
}

macro_rules! error {
    ($($args:tt)*) => { $crate::error::Error::new(format!($($args)*)) }
}
