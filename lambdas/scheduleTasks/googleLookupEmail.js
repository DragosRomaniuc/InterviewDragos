const AWS = require('aws-sdk');
const Axios = require('axios');
const moment = require('moment');

const Responses = require('../common/API_Responses');

const SES = new AWS.SES();

exports.handler = async event => {
    console.log('event', event);

    const params = {
        Destination: {
            ToAddresses: ['romaniucdragos98@gmail.com']
        },
        Message: {
            Body: {
                Text: {
                    Charset: "UTF-8",
                    Data: null
                }
            },
            Subject: {
                Data: 'google lookup information'
            },
        },
        Source: 'romaniucdragos98@gmail.com'
    };

    const topic = 'Salsa';

    try {
        const searchInformation = await googleSearch(topic);

        params.Message.Body.Text.Data = generateEmailText(searchInformation, topic);

        await SES.sendEmail(params).promise();
        return Responses._200({ message: 'Email Sent.' });
    } catch (error) {
        console.log('Error: ', error);
        return Responses._400({ message: 'Failed to send the Email.' })
    }
};

const googleSearch = async (query) => {
    const url = process.env.GOOGLE_SEARCH_API_URL;

    const options = {
        params: {
            key: process.env.GOOGLE_SEARCH_API_KEY,
            cx: process.env.GOOGLE_ENGINE_ID,
            q: query
        }
    };

    const { data: googleData } = await Axios.get(url, options);

    if (!googleData) {
        throw Error('No data from google api.')
    };

    return googleData.searchInformation;
};

const generateEmailText = (searchInformation, topic) => {
    const { formattedTotalResults: totalResults, formattedSearchTime: searchTime} = searchInformation;
    
    return `Dragos Romaniuc Interview -- Sending mails will stop in 12h.
    
    Found ${totalResults} results about ${topic} in ${searchTime} seconds at ${moment().format("HH:MM:ss")} on ${moment().format("DD/MM/YYYY")}
    `
}