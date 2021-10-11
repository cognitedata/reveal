import os
import tempfile
import zipfile
import shutil
from os.path import basename
import geopandas
import requests
from cognite.geospatial import CogniteGeospatialClient
debug = False
simplify = True
base_url = "https://factpages.npd.no/downloads/shape/"
dataset = {
    "npd-licences": ("prlAreaCurrent", "idlicence"),
    "npd-fields": ("fldArea", "idfield"),
    "npd-blocks": ("blkArea", "idblock__"),
    "npd-quadrants": ("qadArea", "quadrant"),
    "npd-discoveries": ("dscArea", "iddiscover"),
    "npd-wellbores": ("wlbPoint", "idwellbore"),
    "npd-subareas": ("subArea", "npdid_sub_"),
    "npd-pipelines": ("pipLine", "idpipeline"),
    "npd-facilities": ("fclPoint", "idfacility"),
    "npd-BAA": ("baaAreaCurrent", "idbsnarar"),
    "npd-BAA-by-block": ("baaAreaSplitByBlock", ""),
}
def download_zip(layer, url):
    with open(f"{layer}.zip", "wb") as zip_file:
        r = requests.get(url, allow_redirects=True)
        zip_file.write(r.content)
    return
def unzip_layer(layer):
    try:
        os.mkdir(f"./{layer}")
    except Exception as e:
        print("folder exists")
    with zipfile.ZipFile(f"./{layer}.zip", "r") as zip_ref:
        zip_ref.extractall(f"./{layer}")
def simplify_layer(layer, zip_name):
    original_df = geopandas.read_file(f"./{layer}/{zip_name}.shp")
    null_filtered_df = original_df[original_df["geometry"].notnull()]
    """Simplify datasets"""
    gdf_simplified = null_filtered_df.copy()
    gdf_simplified["geometry"] = null_filtered_df.geometry.simplify(tolerance=0.001, preserve_topology=True)
    gdf_simplified.to_file(f"./{layer}/{zip_name}.shp")
    return
def zip_layer(layer):
    # create a ZipFile object
    with zipfile.ZipFile(f"./{layer}_simplified.zip", "w") as zipObj:
        # Iterate over all the files in directory
        for folderName, subfolders, filenames in os.walk(f"./{layer}"):
            for filename in filenames:
                # create complete filepath of file in directory
                filePath = os.path.join(folderName, filename)
                # Add file to zip
                zipObj.write(filePath, basename(filePath))
def clean_up(layer):
    os.remove(f'./{layer}.zip')
    os.remove(f'./{layer}_simplified.zip')
    shutil.rmtree(f'./{layer}')
def ingest_simplified_layer(geo_client, url, layer, zip_name, id_column):
    download_zip(layer, url)
    unzip_layer(layer)
    simplify_layer(layer, zip_name)
    zip_layer(layer)
    try:
        geo_client.shape_file_save( file=f"./{layer}_simplified.zip", layer=layer, create_layer=True, cleanup_old_data=True, id_field=id_column )
    except Exception as e:
        print(f"Error when ingesting data for layer {layer}: {e}")
    clean_up(layer)
def ingest_layer(geo_client, url, layer, id_column):
    with tempfile.NamedTemporaryFile() as fp:
        r = requests.get(url)
        fp.write(r.content)
        fp.flush()
        geo_client.shape_file_save(
            file=fp.name, layer=layer, create_layer=True, cleanup_old_data=True, id_field=id_column
        )
    return
def ingest_NPD_layers(geo_client, data):
    global debug
    if "debug" in data and data["debug"] == "True":
        debug = True
        print("INFO - DEBUG mode: on")
    else:
        print("INFO - DEBUG mode: off")
    if not debug:
        for layer, (zip_name, id_column) in dataset.items():
            url = f"{base_url}/{zip_name}.zip"
            if simplify:
                try:
                    print(f"Ingesting data for layer {layer}")
                    ingest_simplified_layer(geo_client, url, layer, zip_name, id_column)
                    print(f"Successfully ingested/updated layer {layer}")
                except Exception as e:
                    print(f"Error when ingesting data for layer {layer}: {e}")
            else:
                try:
                    print(f"Ingesting data for layer {layer}")
                    ingest_layer(geo_client, url, layer, id_column)
                    print(f"Successfully ingested/updated layer {layer}")
                except Exception as e:
                    print(f"Error when ingesting data for layer {layer}: {e}")
    return
def handle(client, secrets, data):
    geo_client = client
    if len(secrets) > 0 and "apikey" in secrets:
        geo_client = CogniteGeospatialClient(api_key=secrets["apikey"], project="ipn-dev")
    try:
        ingest_NPD_layers(geo_client, data)
    except Exception as e:
        print(e)
        return {"error": e.__str__(), "status": "failed"}
    return {"status": "succeeded"}
