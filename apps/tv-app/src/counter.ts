import { CallbackType, Config, FRAuth, FRStep, NameCallback, PasswordCallback, TokenManager } from '@forgerock/javascript-sdk';
import { client } from '@forgerock/token-vault';

const el = document.getElementById('token-vault-proxy') as HTMLElement
if (el === null) {
  throw new Error('Could not find element with id "token-vault-proxy"')
}

const register = client({
  app: {
    origin: 'http://localhost:8000',
  },
  interceptor: {
    file: new URL('../interceptor.ts', import.meta.url).pathname,
    scope: '/'
  },
  proxy: {
    origin: 'http://localhost:5173',
  }
});

const interceptor = await register.interceptor();
                    await register.proxy(el);

const tokenStore = register.store();


/**
 * Check URL for query parameters
 */
const url = new URL(document.location.href);
const params = url.searchParams;
const code = params.get('code');
const state = params.get('state');


Config.set({
  clientId: 'WebOAuthClient',
  redirectUri: `${window.location.origin}`,
  scope: 'openid profile me.read',
  serverConfig: {
    baseUrl: 'https://openam-crbrl-01.forgeblocks.com/am',
    timeout: 5000,
  },
  tree: 'Login',
  realmPath: 'alpha',
  tokenStore: {
    get: tokenStore.get,
    set: tokenStore.set,
    remove: tokenStore.remove,
  },
});

const step = await FRAuth.start();
console.log(step);

document.getElementById('login-automagically')?.addEventListener('click', async () => {
  const { hasTokens } = await tokenStore.has();
  console.log(hasTokens)
  if (hasTokens) {
      console.log('logged in')
    const el = document.getElementById('login-automagically')
    if (el) {
      el.innerHTML = 'logged in with a proxy!'
      return;
    }
  }
  if ('getReason' in step) {
    return FRAuth.next(undefined);
  }
  const username = 'ryan';
  const password = 'Password1!';
  const un = (step as FRStep).getCallbacksOfType(CallbackType.NameCallback)[0] as NameCallback;
  
  un.setName(username);
  const pw = (step as FRStep).getCallbacksOfType(CallbackType.PasswordCallback)[0] as PasswordCallback
  pw.setPassword(password);
  const loginStep = await FRAuth.next(step as FRStep);
  if ('getSuccessUrl' in loginStep) {
      console.log('logged in')
      const el = document.getElementById('login-automagically')
      if (el) {
        el.innerHTML = 'logged in with a proxy!'
      }
  } else {
    console.log('not logged in')
  }
});
/**
 * Let's make an initial check for tokens to see if the user is logged in
 */
const res = await (async () => {
  return await tokenStore.has();
})();
if (res.hasTokens) {
  console.log('hasTokens')
}

if (state && code) {
  await TokenManager.getTokens({ query: { code, state } });
  location.replace('http://localhost:8000');
}