const fs = require("fs");
const textToSpeech = require("@google-cloud/text-to-speech");
const logger = require("./log.middleware.js");

const client = new textToSpeech.TextToSpeechClient();

const getSpeech = async (text) => {
    try {
        const request = {
            input: {text: text},
            voice: {languageCode: 'ko_KR', ssmlGender: 'FEMALE', name: 'ko-KR-Wavenet-A'},
            audioConfig: {audioEncoding: "MP3"},
        }

        const result = await client.synthesizeSpeech(request);
    
        const ts_hms = Date.now().toString();
        const audioData = result[0].audioContent;
    
        return audioData;
    } catch (err) {
        logger("tts error : " + err, "err");
        return null;
    }
}

module.exports.getSpeech = getSpeech;