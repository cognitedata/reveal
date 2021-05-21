"""
Lint rules
"""

load(":eslint.bzl", _eslint_config = "eslint_config", _eslint_test = "eslint_test")
load(":prettier.bzl", _prettier_config = "prettier_config", _prettier_test = "prettier_test")

eslint_test = _eslint_test
eslint_config = _eslint_config
prettier_test = _prettier_test
prettier_config = _prettier_config
