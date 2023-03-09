module.exports = {
  packagerConfig: { asar: true },
  plugins:
  [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {}
    }
  ],
  rebuildConfig: {},
  makers:
  [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        authors: 'Ross Grogan-Kaylor',
        description: 'A template migration tool for Adobe Sign'
      }
    },
    {
      name: '@electron-forge/maker-dmg',
      config: {}
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin']
    },
    {
      name: '@electron-forge/maker-deb',
      config: {}
    }
  ],
};
