"""Module mappings for NodeJS binaries."""

def _mapping_impl(ctx):
    return []

_mapping = rule(
    implementation = _mapping_impl,
    attrs = {
        "module_root": attr.string(),
        "module_name": attr.string(),
    },
)

def module_mappings(name, mappings = {}):
    """Creates mappings by key to a target.

    Args:
      name: name of the mappings
      mappings: a dictionary where the key is the argument to require() in JS
        code, and the value is where to actually find that file, folder or
        package.

    Returns:
        A list of _mapping targets.
    """
    target_names = []
    for k, v in mappings.items():
        target_name = "_%s_%s" % (name, k)
        _mapping(name = target_name, module_name = k, module_root = v)
        target_names.append(target_name)
    return target_names
