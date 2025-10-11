let recognition;

function startConverting() {
    if ('webkitSpeechRecognition' in window) {
        recognition = new webkitSpeechRecognition();
        setupRecognition(recognition);
        recognition.start();
    }
}

function setupRecognition(recognition) {
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = function(event) {
        const { finalTranscript, interTranscript } = processResult(event.results);
        document.getElementById("result").innerHTML = finalTranscript + interTranscript;
    }
}

function processResult(results) {
    let finalTranscript = '';
    let interTranscript = '';

    for (let i = 0; i < results.length; i++) {
        let transcript = results[i][0].transcript;
        transcript = transcript.replace("\n", "<br>");

        if (results[i].isFinal) {
            finalTranscript += transcript;
        } else {
            interTranscript += transcript;
        }
    }

    return { finalTranscript, interTranscript };
}

function stopConverting() {
    if (recognition) {
        recognition.stop();
    }
}

function textToAudio() {
    let msg = document.querySelector('.text').value;
    let speech = new SpeechSynthesisUtterance();
    
    // Fetch the available voices
    let voices = speechSynthesis.getVoices();

    // Select voice from dropdown
    let selectedVoice = document.getElementById('voices').value;
    speech.voice = voices.find(voice => voice.name === selectedVoice);

    speech.lang = "en-US";
    speech.text = msg;
    speech.volume = 1;
    speech.rate = 1;
    speech.pitch = 1;

    speechSynthesis.speak(speech);
}

function clearText(elementId) {
    document.getElementById(elementId).value = ''; // for text area
    document.getElementById(elementId).innerHTML = ''; // for div
}

// Fetch voices when voices are loaded (async)
speechSynthesis.onvoiceschanged = function() {
    let voices = speechSynthesis.getVoices();

    // Populate dropdown with voices
    let voiceSelect = document.getElementById('voices');
    voiceSelect.innerHTML = '';
    voices.forEach(voice => {
        let option = document.createElement('option');
        option.textContent = voice.name + ' (' + voice.lang + ')';
        option.value = voice.name;
        voiceSelect.appendChild(option);
    });
};
