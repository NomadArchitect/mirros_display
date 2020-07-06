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
  FULL: 5,
});

export const NmState = Object.freeze({
  // networking state is unknown
  UNKNOWN: 0,
  // networking is not enabled
  ASLEEP: 10,
  // there is no active network connection
  DISCONNECTED: 20,
  // network connections are being cleaned
  DISCONNECTING: 30,
  // a network connection is being started
  CONNECTING: 40,
  // there is only local IPv4 and / or IPv6 connectivity
  CONNECTED_LOCAL: 50,
  // there is only site - wide IPv4 and / or IPv6 connectivity
  CONNECTED_SITE: 60,
  // there is global IPv4 and / or IPv6 Internet connectivity
  CONNECTED_GLOBAL: 70,
});
