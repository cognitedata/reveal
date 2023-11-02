/* eslint-disable */
export const loginInfoMockData = {
    "domain": "cog-appdev",
    "internalId": "7de0f091-27b8-487a-8867-b011908523e0",
    "label": "App Dev Journey",
    "idps": [
        {
            "internalId": "a5bc6507-2644-4004-87eb-efdb3124e3e2",
            "type": "AZURE_AD",
            "label": "Sign in with cogniteappdev.onmicrosoft.com",
            "authority": "https://login.microsoftonline.com/267cfdd8-a207-4320-80f2-a4352b15048f",
            "clusters": [
                "bluefield.cognitedata.com",
                "greenfield.cognitedata.com"
            ],
            "appConfiguration": {
                "clientId": "2f60b0f4-e767-40ac-a05c-df607a90331e"
            }
        },
        {
            "internalId": "1e6d0a8a-398e-46f3-baea-e2f24973443f",
            "type": "AZURE_AD",
            "label": "Sign in with dlcognitetest.onmicrosoft.com",
            "authority": "https://login.microsoftonline.com/e541626b-d552-488b-8674-24947c2c342e",
            "clusters": [
                "bluefield.cognitedata.com",
                "greenfield.cognitedata.com"
            ],
            "appConfiguration": {
                "clientId": "2f60b0f4-e767-40ac-a05c-df607a90331e"
            }
        },
        {
            "internalId": "96f500af-5d3a-4a76-9c05-8596d79b0300",
            "clusters": [
                "bluefield.cognitedata.com",
                "greenfield.cognitedata.com",
                "azure-dev.cognitedata.com"
            ],
            "type": "AZURE_AD",
            "authority": "https://login.microsoftonline.com/c08c2afd-4823-482b-9113-ed2746fe6026",
            "label": "Schema Team Testing",
            "appConfiguration": {
                "clientId": "2f60b0f4-e767-40ac-a05c-df607a90331e"
            }
        },
        {
            "internalId": "4d095b50-4057-4825-bb45-7166fef8d1de",
            "clusters": [
                "bluefield.cognitedata.com",
                "greenfield.cognitedata.com"
            ],
            "type": "AZURE_AD",
            "authority": "https://login.microsoftonline.com/b7484399-37aa-4c28-9a37-a32f24c0621f",
            "label": "sdkcognite",
            "appConfiguration": {
                "clientId": "2f60b0f4-e767-40ac-a05c-df607a90331e"
            }
        },
        {
            "internalId": "4f35e1be-521f-4c1d-b96c-57301134bd25",
            "clusters": [
                "greenfield.cognitedata.com"
            ],
            "type": "AUTH0",
            "label": "Sign in with auth0",
            "authority": "https://dev-m8i0hsz72ayts06q.eu.auth0.com",
            "appConfiguration": {
                "clientId": "jE4UBAMbYq1peda4tcl77W1YOHDgo48J",
                "audience": "https://greenfield.cognitedata.com"
            }
        },
        {
            "internalId": "8B23D7F9-8067-403C-A8C1-0F5E7DD8CC29",
            "type": "KEYCLOAK",
            "label": "Sign in with Keycloak",
            "authority": "https://keycloak.cognite.ai",
            "clusters": [
                "greenfield.cognitedata.com"
            ],
            "realm": "unifiedLogin",
            "appConfiguration": {
                "clientId": "unifiedLoginClient"
            }
        }
    ],
    "defaultIdpId": "a5bc6507-2644-4004-87eb-efdb3124e3e2",
    "defaultProject": "platypus"
}