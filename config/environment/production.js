module.exports = {
    SOCIAL_NETWORKS: {
        'facebookAuth': {
            clientID: '1699671247014568',
            clientSecret: 'ca21cf003efc524a7ffb8af9c380f547',
            callbackURL: (process.env.DOMAIN || 'http://businessblog.win') + '/auth/facebook/callback'
        },
        'googleAuth': {
            clientID: process.env.GOOGLE_ID || '836516773751-id1ltcdtuf0grrhghri8d1sdn9tb3v1q.apps.googleusercontent.com',
            clientSecret: process.env.GOOGLE_SECRET || 'CJLPUTXyNPNBTlY8JSoXkzJA',
            callbackURL: (process.env.DOMAIN || 'http://businessblog.win') + '/auth/google/callback'
        }
    }
};