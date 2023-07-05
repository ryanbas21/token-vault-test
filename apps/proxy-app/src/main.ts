import { proxy } from '@forgerock/token-vault';


proxy({
    app: {
        origin: 'http://localhost:8000',
    },
    forgerock: {
        clientId: 'WebOAuthClient',
        oauthThreshold: 5000,
        realmPath: 'alpha',
        scope: 'openid profile me.read',
        serverConfig: {
        baseUrl: 'https://openam-crbrl-01.forgeblocks.com/am',
        },
    }
})