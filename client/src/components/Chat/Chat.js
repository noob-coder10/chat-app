import React, { useState, useEffect } from "react";
import queryString from "query-string";
import io from "socket.io-client";
import { useLocation } from "react-router-dom";
import "./Chat.css";
import InfoBar from "../InfoBar/InfoBar";
import Input from "../Input/Input";
import Messages from "../Messages/Messages";

let socket = null;

const Chat = () => {
  const data = queryString.parse(useLocation().search);
  const [name, setName] = useState(data.name);
  const [room, setRoom] = useState(data.room);
  const [message, setMessage] = useState("");
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const ENDPOINT = "localhost:5000";

  useEffect(() => {
    socket = io(ENDPOINT);

    setName(data.name);
    setRoom(data.room);

    socket.emit("join", { name, room }, (err) => {
      if (err) alert(err);
    });

    const handleBeforeUnload = () => {
      socket.emit("disConnect");

      socket.off();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);

      handleBeforeUnload();
    };
  }, [ENDPOINT, data.name, data.room]);

  useEffect(() => {
    socket.on("message", (message) => {
      setMessages([...messages, message]);
    });

    socket.on("roomData", ({ users }) => {
      setUsers(users);
    });
  }, [messages]);

  const sendMessage = (event) => {
    event.preventDefault();

    if (message) {
      socket.emit("sendMessage", message, () => setMessage(""));
    }
  };

  return (
    <div className="outerContainer">
      <div className="container">
        <InfoBar room={room} />
        <Messages messages={messages} name={name} />
        <Input
          message={message}
          setMessage={setMessage}
          sendMessage={sendMessage}
        />
      </div>
    </div>
  );
};

export default Chat;
