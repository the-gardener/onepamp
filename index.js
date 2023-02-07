require('dotenv').config({ silent: true });
const express = require('express');
const cors = require('cors');
const opai = require('openai');
const telegram = require('node-telegram-bot-api');


const configuration = new opai.Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new opai.OpenAIApi(configuration);
const app = express();

app.use(cors());
app.use(express.json());

app.get('/', async(req, res) => {
  res.status(200).send('Hello from Chips Ahoy');
});

const tgKey = process.env.TELEGRAM_KEY;

const Bot = new telegram(tgKey, { polling: true, filepath: false });
const refusedMsg = 'Mời quý anh chị chim kút!';
const invalidMsg = "Quý anh vui lòng khép loa thay vì thổi ra những điều nhảm nhí!";
const botName = '/maria';

Bot.onText(/\/start/, (msg) => {
  console.log('calling start--------------');
  if (!msg.from) return Bot.sendMessage(msg.chat.id, refusedMsg);
  return Bot.sendMessage(msg.chat.id, "Hello from Maria Ozawa");
});

Bot.on('text', async (msg) => {
  if (!msg.from) {
    return Bot.sendMessage(msg.chat.id, refusedMsg);
  } else if (!msg.text) {
    return Bot.sendMessage(msg.chat.id, invalidMsg);
  } else if (msg.text.toLowerCase().startsWith(botName.toLowerCase())){
    const extractedText = msg.text.substring(botName.length, msg.text.length);
    console.log('Extracted Text: ' + extractedText);
    const opaiRes = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: `${extractedText}`,
      temperature: 0,
      max_tokens: 3000,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });
    return Bot.sendMessage(msg.chat.id, opaiRes.data.choices[0].text, { parse_mode: 'HTML', reply_to_message_id: msg.message_id });
  }
  return null;
});
const port = process.env.PORT || 3000
app.listen(port, () => console.log('cyclic test app are running on port ' + port));
