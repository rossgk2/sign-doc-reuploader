const defaultTarget = 'https://migrationtooldev.com';

module.exports = [
   {
      context: ['/oauth-api/**'],
      target: defaultTarget,
      changeOrigin: true,
      secure: false
   }
];