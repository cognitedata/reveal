#[derive(Debug)]
pub enum Error {
    IoError(std::io::Error),
    F3dfError(String),
}

impl std::fmt::Display for Error {
    fn fmt(&self, fmt: &mut std::fmt::Formatter) -> std::fmt::Result {
        match self {
            Error::IoError(x) => x.fmt(fmt),
            Error::F3dfError(message) => write!(fmt, "i3df::Error({:?})", message),
        }
    }
}

impl std::error::Error for Error {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            Error::IoError(err) => Some(err),
            _ => None,
        }
    }
}

impl From<std::io::Error> for Error {
    fn from(err: std::io::Error) -> Error {
        Error::IoError(err)
    }
}

macro_rules! error {
    ($($args:tt)*) => { $crate::error::Error::F3dfError(format!($($args)*)) }
}
