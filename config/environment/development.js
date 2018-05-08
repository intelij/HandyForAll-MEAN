module.exports = {
    SOCIAL_NETWORKS: {
        'facebookAuth': {
            clientID: '528493914215166',
            clientSecret: '1cd5a10561c6ce2088d57e5596c8bd36',
            callbackURL: (process.env.DOMAIN || 'http://local.handyforall.com') + '/auth/facebook/callback'
        },
        'googleAuth': {
            clientID: '836516773751-id1ltcdtuf0grrhghri8d1sdn9tb3v1q.apps.googleusercontent.com',
            clientSecret: 'CJLPUTXyNPNBTlY8JSoXkzJA',
            callbackURL: (process.env.DOMAIN || 'http://local.handyforall.com') + '/auth/google/callback'
        },
        'twitterAuth': {
            clientID: 'Tj7kigJ0WhshSM4639InLF1yq',
            clientSecret: '7qmFu6sVtCFZcJiSmUM8NulNTmi67tlqsPJKS4e8TtHFOYu8wY',
            callbackURL: (process.env.DOMAIN || 'http://local.handyforall.com') + '/auth/twitter/callback'
        },
        'githubAuth': {
            clientID: '33ac35ff65c633b348d3',
            clientSecret: 'a04dc6b98b99324904054f76d61a024d7dba3151',
            callbackURL: (process.env.DOMAIN || 'http://local.handyforall.com') + '/auth/github/callback'
        },
        'linkedinAuth': {
            clientID: '770i5iajpfwdwp',
            clientSecret: 'VfX03lgnOSvpXqw0',
            callbackURL: (process.env.DOMAIN || 'http://local.handyforall.com') + '/auth/linkedin/callback'
        }
    }
};