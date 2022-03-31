from cognite.client import CogniteClient
from msal import PublicClientApplication

# Contact Project Administrator to get these
TENANT_ID = "67105506-2613-4c69-a9af-d2794c862ae7"
CLIENT_ID = "9b263878-21b1-4178-a991-adf73e52be72"
CDF_CLUSTER = "az-eastus-1"  # api, westeurope-1 etc
COGNITE_PROJECT = "p66-dev"

SCOPES = [f"https://{CDF_CLUSTER}.cognitedata.com/.default"]

AUTHORITY_HOST_URI = "https://login.microsoftonline.com"
AUTHORITY_URI = AUTHORITY_HOST_URI + "/" + TENANT_ID
PORT = 53000


def authenticate_azure():
    app = PublicClientApplication(client_id=CLIENT_ID, authority=AUTHORITY_URI)

    # interactive login - make sure you have http://localhost:port in Redirect URI in App Registration as type "Mobile and desktop applications"
    creds = app.acquire_token_interactive(scopes=SCOPES, port=PORT)
    return creds


def get_client():
    creds = authenticate_azure()

    client = CogniteClient(
        token_url=creds["id_token_claims"]["iss"],
        token=creds["access_token"],
        token_client_id=creds["id_token_claims"]["aud"],
        project=COGNITE_PROJECT,
        base_url=f"https://{CDF_CLUSTER}.cognitedata.com",
        client_name="cognite-python-dev",
    )
    return client
