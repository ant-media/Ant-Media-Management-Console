// Production build for the classic-panel/ subfolder, beside the new panel at the origin root
// (ng build -c production,classic). The base href lives in angular.json's classic config.
export const environment = {
  production: true,
  rebornSwitcher: true,
  newPanelUrl: '/'
};
