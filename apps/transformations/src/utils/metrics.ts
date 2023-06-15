import { trackEvent } from '@cognite/cdf-route-tracker';
import { getProject, isDevelopment } from '@cognite/cdf-utilities';
import { Metrics } from '@cognite/metrics';

type Event =
  | { e: 'Details.RAW.Search.Click'; field: string }
  | { e: 'Details.RAW.Database.Click'; database?: string }
  | { e: 'Details.RAW.Table.Click'; table?: string; database?: string }
  | { e: 'Details.RAW.Table.Filter.Click'; field: string; table?: string }
  | { e: 'Details.RAW.Table.Toggle.View.Click'; view: string; table?: string }
  | { e: 'Details.RunHistory.View.Click'; jobId?: number | undefined }
  | { e: 'Details.RunHistory.Toggle.View.Click'; view: string }
  | { e: 'Details.RunHistory.Copy.Click'; field: string };

export const trackUsage = (event: Event) => {
  const { e, ...metadata } = event;

  const { host, pathname } = window?.location;
  if (!host || !pathname) {
    return;
  }

  const pathWithoutProjectName = pathname.substring(pathname.indexOf('/', 1));

  if (!host.includes('localhost')) {
    trackEvent(`Transformations.${e}`, {
      ...metadata,
      project: getProject(),
      version: 1,
      appVersion: process.env.REACT_APP_VERSION,
      location: pathname,
      pathname: pathWithoutProjectName,
    });
  }
};

export const handleUserIdentification = (email: string) => {
  Metrics.identify(email || 'not-identified-yet');
  Metrics.people({
    email,
    name: email,
  });
};

export const setupMixpanel = () => {
  const mixpanelFusionToken = '5c4d853e7c3b77b1eb4468d5329b278c'; // pragma: allowlist secret
  const mixpanelFusionDevToken = '643d35354aa468504d01f2dd33d8f726'; // pragma: allowlist secret

  const mixpanelToken = isDevelopment()
    ? mixpanelFusionDevToken
    : mixpanelFusionToken;

  Metrics.init({
    mixpanelToken,
    debug: isDevelopment(),
  });

  // We opt out of tracking if we are on development
  if (isDevelopment()) {
    Metrics.optOut();
  } else {
    Metrics.optIn();
  }
};

// Mixpanel events defined for Transformations list, details and other respective component's click events
const events = {
  'event-tr-details-action-type-click':
    'Transformations.Details.Destination.ActionType.{{type}}.Click',
  'event-tr-details-cli-manifest-click':
    'Transformations.Details.CLIManifestButton.Click',
  'event-tr-details-delete-click': 'Transformations.Details.Delete.Click',
  'event-tr-details-destination-type-click':
    'Transformations.Details.Destination.DestinationType.{{type}}.Click',
  'event-tr-details-doc-click': 'Transformations.Details.Docs.Click',
  'event-tr-details-duplicate-click': 'Transformations.Details.Duplicate.Click',
  'event-tr-details-home-about-edit-click':
    'Transformations.Details.Home.AboutEditButton.Click',
  'event-tr-details-home-about-update-click':
    'Transformations.Details.Home.AboutUpdateButton.Click',
  'event-tr-details-home-credentials-edit-click':
    'Transformations.Details.Home.CredentialsEditButton.Click',
  'event-tr-details-home-credentials-help-click':
    'Transformations.Details.Home.CredentialsHelpButton.Click',
  'event-tr-details-home-credentials-oidc-read-apply-to-both-click':
    'Transformations.Details.Home.OIDCReadCredentialsApplyToBothButton.Click',
  'event-tr-details-home-credentials-oidc-read-save-click':
    'Transformations.Details.Home.OIDCReadCredentialsSaveButton.Click',
  'event-tr-details-home-credentials-oidc-write-apply-to-both-click':
    'Transformations.Details.Home.OIDCWriteCredentialsApplyToBothButton.Click',
  'event-tr-details-home-credentials-oidc-write-save-click':
    'Transformations.Details.Home.OIDCWriteCredentialsSaveButton.Click',
  'event-tr-details-home-notifications-add-click':
    'Transformations.Details.Home.NotificationsAddButton.Click',
  'event-tr-details-home-notifications-edit-click':
    'Transformations.Details.Home.NotificationsEditButton.Click',
  'event-tr-details-home-schedule-edit-click':
    'Transformations.Details.Home.ScheduleEditButton.Click',
  'event-tr-details-home-schedule-help-click':
    'Transformations.Details.Home.ScheduleHelpButton.Click',
  'event-tr-details-home-schedule-update-click':
    'Transformations.Details.Home.ScheduleUpdateButton.Click',
  'event-tr-details-home-view-details-click':
    'Transformations.Details.Home.DetailsViewButton.Click',
  'event-tr-details-home-view-last-run-click':
    'Transformations.Details.Home.LastRunViewButton.Click',
  'event-tr-details-preview-collapsed-click':
    'Transformations.Details.Preview.CollapsedButton.Click',
  'event-tr-details-preview-default-click':
    'Transformations.Details.Preview.DefaultButton.Click',
  'event-tr-details-preview-expanded-click':
    'Transformations.Details.Preview.ExpandedButton.Click',
  'event-tr-details-query-copy-click':
    'Transformations.Details.Query.CopyButton.Click',
  'event-tr-details-query-format-click':
    'Transformations.Details.Query.FormatButton.Click',
  'event-tr-details-query-preview-click':
    'Transformations.Details.Query.PreviewButton.Click',
  'event-tr-details-query-preview-limit-all-click':
    'Transformations.Details.Query.PreviewLimitAllButton.Click',
  'event-tr-details-query-preview-limit-click':
    'Transformations.Details.Query.PreviewLimit{{limit}}Button.Click',
  'event-tr-details-run-now-click':
    'Transformations.Details.RunNowButton.Click',
  'event-tr-details-schedule-click': 'Transformations.Details.Schedule.Click',
  'event-tr-details-set-credentials-click':
    'Transformations.Details.SetCredentials.Click',
  'event-tr-details-side-panel-home-click':
    'Transformations.Details.SidePanel.Home',
  'event-tr-details-side-panel-raw-click':
    'Transformations.Details.SidePanel.RAW',
  'event-tr-details-side-panel-run-history-click':
    'Transformations.Details.SidePanel.RunHistory',
  'event-tr-list-bulk-action-click':
    'Transformations.List.Transformation.BulkAction.Click',
  'event-tr-list-bulk-action-delete-click':
    'Transformations.List.Transformation.BulkAction.Delete.Click',
  'event-tr-list-bulk-action-duplicate-click':
    'Transformations.List.Transformation.BulkAction.Duplicate.Click',
  'event-tr-list-bulk-action-run-click':
    'Transformations.List.Transformation.BulkAction.Run.Click',
  'event-tr-list-create-with-dataset-click':
    'Transformations.List.CreateModal.CreateWithDataSet',
  'event-tr-list-create-without-dataset-click':
    'Transformations.List.CreateModal.CreateWithoutDataSet',
  'event-tr-list-filter-apply-click':
    'Transformations.List.ApplyFilterButton.Click',
  'event-tr-list-more-action-click':
    'Transformations.List.Transformation.MoreActions.Click',
  'event-tr-list-more-action-delete-click':
    'Transformations.List.Transformation.MoreActions.Delete.Click',
  'event-tr-list-more-action-duplicate-click':
    'Transformations.List.Transformation.MoreActions.Duplicate.Click',
  'event-tr-list-more-action-pause-click':
    'Transformations.List.Transformation.MoreActions.Pause.Click',
  'event-tr-list-more-action-resume-click':
    'Transformations.List.Transformation.MoreActions.Resume.Click',
  'event-tr-list-more-action-run-click':
    'Transformations.List.Transformation.MoreActions.Run.Click',
  'event-tr-list-search-on-blur-click':
    'Transformations.List.SearchInput.BlurWithNonEmptySearchQuery',
  'event-tr-list-sort-column-create-time-click':
    'Transformations.List.SortBy.Created.Click',
  'event-tr-list-sort-column-dataset-click':
    'Transformations.List.SortBy.Dataset.Click',
  'event-tr-list-sort-column-last-modified-click':
    'Transformations.List.SortBy.LastModified.Click',
  'event-tr-list-sort-column-last-run-click':
    'Transformations.List.SortBy.LastRun.Click',
  'event-tr-list-sort-column-name-click':
    'Transformations.List.SortBy.Name.Click',
  'event-tr-list-troubleshoot-blocked-click':
    'Transformations.List.Troubleshoot.Blocked.Click',
  'event-tr-raw-csv-upload-click': 'Transformations.RAW.Table.CSVUpload.Upload',
  'event-tr-release-close-previous-version':
    'Transformations.ReleaseBanner.ClosePreviousVersionButton.Click',
  'event-tr-release-close-survey-click': 'Transformations.Feedback.Close.Click',
  'event-tr-release-dont-show-survey-click':
    'Transformations.Feedback.DontShow.Click',
  'event-tr-release-go-to-previous-version':
    'Transformations.ReleaseBanner.GoToPreviousVersionButton.Click',
  'event-tr-release-open-survey-click': 'Transformations.Feedback.Submit.Click',
} as const;

export type TransformationEventType = keyof typeof events;

export const getTrackEvent = (key: TransformationEventType) => {
  return events[key];
};

export const trim = (value: string) => {
  return value.replace(/\s/g, '');
};
