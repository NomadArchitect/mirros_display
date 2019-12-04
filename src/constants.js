export const NmConnectivityState = Object.freeze({
  // Network connectivity is unknown.
  UNKNOWN: 1,
  // The host is not connected to any network.
  NONE: 2,
  // The host is behind a captive portal and cannot reach the full Internet.
  PORTAL: 3,
  // The host is connected to a network, but does not appear to be able to reach the full Internet.
  LIMITED: 4,
  // The host is connected to a network, and appears to be able to reach the full Internet.
  FULL: 5
});
