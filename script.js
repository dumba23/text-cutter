class TextCutter {
    constructor() {
      this.text = '';
      this.onresult = null;
      this.accessToken = '';
      this.refreshToken = '';
      this.tokenExpiration = null;
    }
  
    async start() {
      await this.retrieveToken();
      this.processText();
    }
  
    async retrieveToken() {
      const loginData = {
        Email: 'levan.lashauri1@gmail.com',
        Password: 'Demo_1234'
      };
  
      const loginResponse = await fetch('https://enagramm.com/API/Account/Login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
      });
  
      const loginResult = await loginResponse.json();
      if (loginResponse.ok) {
        this.accessToken = loginResult.AccessToken;
        this.refreshToken = loginResult.RefreshToken;
        this.tokenExpiration = Date.now() + 1800000;
      } else {
        throw new Error('Token retrieval failed');
      }
    }
  
    async refreshTokenIfNeeded() {
      if (new Date() >= this.tokenExpiration) {
        const refreshTokenData = {
          AccessToken: this.accessToken,
          RefreshToken: this.refreshToken
        };
  
        const refreshTokenResponse = await fetch('https://enagramm.com/API/Account/RefreshToken', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(refreshTokenData)
        });
  
        const refreshTokenResult = await refreshTokenResponse.json();
        if (refreshTokenResponse.ok) {
            this.accessToken = refreshTokenResult.AccessToken;
            this.refreshToken = refreshTokenResult.RefreshToken;
            this.tokenExpiration = Date.now() + 1800000;
          } else {
            throw new Error('Token refresh failed');
          }
      }
    }
  
    processText() {
      while (this.text.length > 0) {
        let endIndex = 230;
  
        if (this.text.length > 150) {
          const subText = this.text.substring(150, 230);
          const punctuationIndex = this.findPunctuationIndex(subText);
  
          if (punctuationIndex !== -1) {
            endIndex = 150 + punctuationIndex + 1;
          }
        } else {
          endIndex = this.text.length;
        }
  
        const extractedText = this.text.substring(0, endIndex);
        this.text = this.text.substring(endIndex);
        this.sendToBackend(extractedText);
      }
    }
  
    sendToBackend(textChunk) {
      const model = {
        Language: 'ka',
        Text: textChunk,
        Voice: 0,
        IterationCount: 2
      };
  
      this.refreshTokenIfNeeded();
  
      fetch('https://enagramm.com/API/TTS/SynthesizeTextAudioPath', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.accessToken}`
        },
        body: JSON.stringify(model)
      })
        .then(response => response.json())
        .then(result => {
          var sourceUrl = result.AudioFilePath;
          this.onresult({ sourceUrl });
        })
        .catch(error => {
          console.error('Error:', error);
        });
    }
  
    findPunctuationIndex(text) {
      const punctuationMarks = ['.', '!', '?', ';', ',', ' '];
  
      for (let i = 0; i < text.length; i++) {
        if (punctuationMarks.includes(text[i])) {
          return i;
        }
      }
  
      return -1;
    }
  }

  export { TextCutter };
