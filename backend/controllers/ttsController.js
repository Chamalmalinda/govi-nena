const axios = require('axios');

// Split text into chunks that Google Translate TTS can accept (maximum 180 chars)
function splitText(text, maxLen = 180) {
  const words = text.split(' ');
  const chunks = [];
  let currentChunk = '';

  for (const word of words) {
    if ((currentChunk + ' ' + word).length > maxLen) {
      if (currentChunk) chunks.push(currentChunk.trim());
      currentChunk = word;
    } else {
      currentChunk = currentChunk ? currentChunk + ' ' + word : word;
    }
  }
  if (currentChunk) chunks.push(currentChunk.trim());
  return chunks;
}

// @route   GET /api/tts
// @desc    Convert text to speech audio stream
// @access  Public
exports.streamTTS = async (req, res) => {
  const { text, lang } = req.query;
  const targetLang = lang || 'si';

  if (!text) {
    return res.status(400).send('Missing text parameter');
  }

  try {
    const chunks = splitText(text, 180);
    const buffers = [];

    for (const chunk of chunks) {
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunk)}&tl=${targetLang}&client=tw-ob`;
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36'
        },
        responseType: 'arraybuffer'
      });

      if (response.status === 200) {
        buffers.push(Buffer.from(response.data));
      } else {
        console.error(`Failed to fetch TTS segment for: "${chunk}"`);
      }
    }

    if (buffers.length === 0) {
      return res.status(500).send('Failed to generate audio content');
    }

    const finalBuffer = Buffer.concat(buffers);

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': finalBuffer.length.toString()
    });

    res.send(finalBuffer);

  } catch (err) {
    console.error('Server-side TTS error:', err.message);
    res.status(500).send('Internal Server Error');
  }
};
