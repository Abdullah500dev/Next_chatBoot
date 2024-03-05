'use client'
import React, { useState } from "react";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import { MainContainer, ChatContainer, Message, MessageList, TypingIndicator, MessageInput } from '@chatscope/chat-ui-kit-react'

const API_KEY = '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';

export default function Home() {
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      message: "Hello, I'm ChatGPT",
      sender: "ChatGpt",
      direction: "incoming"
    }
  ]);

  const handleSend = async (message) => {
    const newMessage = {
      message: message,
      sender: 'user',
      direction: 'outgoing'
    }

    const newMessages = [...messages, newMessage];

    setMessages(newMessages);
    setTyping(true);
    await processMessagesToChatGpt(newMessages);
  }

  async function processMessagesToChatGpt(chatMessages) {
    let apiMessages = chatMessages.map((messageObject) => {
      let role = '';
      if (messageObject.sender === 'ChatGpt') {
        role = "assistant"
      } else {
        role = 'user'
      }
      return { role: role, content: messageObject.message }
    });

    const systemMessage = {
      role: 'system',
      content: "Speak like a pirate"
    }

    const apiRequestBody = {
      'model': 'gpt-3.5-turbo',
      'messages': [
        systemMessage,
        ...apiMessages
      ]
    }

    await fetch('https://api.openai.com/v1/chat/completions', {
      method: "POST",
      headers: {
        "Authorization": 'Bearer ' + API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(apiRequestBody)
    })
    .then((data) => {
      return data.json();
    })
    .then((data) => {
      console.log(data);
      console.log(data.choices[0].message.content);

      setMessages([
        ...chatMessages,
        {
          message: data.choices[0].message.content,
          sender: "ChatGPT",
          direction: "incoming"
        }
      ]);
      setTyping(false);
    })
    .catch((error) => {
      console.error('Error processing messages:', error);
    });
  }

  return (
    <div style={{ position: "relative", height: "100vh" }}>
      <MainContainer>
        <ChatContainer>
          <MessageList
          scrollBehavior="smooth"
            typingIndicator={typing ? <TypingIndicator content="ChatGpt is typing" /> : null}
          >
            {
              messages.map((message, i) => {
                return <Message key={i} model={message} />
              })
            }
          </MessageList>
          <MessageInput placeholder="Type message here" onSend={handleSend} />
        </ChatContainer>
      </MainContainer>
    </div>
  );
}
