const socket = new WebSocket("ws://localhost:5000"); // Backend WebSocket server URL

socket.onopen = () => {
    console.log("Connected to WebSocket server!");
};

socket.onmessage = (event) => {
    console.log("Message from server:", event.data);
    // Handle incoming message
};

socket.onclose = () => {
    console.log("Disconnected from WebSocket server.");
};

// Function to send a message
export const sendMessage = (recipientId, content) => {
    if (socket.readyState === WebSocket.OPEN) {
        const message = JSON.stringify({ recipientId, content });
        socket.send(message);
        console.log("Sent:", message);
    } else {
        console.error("WebSocket is not open!");
    }
};

export default socket;
