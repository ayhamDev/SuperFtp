module.exports = {
  packagerConfig: {},
  rebuildConfig: {
    icon: "src\\images\\icon",
  },

  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      config: {
        icon: "src\\images\\icon.png",
        setupIcon: "src\\images\\icon.ico",
      },
    },
    {
      name: "@electron-forge/maker-zip",
      platforms: ["darwin"],
    },
    {
      name: "@electron-forge/maker-deb",
      config: {},
    },
    {
      name: "@electron-forge/maker-rpm",
      config: {},
    },
  ],
};
