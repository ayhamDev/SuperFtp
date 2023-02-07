const { Notification } = require("electron");
var ftpd = require("ftpd");
const ip = require("ip");
var options = {
  host: process.env.IP || ip.address(),
  tls: null,
};

const ftp = {
  server: null,
  Run(ROOT_DIR = process.cwd(), auth, port = 21) {
    this.server = new ftpd.FtpServer(options.host, {
      getInitialCwd: function () {
        return "/";
      },
      getRoot: function () {
        return ROOT_DIR;
      },
      pasvPortRangeStart: 1025,
      pasvPortRangeEnd: 1050,
      tlsOptions: options.tls,
      allowUnauthorizedTls: true,
      useWriteFile: false,
      useReadFile: false,
      uploadMaxSlurpSize: 7000, // N/A unless 'useWriteFile' is true.
    });

    this.server.on("error", function (error) {
      console.log("FTPthis.server error:", error);
    });

    this.server.on("client:connected", function (connection) {
      var username = null;
      connection.on("command:user", function (user, success, failure) {
        if (auth.any) {
          username = user;
          success();
        } else {
          if (user == auth.username) {
            username = user;
            console.log(username);
            success();
          } else {
            failure();
            NotificationFail(connection.socket.remoteAddress);
          }
        }
      });

      connection.on("command:pass", function (pass, success, failure) {
        if (auth.any) {
          success(username);
          NotificationSuccess(connection.socket.remoteAddress);
        } else {
          if (pass == auth.password) {
            success(username);
            NotificationSuccess(connection.socket.remoteAddress);
          } else {
            failure();
            NotificationFail(connection.socket.remoteAddress);
          }
        }
      });
    });

    this.server.listen(port);
    console.log("Listening on port " + port);
  },
  close() {
    this.server.close();
  },
};
function NotificationSuccess(address) {
  const notification = new Notification({
    icon: "src/images/icon.png",
    title: "New Connection",
    body: `${address.split(":")[3]} Connected To The Ftp Server.`,
    silent: false,
  });
  return notification.show();
}

function NotificationFail(address) {
  const notification = new Notification({
    icon: "src/images/icon.png",
    title: "Connection Failed",
    body: `${
      address.split(":")[3]
    } Connection Faild Due To incorrect Login Info.`,
    silent: false,
  });
  return notification.show();
}
module.exports = ftp;
