class TwitchChat {
  constructor(channel) {
    this.client = null;
    this.channel = channel;
  }

  Connect() {
    // main connection
    this.client = new WebSocket("wss://irc-ws.chat.twitch.tv:443", "irc");

    // events
    this.client.onopen = this.ProcessOpen.bind(this);
    this.client.onmessage = this.ProcessMessage.bind(this);
    this.client.onerror = this.ProcessError.bind(this);
    this.client.onclose = this.ProcessClose.bind(this);
  }

  ProcessOpen() {
    this.client.send("PASS OMEGALUL");
    this.client.send("NICK justinfan12345");
    this.client.send("CAP REQ :twitch.tv/tags");
    this.client.send("CAP REQ :twitch.tv/commands");
    this.client.send("CAP REQ :twitch.tv/membership");
    this.client.send("JOIN "+this.channel);
  }

  ProcessMessage(message) {
    var lines = message.data.split("\n");
    for (var line of lines) {
      console.log(line);
    }
  }

  ProcessError(error) {
    console.log(error);
  }

  ProcessClose() {
    console.log("disconnect");
  }
}

