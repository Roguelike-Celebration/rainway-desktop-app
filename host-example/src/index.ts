import rainway, {
  RainwayInputLevel,
  RainwayLogLevel,
  RainwayPeerState,
  RainwayStreamType,
} from "@rainway/native";

const cliArgs = process.argv.slice(2);

if (!cliArgs[0]) {
  throw new Error(
    `Expected <apiKey> as the first (and only) command line argument`
  );
}

const apiKey = cliArgs[0];

rainway.logLevel = RainwayLogLevel.Info;
rainway.addEventListener("log", (ev) => {
  console.log(
    `${RainwayLogLevel[ev.data.level]} [${ev.data.target}] ${ev.data.message}`
  );
});

(async function mainAsync() {
  const conn = await rainway.connect({
    apiKey,
    externalId: "node-host-example",
  });

  conn.addEventListener("peer-request", async (ev) => {
    const peer = await ev.accept();

    peer.addEventListener("connection-state-change", (ev) => {
      console.log(
        `Peer ${peer.id} (${peer.externalId}) changed state to ${
          RainwayPeerState[ev.data]
        }`
      );
    });

    peer.addEventListener("stream-request", async (ev) => {
      const stream = await ev.accept({
        type: RainwayStreamType.FullDesktop,
        permissions: RainwayInputLevel.Mouse | RainwayInputLevel.Keyboard,
        processIds: [],
      });

      console.log(
        `Accepted request and created stream ${stream.id} (${
          RainwayStreamType[stream.type]
        })`
      );
    });

    peer.addEventListener("datachannel", (ev) => {
      const dc = ev.data;

      dc.addEventListener("message", (ev) => {
        console.log(ev.asString);
        // echo back the characters, in reverse
        const reversedChars = ev.asString.split("").reverse().join("");

        console.log("sending back " + reversedChars);

        dc.send(reversedChars);
      });
    });
  });

  console.log(`Rainway SDK Version: ${rainway.version}`);
  console.log(`Peer ID: ${conn.id}`);
  console.log(`Press Ctrl+C to Terminate`);

  // shutdown when CTRL+C signal is caught
  await new Promise<void>((resolve) => {
    process.once("SIGINT", () => {
      resolve();
    });
  });

  // clean up the connection
  conn.close();
})().then(
  () => console.log("Shutting down"),
  (e) => console.error(`Error: ${e}`)
);
