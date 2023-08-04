import { AppData } from './types';

export const defaultApps: {
  name: string;
  description: string;
  file: AppData;
}[] = [
  {
    name: 'Multi page app',
    description:
      'An example on how you can create a multi page app including libraries.',

    file: {
      requirements: [
        'pyodide-http==0.2.1',
        'cognite-sdk==6.1.6',
        'pydeck==0.8.0',
      ],
      entrypoint: 'main.py',
      files: {
        'main.py': {
          content: {
            $case: 'text',
            text: `import streamlit as st

st.write("# Welcome to Streamlit in Cognite Data Fusion! 👋")

st.sidebar.success("Select a demo above.")

st.markdown(
    """
    Streamlit is an open-source app framework built specifically for Data Science projects. 
    Building apps with Cognite Data Fusion and Streamlit is easier than ever before using CogPilot, your AI programming assistant.
    **👈 Select a demo from the sidebar** to see some examples
    of what Streamlit and Cognite Data Fusion can do!
    ### Want to learn more about Streamlit and Cognite Data Fusion?
    - Check out [streamlit.io](https://streamlit.io)
    - Jump into [Streamlit documentation](https://docs.streamlit.io)
    - Jump into [Cognite SDK documentation](https://cognite-sdk-python.readthedocs-hosted.com/en/latest)
    - Ask a question at [Cognite Hub](https://hub.cognite.com/)
    - Ask the CogPilot for help building your app (bottom right corner)
"""
)
            
`,
          },
        },
        'pages/1_🗃️_CDF_Demo.py': {
          content: {
            $case: 'text',
            text: `import streamlit as st
from MyLibrary import get_assets
st.title("Assets in Cognite Data Fusion")

st.write(get_assets())`,
          },
        },
        'pages/2_📈_Plotting_Demo.py': {
          content: {
            $case: 'text',
            text: `import streamlit as st
import time
import numpy as np

st.set_page_config(page_title="Plotting Demo", page_icon="📈")

st.markdown("# Plotting Demo")
st.sidebar.header("Plotting Demo")
st.write(
    """This demo illustrates a combination of plotting and animation with
Streamlit. We're generating a bunch of random numbers in a loop for around
5 seconds. Enjoy!"""
)

progress_bar = st.sidebar.progress(0)
status_text = st.sidebar.empty()
last_rows = np.random.randn(1, 1)
chart = st.line_chart(last_rows)

for i in range(1, 101):
    new_rows = last_rows[-1, :] + np.random.randn(5, 1).cumsum(axis=0)
    status_text.text("%i%% Complete" % i)
    chart.add_rows(new_rows)
    progress_bar.progress(i)
    last_rows = new_rows
    time.sleep(0.05)

progress_bar.empty()

# Streamlit widgets automatically run the script from top to bottom. Since
# this button is not connected to any other logic, it just causes a plain
# rerun.
st.button("Re-run")`,
          },
        },
        'pages/3_🌍_Mapping_Demo.py': {
          content: {
            $case: 'text',
            text: `import streamlit as st
import pandas as pd
import pydeck as pdk
from urllib.error import URLError

# Need to patch requests package
from pyodide_http import patch_all
patch_all()

st.set_page_config(page_title="Mapping Demo", page_icon="🌍")

st.markdown("# Mapping Demo")
st.sidebar.header("Mapping Demo")
st.write(
    """This demo shows how to use
[\`st.pydeck_chart\`](https://docs.streamlit.io/library/api-reference/charts/st.pydeck_chart)
to display geospatial data."""
)


@st.cache_data
def from_data_file(filename):
    import requests

    data = requests.get("https://raw.githubusercontent.com/streamlit/"
        "example-data/master/hello/v1/%s" % filename)
    return pd.read_json(data.text)


try:
    ALL_LAYERS = {
        "Bike Rentals": pdk.Layer(
            "HexagonLayer",
            data=from_data_file("bike_rental_stats.json"),
            get_position=["lon", "lat"],
            radius=200,
            elevation_scale=4,
            elevation_range=[0, 1000],
            extruded=True,
        ),
        "Bart Stop Exits": pdk.Layer(
            "ScatterplotLayer",
            data=from_data_file("bart_stop_stats.json"),
            get_position=["lon", "lat"],
            get_color=[200, 30, 0, 160],
            get_radius="[exits]",
            radius_scale=0.05,
        ),
        "Bart Stop Names": pdk.Layer(
            "TextLayer",
            data=from_data_file("bart_stop_stats.json"),
            get_position=["lon", "lat"],
            get_text="name",
            get_color=[0, 0, 0, 200],
            get_size=15,
            get_alignment_baseline="'bottom'",
        ),
        "Outbound Flow": pdk.Layer(
            "ArcLayer",
            data=from_data_file("bart_path_stats.json"),
            get_source_position=["lon", "lat"],
            get_target_position=["lon2", "lat2"],
            get_source_color=[200, 30, 0, 160],
            get_target_color=[200, 30, 0, 160],
            auto_highlight=True,
            width_scale=0.0001,
            get_width="outbound",
            width_min_pixels=3,
            width_max_pixels=30,
        ),
    }
    st.sidebar.markdown("### Map Layers")
    selected_layers = [
        layer
        for layer_name, layer in ALL_LAYERS.items()
        if st.sidebar.checkbox(layer_name, True)
    ]
    if selected_layers:
        st.pydeck_chart(
            pdk.Deck(
                map_style="mapbox://styles/mapbox/light-v9",
                initial_view_state={
                    "latitude": 37.76,
                    "longitude": -122.4,
                    "zoom": 11,
                    "pitch": 50,
                },
                layers=selected_layers,
            )
        )
    else:
        st.error("Please choose at least one layer above.")
except URLError as e:
    st.error(
        """
        **This demo requires internet access.**
        Connection error: %s
    """
        % e.reason
    )`,
          },
        },
        'MyLibrary.py': {
          content: {
            $case: 'text',
            text: `import streamlit as st
from cognite.client import CogniteClient
client = CogniteClient()

# Cache the assets list
@st.cache_data
def get_assets():
    assets = client.assets.list(limit=1000).to_pandas()
    assets = assets.fillna(0)
    return assets`,
          },
        },
      },
    },
  },
  {
    name: 'Event creator',
    description: 'App with user interface to create events.',

    file: {
      requirements: ['pyodide-http==0.2.1', 'cognite-sdk==6.1.6'],
      entrypoint: 'main.py',
      files: {
        'main.py': {
          content: {
            $case: 'text',
            text: `import json
import ast
import streamlit as st
from datetime import *
from cognite.client import CogniteClient
from cognite.client.data_classes import Event

client = CogniteClient()

st.title("🗄️ Upload Event Data to CDF")

dss = client.data_sets.list(limit=-1).to_pandas()

external_id = st.text_input(
    label="External ID",
    help="Enter unique name for external_id",
)

select_ds = st.selectbox(
    label="Dataset",
    help="Select a dataset",
    options=(dss.external_id))

event_type = st.text_input(
    label="Type",
    help="Enter the event type",
)

event_subtype = st.text_input(
    label="Subtype",
    help="Enter the event subtype",
)

date_inner_col, time_inner_col = st.columns(2)

with date_inner_col:
    start_date = st.date_input("Select start date")
    end_date = st.date_input("Select end date")

with time_inner_col:
    start_time = st.time_input("Select start time")
    end_time = st.time_input("Select end time")

event_desc = st.text_input(
    label="Description",
    help="Enter the event description",
)

metadata = st.text_area(
    label="Metatdata",
    help="Enter metadata as key value pairs (Python dict)",
    value={"some_key": "some_value"}
)

if metadata:
    st.json(metadata)

if st.button("Upload to CDF"):
    try:
        start = datetime.timestamp(datetime.combine(start_date, start_time))*1000
        end = datetime.timestamp(datetime.combine(end_date, end_time))*1000

        client.events.create([Event(

            external_id=external_id if external_id else None,
            data_set_id=dss[dss.external_id == select_ds].id[0],
            start_time=start if start else None,
            end_time=end if end else None,
            type=event_type if event_type else None,
            subtype=event_subtype if event_subtype else None,
            description=event_desc if event_desc else None,
            metadata=ast.literal_eval(metadata) if metadata else None
        )])
        st.success("🚀 Successfully uploaded to CDF!")
    except Exception as error:
        st.error(error)
`,
          },
        },
      },
    },
  },
  {
    name: 'GPT Chatbot',
    description: 'A simple chatbot using GPT through Cognite Data Fusion.',
    file: {
      requirements: [
        'pyodide-http==0.2.1',
        'cognite-sdk==6.1.6',
        'streamlit-chat==0.0.2.2',
      ],
      entrypoint: 'main.py',
      files: {
        'main.py': {
          content: {
            $case: 'text',
            text: `import streamlit as st
from streamlit_chat import message
from cognite.client import CogniteClient

# Setting page title and header
client = CogniteClient()
st.set_page_config(page_title="CDF Chatbot", page_icon=":robot_face:")
st.markdown("<h1 style='text-align: center;'>CDF Chatbot  🤖 </h1>", unsafe_allow_html=True)

# Initialise session state variables
if 'generated' not in st.session_state:
    st.session_state['generated'] = []
if 'past' not in st.session_state:
    st.session_state['past'] = []
if 'messages' not in st.session_state:
    st.session_state['messages'] = [
        {"role": "system", "content": "You are a helpful assistant."}
    ]
if 'model_name' not in st.session_state:
    st.session_state['model_name'] = []

# Sidebar - let user choose model, show total cost of current conversation, and let user clear the current conversation
st.sidebar.title("Sidebar")
model_name = st.sidebar.radio("Choose a model:", ("GPT-3.5", "GPT-4"))
counter_placeholder = st.sidebar.empty()
clear_button = st.sidebar.button("Clear Conversation", key="clear")

# Map model names to OpenAI model IDs
if model_name == "GPT-3.5":
    model = "gpt-3.5-turbo"
else:
    model = "gpt-4"

# reset everything
if clear_button:
    st.session_state['generated'] = []
    st.session_state['past'] = []
    st.session_state['messages'] = [
        {"role": "system", "content": "You are a helpful assistant."}
    ]
    st.session_state['number_tokens'] = []
    st.session_state['model_name'] = []


# generate a response
def generate_response(prompt):
    st.session_state['messages'].append({"role": "user", "content": prompt})
    
    completion = client.post(
        url=f"/api/v1/projects/{client.config.project}/context/gpt/chat/completions",
        json={
            "messages": st.session_state['messages'],
            "maxTokens": 200,
            "temperature": 0.0
        }
    )
    response = completion.json()["choices"][0]["message"]["content"]
    st.session_state['messages'].append({"role": "assistant", "content": response})

    return response


# container for chat history
response_container = st.container()
# container for text box
container = st.container()

with container:
    with st.form(key='my_form', clear_on_submit=True):
        user_input = st.text_area("You:", key='input', height=100)
        submit_button = st.form_submit_button(label='Send')

    if submit_button and user_input:
        output = generate_response(user_input)
        st.session_state['past'].append(user_input)
        st.session_state['generated'].append(output)
        st.session_state['model_name'].append(model_name)

if st.session_state['generated']:
    with response_container:
        for i in range(len(st.session_state['generated'])):
            message(st.session_state["past"][i], is_user=True, key=str(i) + '_user', avatar_style="initials", seed="User")
            message(st.session_state["generated"][i], key=str(i), avatar_style="")
`,
          },
        },
      },
    },
  },
  {
    name: 'Time series exploration',
    description: 'Find and plot time series.',
    file: {
      requirements: [
        'pyodide-http==0.2.1',
        'cognite-sdk==6.1.6',
        'streamlit-aggrid==0.3.4.post3',
        'plotly==5.14.1',
      ],
      entrypoint: 'main.py',
      files: {
        'main.py': {
          content: {
            $case: 'text',
            text: `import streamlit as st
from cognite.client import CogniteClient
import plotly.graph_objects as go
import numpy as np
from cognite.client.data_classes import TimeSeriesFilter, TimeSeriesList
from cognite.client.utils import timestamp_to_ms, ms_to_datetime
from st_aggrid import AgGrid, GridOptionsBuilder, ColumnsAutoSizeMode
import pandas as pd
from datetime import datetime, date, time, timezone


######################################################################################################## UTILS
plotly_config = dict(fillFrame=True, displayModeBar=False, showTips=False)

common_layout = dict(
    xaxis=dict(
        title=dict(text=None),
        showspikes=True,
        spikemode="across",
        spikethickness=1,
        spikedash="solid",
    ),
    legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1),
    hovermode="x",
    hoverlabel=dict(namelength=-1),
    spikedistance=-1,
    margin=dict(l=70, r=20, b=30, t=50, pad=0),
    height=700,
)

custom_css = {
    '@font-face': {
        'font-family': '"Source Sans Pro"',
        'src': 'url(https://fonts.gstatic.com/s/sourcesanspro/v21/6xK3dSBYKcSV-LCoeQqfX1RYOo3qOK7lujVj9w.woff2) format("woff2")'
    }
}

def create_layout(title: str | None, y_axis_name: str | None) -> dict:
    extra_layout = {}
    if title:
        extra_layout = extra_layout | {"title": {"text": title}}
    if y_axis_name:
        extra_layout = extra_layout | {"yaxis": {"title": {"text": y_axis_name}}}
    return common_layout | extra_layout


def snake_to_camel(s):
    parts = s.split("_")
    return parts[0] + "".join(x.title() for x in parts[1:])


def calculate_granularity(
    start_time: int, end_time: int, data_points: int = 1000
) -> str | None:
    """
    Generates a granularity option compatible with Cognite Data Fusion to query an approximate number of datapoints
    inside the specified time window.
    Args:
        start_time (int): start time in ms since epoch
        end_time (int): end time in ms since epoch
        data_points (int): number of data points
    Returns:
        (str): granularity
    """
    if start_time > end_time:
        raise ValueError("The start time cannot be smaller than the end time.")
    time_range: int = end_time - start_time
    granularity_min: float = (time_range / data_points) / 1000.0 / 60.0

    # for very small windows, we could query raw data, but here we default to 1m
    if granularity_min < 1.0:
        return "1m"

    if granularity_min <= 120.0:
        return f"{int(np.floor(granularity_min))}m"

    granularity_hour = granularity_min / 60
    if granularity_hour <= 120.0:
        return f"{int(np.floor(granularity_hour))}h"

    granularity_day = granularity_hour / 24
    if granularity_day <= 120.0:
        return f"{int(np.floor(granularity_day))}d"

    # if the user selects a very large window we still let the query work
    # but it may contain more data_points
    return "120d"

######################################################################################################## UTILS
client = CogniteClient()

################################################################################################# Page config
st.set_page_config(layout="wide", page_title="Data Explorer")
st.title("Exploring time series data points in CDF")

tab1, tab2 = st.tabs(["Time Series selector", "Data points exploration"])

################################################################################################# TAB 1
with tab1:
    c1, c2 = st.columns([2, 10])
    with c1:
        #################################################################################### Time series search options
        name_input: str = st.text_input("Search on name")
        desc_input: str = st.text_input("Search on description")
        limit: int = st.number_input(
            label="Number of results", value=20, max_value=1000, min_value=0, step=1
        )
        a1, a2 = st.columns(2)
        is_string: bool = a1.checkbox("Is string?", value=False)
        is_step: bool = a2.checkbox("Is step?", value=False)

    ######################################################################################## Time series search
    ts_list: TimeSeriesList = client.time_series.search(
        name=name_input if name_input != "" else None,
        description=desc_input if desc_input != "" else None,
        filter=TimeSeriesFilter(
            is_string=is_string,
            is_step=is_step,
        ),
        limit=limit,
    )
    ######################################################################################## Warning if no time series
    if len(ts_list) == 0:
        c2.warning("No timeseries located for the given search criteria")
        st.stop()

    ######################################################################################## Transform ts to pandas
    ts_df = ts_list.to_pandas()
    columns = ts_df.columns
    selected_columns = (
        [
            "external_id",
            "name",
            "description",
            "unit",
            "created_time",
            "last_updated_time",
        ]
        if "unit" in columns
        else ["external_id", "name", "description", "created_time", "last_updated_time"]
    )
    ts_df = ts_df[selected_columns]
    for item in ["created_time", "last_updated_time"]:
        ts_df[item] = pd.to_datetime(ts_df[item], unit="ms")

    ######################################################################################## Display selection dataframe
    options_builder = GridOptionsBuilder.from_dataframe(ts_df)
    options_builder.configure_selection(selection_mode="single", use_checkbox=True)
    grid_options = options_builder.build()

    with c2:
        grid_return = AgGrid(
            ts_df,
            grid_options,
            # fit_columns_on_grid_load=True,
            custom_css=custom_css,
            columns_auto_size_mode=ColumnsAutoSizeMode.FIT_CONTENTS,
        )

    selected_row = grid_return["selected_rows"]
    if len(selected_row) == 0:
        external_id = None
    else:
        external_id = selected_row[0].get("external_id", None)
        unit = selected_row[0].get("unit", None)
        name = selected_row[0].get("name", None)
        description = selected_row[0].get("description", None)

################################################################################################# TAB 2
with tab2:
    d1, d2 = st.columns([2, 7])
    with d1:
        #################################################################################### Data points query options
        date_range: tuple[date] = st.date_input(
            label="Date range",
            value=(datetime.utcnow() - pd.Timedelta(days=30), datetime.utcnow()),
            max_value=datetime.now(),
        )

        e1, e2 = st.columns(2)
        start_time: time = e1.time_input("Start date time", value=time(0, 0, 0))
        end_time: time = e2.time_input("End date time", value=time(0, 0, 0))

        aggregates: str = st.multiselect(
            label="Aggregates",
            options=[
                "average",
                "interpolation",
                "stepInterpolation",
                "max",
                "min",
                "count",
                "sum",
                "totalVariation",
                "continuousVariance",
                "discreteVariance",
            ],
            default="average",
        )

        f1, f2 = st.columns(2)
        granularity_option: str = f1.selectbox(
            label="Datapoints method",
            options=["Granularity", "Data points"],
        )
        if granularity_option == "Granularity":
            granularity: str = f2.selectbox(
                "Granularity", options=["1m", "30m", "1h", "6h", "12h", "1d"]
            )
        else:
            number_datapoints: int = f2.number_input(
                "Number of data points",
                value=500,
                min_value=0,
                max_value=1000,
                step=1,
            )
        g1, g2 = st.columns(2)
        get_raw: bool = g1.checkbox("Fetch raw data")
        debug: bool = g2.checkbox("Debug")
    with d2:
        ######################################################################################## Warnings
        if external_id is None:
            st.warning("Please select a time series")
            st.stop()

        if len(date_range) == 1:
            st.warning("Please select an **end** date")
            st.stop()

        if len(aggregates) == 0:
            st.warning("At least one aggregate needs to be selected")
            st.stop()

        start: int = timestamp_to_ms(
            datetime.combine(date_range[0], start_time, tzinfo=timezone.utc)
        )
        end: int = timestamp_to_ms(
            datetime.combine(date_range[1], end_time, tzinfo=timezone.utc)
        )

        if start == end:
            st.warning("The **start** and **end** timestamps cannot be equal")
            st.stop()
        if end < start:
            st.warning("The **end** timestamp needs to be greater than **start**")
            st.stop()

        ######################################################################################## Calculate granularity
        if granularity_option != "Granularity":
            granularity: str = calculate_granularity(
                start_time=start, end_time=end, data_points=number_datapoints
            )

        if get_raw:
            dps_raw: pd.Series = client.time_series.data.retrieve_dataframe(
                external_id=external_id,
                start=start,
                end=end,
                aggregates=None,
                granularity=None,
                limit=None,
            )
            if len(dps_raw) == 0:
                st.warning("No datapoints were found in the current time range")
                st.stop()
            raw_trace = [
                go.Scatter(
                    x=dps_raw.index,
                    y=dps_raw[dps_raw.columns[0]].values,
                    name="Raw data",
                    mode="markers",
                    marker={"size": 5 if len(dps_raw.index) > 100 else 12},
                )
            ]

        dps: pd.DataFrame = client.time_series.data.retrieve_dataframe(
            external_id=external_id,
            start=start,
            end=end,
            aggregates=aggregates,
            granularity=granularity,
            limit=None,
        )
        if len(dps) == 0:
            st.warning("No datapoints found in the current time window!")
            st.stop()

        dps.columns = [snake_to_camel(col.split("|")[1]) for col in dps.columns]
        # st.write(dps)
        traces = [
            go.Scatter(
                x=dps.index,
                y=dps[col].values,
                name=col,
                mode="lines",
                connectgaps=True,
                line_shape="hv" if col == "stepInterpolation" else "linear",
            )
            for col in dps.columns
        ]
        if get_raw:
            traces = raw_trace + traces
        fig = go.Figure(
            data=traces,
            layout=create_layout(
                title=description,
                y_axis_name=f"<b>{name}</b> [{unit}]" if unit else f"<b>{name}</b>",
            ),
        )
        st.plotly_chart(fig, use_container_width=True, config=plotly_config)

    if debug:
        d1.write(
            {
                "externalId": external_id,
                "start": start,
                "end": end,
                "granularity": granularity,
                "aggregates": aggregates,
            }
        )
            
`,
          },
        },
      },
    },
  },
];
