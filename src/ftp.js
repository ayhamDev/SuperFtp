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
      console.log("client connected: " + connection.socket.remoteAddress);
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
          }
        }
      });

      connection.on("command:pass", function (pass, success, failure) {
        if (auth.any) {
          success(username);
        } else {
          if (pass == auth.password) {
            success(username);
          } else {
            failure();
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

module.exports = ftp;
