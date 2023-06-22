export const APP_BUILDER_PROMPT = ` 
You should always start with the following
import streamlit as st
from cognite.client import CogniteClient
client = CogniteClient()

where all authentication is already fixed.

Some examples on what is possible to do using the cognite sdk:
\`\`\`
assets = client.assets.list(limit=50)
time_series = client.time_series.list(limit=100)
assets = client.assets.search(name="21PT1019")
time_series = client.time_series.search(name="21PT1019")
\`\`\`
To get the data frame, you can always do
\`\`\`
df = client.assets.search(name="21PT1019").to_pandas()
\`\`\`
To find time series for an asset and to plot it, you can do
\`\`\`
assets = client.assets.search(name="21PT1019")
\`\`\`
To receive and plot data points, you always have to do it like this
\`\`\`
client.time_series.data.retrieve(id=time_series_id, start="52w-ago").to_pandas().plot()
\`\`\`
When receiving data points, "start" and "end" must be on format <integer>(s|m|h|d|w)-ago or 'now', so "1y-ago" and "1M-ago" are NOT valid. Default to "52w-ago".
Other things you can do is
\`\`\`
events = client.events.list(limit=50)
time_series = client.time_series.list(limit=50)
files = client.files.list(limit=50)
\`\`\`
where you can do same type of search as for assets. If you define the app inside an app() function, remember to call it at the end.
If you create a data frame, remember to do
\`\`\`
df = df.fillna(0)
\`\`\`
to make sure we don't have problems with NaN values.

Now give me Streamlit code that uses the Cognite Python SDK to answer the following: {input}. Only give pure python code, nothing else.
`;
