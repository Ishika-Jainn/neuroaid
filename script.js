// google map script 
function initMap() {
    const defaultLocation = { lat: 28.6139, lng: 77.2090 }; // Delhi
    const map = new google.maps.Map(document.getElementById("liveMap"), {
      zoom: 12,
      center: defaultLocation
    });
    new google.maps.Marker({
      position: defaultLocation,
      map,
      title: "Flood Incident - District 9"
    });
  }
// Chatbot Script

const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");

function appendMessage(sender, text) {
  const msgDiv = document.createElement("div");
  msgDiv.className = `message ${sender}`;
  
  if (sender === "bot") {
    msgDiv.innerHTML = `
      <span>${text}</span>
      <button onclick="speakMessage('${text.replace(/'/g, "\\'")}')" style="margin-left: 10px; background: none; border: none; cursor: pointer;">🔊</button>
    `;
  } else {
    msgDiv.textContent = text;
  }

  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}


function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;
  appendMessage("user", text);
  userInput.value = '';
  botResponse(text);
}

function botResponse(userText, forcedEmotion = null) {
  const emotion = forcedEmotion || detectEmotion(userText);
  document.getElementById("emotionIndicator").textContent = `Detected Emotion: ${getEmoji(emotion)} ${capitalize(emotion)}`;
  
  const typingDiv = document.createElement("div");
  typingDiv.className = "message bot";
  typingDiv.id = "typing";
  typingDiv.innerHTML = "<i> typing...</i>";
  chatBox.appendChild(typingDiv);
  chatBox.scrollTop = chatBox.scrollHeight;

  const reply = generateReply(userText.toLowerCase(), emotion);
  setTimeout(() => {
    document.getElementById("typing").remove();
    appendMessage("bot", reply);
    showSmartSuggestions();
  }, 1000);
}



function detectEmotion(text) {
  const lowercase = text.toLowerCase();
  if (lowercase.includes("scared") || lowercase.includes("afraid") || lowercase.includes("panic")) return "fear";
  if (lowercase.includes("hurt") || lowercase.includes("injured") || lowercase.includes("pain")) return "distress";
  if (lowercase.includes("thank") || lowercase.includes("grateful")) return "gratitude";
  if (lowercase.includes("angry") || lowercase.includes("frustrated")) return "anger";
  return "neutral";
}


function generateReply(text, emotion) {
  switch (emotion) {
    case "fear":
      return "😨 It’s okay, I’m here with you. Please stay calm and tell me what’s happening.";
    case "distress":
      return "🩹 I’m really sorry to hear that. Do you need urgent medical help?";
    case "gratitude":
      return "😊 You're welcome. I'm always here for you.";
    case "anger":
      return "😔 I'm sorry you're feeling this way. I’ll do my best to help.";
    default:
      if (text.includes("help") || text.includes("emergency")) {
        return "🚨 I'm ready. Please describe your emergency or share your location.";
      } else {
        return "🤖 Thank you for reaching out. Let me process that and get you help.";
      }
  }
}


function startVoiceInput() {
  if (!('webkitSpeechRecognition' in window)) {
    alert("Voice input not supported in your browser.");
    return;
  }
  const recognition = new webkitSpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.onresult = function(event) {
    const transcript = event.results[0][0].transcript;
    userInput.value = transcript;
    sendMessage();
  };
  recognition.onerror = function(event) {
    console.error("Speech recognition error:", event.error);
  };
  recognition.start();
}

window.onload = () => {
  appendMessage("bot", "👋 Hello! I'm NeuroAid Bot. How can I assist you today?");
}


userInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
    sendMessage();
  }
});
function getEmoji(emotion) {
  switch (emotion) {
    case "fear": return "😨";
    case "distress": return "🩹";
    case "gratitude": return "😊";
    case "anger": return "😔";
    default: return "🤖";
  }
}

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}
function triggerQuickReport() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;
      const locationMessage = `My location: https://www.google.com/maps?q=${latitude},${longitude}`;
      appendMessage("user", "I need help!");
      botResponse("I need help!", "fear");
      setTimeout(() => appendMessage("user", locationMessage), 1000);
    }, () => {
      appendMessage("user", "I need help!");
      botResponse("I need help!", "fear");
      appendMessage("user", "Unable to access location.");
    });
  } else {
    appendMessage("user", "I need help!");
    botResponse("I need help!", "fear");
    appendMessage("user", "Geolocation not supported.");
  }
}
function showSmartSuggestions() {
  const suggestionBox = document.getElementById("smartSuggestions");
  suggestionBox.innerHTML = `
    <button onclick="appendMessage('user', 'Call medical help 🚑'); botResponse('Call medical help')" class="btn">🚑 Call medical help</button>
    <button onclick="shareMyLocation()" class="btn">📍 Share my location</button>
    <button onclick="appendMessage('user', 'Notify nearby volunteer 📞'); botResponse('Notify volunteer')" class="btn">📞 Notify a volunteer</button>
  `;
}

function shareMyLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;
      const locationURL = `https://www.google.com/maps?q=${latitude},${longitude}`;
      appendMessage("user", "Here's my location: " + locationURL);
      botResponse("Here is my location");
    });
  } else {
    appendMessage("user", "Geolocation not supported.");
  }
}

function uploadImage() {
  const input = document.getElementById("imageUpload");
  if (input.files && input.files[0]) {
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = function (e) {
      const imgDiv = document.createElement("div");
      imgDiv.className = "message user";
      imgDiv.innerHTML = `<img src="${e.target.result}" alt="Uploaded Image" style="max-width: 200px; border-radius: 10px;">`;
      chatBox.appendChild(imgDiv);
      chatBox.scrollTop = chatBox.scrollHeight;

      // Bot reply
      setTimeout(() => {
        appendMessage("bot", "🧠 Processing the image...");
        showSmartSuggestions();
      }, 800);
    };
    reader.readAsDataURL(file);
  }
}

function speakMessage(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  speechSynthesis.speak(utterance);
}
document.getElementById("loginForm").addEventListener("submit", function(e) {
  e.preventDefault();
  const username = this.elements[0].value;
  const password = this.elements[1].value;
  
  if (username === "admin" && password === "neuroaid123") {
    alert("Login successful!");
    document.getElementById("login").style.display = "none";
    document.getElementById("dashboard").scrollIntoView({ behavior: "smooth" });
  } else {
    alert("Invalid credentials!");
  }
});
// 👇 Incident Feed List
const incidents = [
  "🚑 Medical team dispatched to Sector 5",
  "🌊 Water level rising near Canal Street",
  "📦 Relief supplies reached Village B",
  "📶 Emergency tower deployed in Zone 4",
  "🧃 Food kits distributed to Camp Alpha"
];

// 👇 Auto-update the incident feed every few seconds
setInterval(() => {
  const feed = document.getElementById("incidentFeed");
  if (!feed) return; // 🛡️ Prevents error if the element isn't on screen

  const random = incidents[Math.floor(Math.random() * incidents.length)];

  feed.innerHTML = `
    <div class="incident-feed-entry">
      <span class="icon">🔔</span>
      <span>${random}</span>
    </div>
  `;
}, 4000);
function downloadChatAsPDF() {
  const chat = document.getElementById("chatBox");
  const opt = {
    margin:       0.5,
    filename:     `NeuroAid_Chat_Report_${new Date().toISOString().slice(0,10)}.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2 },
    jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
  };

  html2pdf().from(chat).set(opt).save();
}
