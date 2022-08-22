# Reveal Internal Webassembly Module

This crate contains all the embedded webassembly code for Reveal.

## Build

In order to build this crate, you will need to use Rust nightly. Using `rustup`, you can enable this by issuing

```
$ rustup override set nightly
```

in this directory.

To build the crate for the web, we use `wasm-pack`:

```
$ wasm-pack build --target web
```
