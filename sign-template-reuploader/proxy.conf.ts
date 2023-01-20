const defaultTarget = 'https://secure.na1.adobesignstage.us/api/gateway/adobesignauthservice';

module.exports = [
   {
      /* The double asterix ** matches paths of the form /oauth-api/x1/x2/.../xn; a single asterix * would only
      match paths of the form /oauth-api/x1. */
      context: '/oauth-api/**',
      target: defaultTarget,
      changeOrigin: true,
      secure: false,
      /* This pathRewrite option causes '/oauth-api' to be deleted from the path before the concatenation (target + path) is formed. */
      pathRewrite: {'^/oauth-api': ''}
   }
];


// http.post('/oauth-api/api/v1/token', null, ...)

// 'https://secure.na1.adobesign.us/api/gateway/adobesignauthservice/api/v1/token'

//'/oauth-api/x1/x2/x3' -> 'https://secure.na1.adobesign.us/api/gateway/adobesignauthservice/x1/x2/x3'

//'/oauth-api/x1/x2/x3' -> 'https://migrationtooldev.com/x1/x2/x3'

// localhost == migrationtooldev.com
