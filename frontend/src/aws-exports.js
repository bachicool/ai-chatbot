const awsConfig = {
  Auth: {
    Cognito: {
      userPoolId: 'ap-southeast-2_laMaI1FC4',
      userPoolClientId: '2or4hrsc3td14j0drqamtkji6k',
      loginWith: {
        oauth: {
          domain: 'login.pavcloud.click',
          scopes: ['openid', 'email', 'profile'],
          redirectSignIn: ['https://chat.pavcloud.click'],
          redirectSignOut: ['https://chat.pavcloud.click'],
          responseType: 'code'
        }
      }
    }
  }
};

export default awsConfig;