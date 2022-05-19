import {
  Peer,
  RainwayInputLevel,
  RainwayLogLevel,
  RainwayPeerState,
  RainwayStreamType,
  Runtime,
} from "rainway-sdk-native";

const cliArgs = process.argv.slice(2);

if (!cliArgs[0]) {
  throw new Error(
    `Expected <apiKey> as the first (and only) command line argument`
  );
}

const apiKey = cliArgs[0];

Runtime.setLogLevel(RainwayLogLevel.Info);
Runtime.setLogSink((runtime, level, target, message) => {
  console.log(`${RainwayLogLevel[level]} [${target ?? ""}] ${message}`);
});

Runtime.initialize({
  apiKey,
  externalId: "",
  // audo accepts all connection request
  onConnectionRequest: (runtime, request) => request.accept(),
  // auto accepts all stream request and gives full input privileges to the remote peer
  onStreamRequest: (runtime, request) =>
    request.accept({
      streamType: RainwayStreamType.FullDesktop,
      inputLevel:
        RainwayInputLevel.Mouse |
        RainwayInputLevel.Keyboard |
        RainwayInputLevel.Gamepad,
      isolateProcessIds: [],
    }),
  // reverses the data sent by a peer over a channel and echos it back
  onPeerMessage: (runtime, peer, channel, data) => {
    const chars = Buffer.from(data).toString("utf-8");

    const peerInstance = Peer.get(peer)!;

    const reversedChars = chars.split("").reverse().join("");

    peerInstance.send(channel, Buffer.from(reversedChars, "utf-8"));
  },
  // logs peer state changes, including connect and disconnect
  onPeerStateChange: (runtime, peer, state) => {
    console.log(`Peer ${peer} changed states to ${RainwayPeerState[state]}`);
  },

  /* eslint-disable @typescript-eslint/no-empty-function */
  onPeerDataChannel: () => {},
  onPeerError: () => {},
  onRuntimeConnectionLost: () => {},
  onStreamAnnouncement: () => {},
  /* eslint-enable @typescript-eslint/no-empty-function */
}).then(async (runtime) => {
  console.log(`Rainway SDK Version: ${runtime.version}`);
  console.log(`Peer ID: ${runtime.peerId}`);
  console.log(`Press Ctrl+C to Terminate`);

  // schedule some work to keep node from exiting
  const eventLoopInterval = setInterval(() => {
    // No actual work needed
  }, 30 * 1000);

  // clear the interval when CTRL+C signal is caught
  process.on("SIGINT", () => {
    clearInterval(eventLoopInterval);
  });
});
