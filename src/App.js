import React, { useState, useEffect } from "react";
import './App.css'

const App = () => {
    const [id, setUserId] = useState("");
    const [pass, setpass] = useState("");
    const [recipientId, setRecipientId] = useState("");
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");

    const senderStyle = {
        border: "solid blue 1px",
        width: "80vw",
        color: "yellow",
        paddingInline: "3vw",
        textAlign: "right",
        margin: "2%"
    };
    const receiverStyle = {
        border: "solid green 2px",
        width: "80vw",
        color: "green",
        paddingInline: "3vw",
        margin: "2%"
    };

    // Handle user login
    const handleLogin = async () => {
        try {
            const response = await fetch("http://172.27.1.43:5000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, pass }),
            });

            const data = await response.json();
            if (data.success) {
                setIsAuthenticated(true);
                console.log("trying to connect...")
                const newSocket = new WebSocket(`ws://172.27.1.43:5000?token=${data.token}`);
                newSocket.onopen = () => console.log("Socked connected for ",id)
                setSocket(newSocket);
            } else {
                alert("Authentication failed!");
            }
        } catch (error) {
            console.error("Login error:", error);
        }
    };

    // Handle pairing
    const handlePair = () => {
        if (socket) {
            socket.send(JSON.stringify({ type: "pair", recipientId }));
        }
    };

    // Handle sending messages
    const sendMessage = () => {
        if (socket && recipientId) {
            socket.send(JSON.stringify({ action: "text", u2id: recipientId, body: message }));
            setMessages([...messages, { from: id, content: message }]);
            setMessage(""); // Clear input after sending
        }
    };

    // Listen for messages from the WebSocket server
    useEffect(() => {
        if (socket) {
            socket.onmessage = (event) => {
                const receivedMessage = JSON.parse(event.data);
                console.log("got some message: ", receivedMessage)
                setMessages((prevMessages) => [...prevMessages, receivedMessage]);
            };
        }
    }, [socket]);

    return (
        <div>
            {!isAuthenticated ? (
                <div>
                    <h2>Logins</h2>
                    <input type="text"  className = "fields a"  placeholder="User ID" value={id} onChange={(e) => setUserId(e.target.value)} />
                    <input type="pass"  className = "fields b"  placeholder="pass" value={pass} onChange={(e) => setpass(e.target.value)} />
                    <button onClick={handleLogin}>Login</button>
                </div>
            ) : (
                <div>
                    <h2>Welcome, {id}</h2>
                    {/* <button onClick={handlePair}>Pair with User</button> */}

                    <div>
                        <h3>Chat</h3>
                        <div>
                            {messages.map((msg, index) => (
                                <div style={msg.from == id ? senderStyle : receiverStyle} ><p key={index}><b>{msg.from}:</b> {msg.content}</p></div>
                            ))}
                        </div>
                        <input type="text" className = "fields a" placeholder="Enter recipient ID" value={recipientId} onChange={(e) => setRecipientId(e.target.value)} />
                        <input type="text" className = "fields b" placeholder="Type a message" value={message} onChange={(e) => { setMessage(e.target.value) }} />
                        <button onClick={sendMessage}>Send</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;
