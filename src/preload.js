// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { ipcRenderer } = require("electron");
window.addEventListener("DOMContentLoaded", () => {
  // Tool bar
  let app_dir = localStorage.getItem("app_dir");
  if (!localStorage.getItem("app_auth")) {
    localStorage.setItem(
      "app_auth",
      JSON.stringify({
        any: true,
        username: ``,
        password: ``,
      })
    );
  }
  let app_auth = JSON.parse(localStorage.getItem("app_auth"));
  ipcRenderer.send("ftp:auth", { auth: app_auth });

  if (!localStorage.getItem("app_port")) {
    localStorage.setItem("app_port", 21);
  }
  let app_port = eval(localStorage.getItem("app_port"));
  ipcRenderer.send("ftp:port", { port: app_port });

  ipcRenderer.on("info", (event, { cwd, ip, port }) => {
    console.log(`ftp:\\${ip}:${port}`);
    document.querySelector(".ip_text").textContent = `ftp://${ip}:${port}`;
    if (app_dir) {
      ipcRenderer.send("ftp:root", { root_dir: app_dir });
    } else {
      localStorage.setItem("app_dir", cwd);
      app_dir = cwd;
      ipcRenderer.send("ftp:root", { root_dir: app_dir });
    }

    ipcRenderer.send("ftp:run");
  });
  ipcRenderer.on("ip", (event, ip) => {
    console.log(ip);
  });

  const minimize_btn = document.querySelector(".minimize_btn");
  const close_btn = document.querySelector(".close_btn");
  const auth_container = document.querySelector(".auth");
  const inputName = auth_container.querySelectorAll("input")[0];
  const inputPassword = auth_container.querySelectorAll("input")[1];
  const port_input = document.querySelector(".port_input");
  const auth_switch = document.querySelector("#switch-2");
  const dir_path = document.querySelector(".dir_path");
  const refresh_btn = document.querySelector(".refresh_btn");
  const ip_container = document.querySelector(".ip");
  ip_container.addEventListener("click", () => {
    navigator.clipboard.writeText(
      document.querySelector(".ip_text").textContent
    );
  });

  dir_path.querySelector("h2").innerHTML = app_dir;

  port_input.value = app_port;
  inputName.value = app_auth.username;
  inputPassword.value = app_auth.password;

  refresh_btn.addEventListener("click", () => {
    refresh_btn.classList.add("dis");
    ipcRenderer.send("ftp:root", { root_dir: app_dir });
    ipcRenderer.send("ftp:auth", { auth: app_auth });
    ipcRenderer.send("ftp:port", { port: app_port });
    ipcRenderer.send("refresh");
  });
  port_input.addEventListener("input", () => {
    port_input.value = port_input.value.replace(/[^0-9]/g, "");
    localStorage.setItem("app_port", port_input.value);
    app_port = port_input.value;
  });
  port_input.addEventListener("blur", () => {
    if (port_input.value.length == 0) {
      port_input.value = 21;
      localStorage.setItem("app_port", port_input.value);
      app_port = port_input.value;
    }
  });
  inputName.addEventListener("input", () => {
    localStorage.setItem(
      "app_auth",
      JSON.stringify({
        any: false,
        username: inputName.value,
        password: inputPassword.value,
      })
    );
    app_auth = JSON.parse(localStorage.getItem("app_auth"));
  });
  inputPassword.addEventListener("input", () => {
    localStorage.setItem(
      "app_auth",
      JSON.stringify({
        any: false,
        username: inputName.value,
        password: inputPassword.value,
      })
    );
    app_auth = JSON.parse(localStorage.getItem("app_auth"));
  });

  auth_switch.checked = app_auth.any;
  function authSwitch() {
    if (!auth_switch.checked) {
      localStorage.setItem(
        "app_auth",
        JSON.stringify({
          any: false,
          username: inputName.value,
          password: inputPassword.value,
        })
      );
      app_auth = JSON.parse(localStorage.getItem("app_auth"));

      auth_container.classList.remove("dis");
    }
    if (auth_switch.checked) {
      localStorage.setItem(
        "app_auth",
        JSON.stringify({
          any: true,
          username: inputName.value,
          password: inputPassword.value,
        })
      );
      app_auth = JSON.parse(localStorage.getItem("app_auth"));

      auth_container.classList.add("dis");
    }
  }
  ipcRenderer.on("set:dir", (event, dir) => {
    localStorage.setItem("app_dir", dir);
    app_dir = dir;
    dir_path.querySelector("h2").innerHTML = dir;
  });
  authSwitch();

  auth_switch.addEventListener("change", () => {
    authSwitch();
  });
  dir_path.addEventListener("click", async () => {
    ipcRenderer.send("open:dir");
  });
  minimize_btn.addEventListener("click", () => {
    ipcRenderer.send("minimize");
  });
  close_btn.addEventListener("click", () => {
    ipcRenderer.send("close");
  });
});
