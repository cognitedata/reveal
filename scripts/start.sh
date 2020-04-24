#!/usr/bin/env bash

if [[ -z "$REACT_APP_I18N_PSEUDO" ]]; then
  export REACT_APP_I18N_PSEUDO="false"
fi

if [[ -z "$REACT_APP_I18N_DEBUG" ]]; then
  export REACT_APP_I18N_DEBUG="true"
fi

if [[ -z "$REACT_APP_LANGUAGE" ]]; then
  export REACT_APP_LANGUAGE="en"
fi

if [[ -z "$REACT_APP_LOCIZE_PROJECT_ID" ]]; then
  export REACT_APP_LOCIZE_PROJECT_ID="dfcacf1f-a7aa-4cc2-94d7-de6ea4e66f1d"
fi

if [[ -z "$REACT_APP_LOCIZE_API_KEY" ]]; then
  export REACT_APP_LOCIZE_API_KEY="679d5a83-bc71-4d5e-9e32-f8560603166b"
fi

if [[ -z "$REACT_APP_MIXPANEL_TOKEN" ]]; then
  export REACT_APP_MIXPANEL_TOKEN="0ef20fa9df0965e1ad952d1d9b804147"
fi

react-scripts start
