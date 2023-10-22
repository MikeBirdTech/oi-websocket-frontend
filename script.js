const conversation = document.getElementById("conversation");
const codeBlock = document.getElementById("codeBlock");
const terminalOutput = document.getElementById("terminalOutput");
const userInput = document.getElementById("userInput");
const sendButton = document.getElementById("sendButton");
const chatContainer = document.getElementById("conversation");

// Create WebSocket connection.
const socket = new WebSocket("ws://127.0.0.1:8000/ws");

// Connection opened
socket.addEventListener("open", function (event) {
  console.log("Connected to WebSocket server.");
});

// Listen for messages from WebSocket
socket.addEventListener("message", function (event) {
  const data = JSON.parse(event.data);

  // Check for role "assistant" and update the "conversation"
  if (data.role === "assistant") {
    displayMessage("Assistant", data.text);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }
  // Check for role "code" and update the "codeBlock" textarea
  else if (data.role === "code" || data.role === "executing") {
    codeBlock.value += data.text + "\n";
    codeBlock.scrollTop = codeBlock.scrollHeight;
  }
  // Check for role "output" and update the "terminalOutput" textarea
  else if (data.role === "output") {
    terminalOutput.value += data.text + "\n";
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
  }
});

// Send message to WebSocket server and display it in the "conversation"
sendButton.addEventListener("click", function () {
  const message = userInput.value;
  displayMessage("User", message);
  chatContainer.scrollTop = chatContainer.scrollHeight;

  const formattedMessage = {
    type: "chat",
    content: message,
  };
  socket.send(JSON.stringify(formattedMessage));
  userInput.value = "";
});

function displayMessage(sender, message) {
  let lastMessage = chatContainer.lastChild;

  if (
    sender === "Assistant" &&
    lastMessage &&
    lastMessage.classList.contains("assistant-message")
  ) {
    // Append to existing assistant message
    const newContent = document.createElement("div");
    newContent.innerHTML = message;
    lastMessage.appendChild(newContent);
  } else {
    // Create new message div
    const newMessage = document.createElement("div");
    newMessage.className =
      sender === "User" ? "user-message message" : "assistant-message message";
    if (sender === "Assistant") {
      const assistantLabel = document.createElement("span");
      assistantLabel.innerHTML = "[Assistant]: ";
      newMessage.appendChild(assistantLabel);
    }
    const newContent = document.createElement("div");
    newContent.innerHTML = message;
    newMessage.appendChild(newContent);
    chatContainer.appendChild(newMessage);
  }
  // Clear the input field after sending the message
  if (sender === "User") {
    userInput.value = "";
  }
}
