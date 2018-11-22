// This is litrally a port of my IRC connection from the PhaazeOS project (Phaazebot's IRC module)
// in Websocket Style for a easy inclue into OBS or others.
// styles and js can easyly be included

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

  Close() {
    this.client.close();
  }

  ProcessOpen() {
    this.client.send("PASS OMEGALUL");
    this.client.send("NICK justinfan12345");
    this.client.send("CAP REQ :twitch.tv/tags");
    this.client.send("CAP REQ :twitch.tv/commands");
    this.client.send("CAP REQ :twitch.tv/membership");
    this.client.send("JOIN #"+this.channel);
  }

  ProcessMessage(message) {
    var lines = message.data.split("\n");
    for (var line of lines) {
      if (line == "") { continue }

      var ping = /^PING (.+)$/.exec(line);
      if ( ping ) {
        this.client.send("PONG "+match[1]);
      }

      var msg = /^@.+\.tmi\.twitch\.tv PRIVMSG #.+/.exec(line);
      if ( msg ) {
        var m = new Message(line);
        m = custom(m);
        if (m == null) {
          return;
        }
        console.log(m);
      }
    }
  }

  ProcessError(error) {
    console.log(error);
  }

  ProcessClose() {
    console.log("Disconnect");
  }
}

class Message {
  constructor(data) {
    this.raw = data;

    this.badges_str = null;
    this.badges = [];
    this.color = null;
    this.display_name = null;
    this.name = null;
    this.emotes_str = null;
    this.emotes = [];
    this.room_id = null;
    this.room_name = null;
    this.user_id = null;
    this.user_type = null;
    this.sub = null;
    this.mod = null;
    this.turbo = null;
    this.content = null;

    this.process();
    this.process_badges();
    this.process_emotes();
    delete this.raw;
  }

  process() {

    var match = /badges=(.*?)[; ]/.exec(this.raw);
    if (match) {
      this.badges_str = match[1];
    }

    match = /color=#(.*?)[; ]/.exec(this.raw);
    if (match) {
      this.color = match[1];
    }

    match = /display-name=(.+?)[; ]/.exec(this.raw);
    if (match) {
      this.display_name = match[1];
    }

    match = /!(.+?)@/.exec(this.raw);
    if (match) {
      this.name = match[1];
    }

    match = /emotes=(.*?)[; ]/.exec(this.raw);
    if (match) {
      this.emotes_str = match[1];
    }

    match = /room-id=(.+?)[; ]/.exec(this.raw);
    if (match) {
      this.room_id = match[1];
    }

    match = /"PRIVMSG #(.+?) :/.exec(this.raw);
    if (match) {
      this.room_name = match[1];
    }

    match = /user-id=(.+?)[; ]/.exec(this.raw);
    if (match) {
      this.user_id = match[1];
    }

    match = /user-type=(.*?)[; ]/.exec(this.raw);
    if (match) {
      this.user_type = match[1];
    }

    match = /subscriber=(0|1)[; ]/.exec(this.raw);
    if (match) {
      this.sub = match[1];
    }

    match = /mod=(0|1)[; ]/.exec(this.raw);
    if (match) {
      this.mod = match[1];
    }

    match = /turbo=(0|1)[; ]/.exec(this.raw);
    if (match) {
      this.turbo = match[1];
    }

    match = /PRIVMSG #.+? :(.+)/.exec(this.raw);
    if (match) {
      this.content = match[1];
    }

  }

  process_emotes() {
    if (this.emotes_str == "" | this.emotes_str == "") { return }
    var emote_str_list = this.emotes_str.split("/");
    for (var emote_str of emote_str_list) {
      var e = new Emote(emote_str, this.content);
      this.emotes.push(e);
    }
  }

  process_badges() {
    if (this.badges_str == "" | this.badges_str == "") { return }
    var badge_str_list = this.badges_str.split(",");
    for (var badge_str of badge_str_list) {
      var b = new Badge(badge_str);
      this.badges.push(b);
    }
  }

}

class Emote {
  constructor(emotes_str, message_content) {
    this.emotes_str = emotes_str;
    this.message_content = message_content;

    this.id = null;
    this.count = 0;
    this.name = null;
    this.positions = [];

    this.process();
    delete this.emotes_str;
    delete this.message_content;
  }

  process() {
    let s = this.emotes_str.split(':');
    this.id = s[0];
    let pos_str = s[1];

    for (var emote_str of pos_str.split(",")) {
      this.count += 1;
      let se = emote_str.split("-");
      let start = se[0];
      let end = se[1];
      this.positions.push( {"start":start,"end":end} );
    }

    let first_emote_pos = this.positions[0];
    let from_ = parseInt(first_emote_pos["start"]);
    let to_ = parseInt(first_emote_pos["end"]);


    this.name = this.message_content.substring(from_,to_+1)
  }
}

class Badge {
  constructor(badge_str) {
    this.badge_str = badge_str;

    this.name = null;
    this.version = null;

    this.process();
    delete this.badge_str;
  }

  process () {
    let splited = this.badge_str.split('/');
    if (splited.length >= 1) {
      this.name = splited[0];
    }
    if (splited.length > 1) {
      this.version = splited[1];
    }
  }
}