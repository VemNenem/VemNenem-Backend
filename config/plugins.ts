module.exports = ({ env }) => ({
    // email: {
    //     config: {
    //         provider: 'strapi-provider-email-brevo',
    //         providerOptions: {
    //             host: env('SMTP_USERNAME'),
    //             apiKey: env('BREVO_API_KEY')
    //         },
    //         settings: {
    //             defaultSenderEmail: env('SMTP_DEFAULT_SENDER'),
    //             defaultSenderName: env('SMTP_DEFAULT_NAME'),
    //             defaultReplyTo: env('SMTP_DEFAULT_REPLY'),
    //         },
    //     },
    // },
    // email: {
    //     config: {
    //         provider: 'nodemailer',
    //         providerOptions: {
    //             host: env('SMTP_HOST'),
    //             port: env('SMTP_PORT'),
    //             auth: {
    //                 user: env('SMTP_USERNAME'),
    //                 pass: env('SMTP_PASSWORD'),
    //             },
    //             // ... any custom nodemailer options
    //         },
    //         settings: {
    //             defaultFrom: 'mail@mestresdaweb.io',
    //             defaultReplyTo: 'mail@mestresdaweb.io',
    //         },
    //     },
    // },
    'users-permissions': {
        config: {
            jwt: {
                /* the following  parameter will be used to generate:
                 - regular tokens with username and password
                 - refreshed tokens when using the refreshToken API
                */
                expiresIn: '2h', // This value should be lower than the refreshTokenExpiresIn below.
            },
        },
    },
    'refresh-token': {
        config: {
            refreshTokenExpiresIn: '7d', // this value should be higher than the jwt.expiresIn
            requestRefreshOnAll: false, // automatically send a refresh token in all login requests.
            refreshTokenSecret: env('REFRESH_JWT_SECRET') || 'SomethingSecret',//process.env.REFRESH_JWT_SECRET,
            cookieResponse: false // if set to true, the refresh token will be sent in a cookie
        },
    }
});


