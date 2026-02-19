import React, { useEffect, useRef, useState } from 'react';
import { fileUploadUrl, GetWithToken, PostWithToken } from '../pages/api/crud';
import moment from 'moment';


const ChatWindow = ({ reciever, setMessageUser, messageUser, count, hubConnection }) => {
  const [isOpen, setIsOpen] = useState(reciever);
  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState("");
  const [messageOk, setMessageOk] = useState(false);


  const toggleChat = () => {
    var recId = messageUser.filter(x => { return x != reciever })
    setMessageUser(recId)
  };

  useEffect(() => {
    setTimeout(() => {
      const messagesContainer = document.getElementById('messages-container');
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    
      setMessageOk(true)
    }, 200);

  }, [message, reciever]); // messages değiştiğinde çalışacak


  const start = async () => { 
    
    var data = await GetWithToken("message/GetMessageByReciever/" + reciever.Id)
    setChat(data.data.data)

      var data = await GetWithToken("message/readUSerMessageByReciever/" + reciever.Id)
      
    setTimeout(() => {
      const messagesContainer = document.getElementById('messages-container');
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      
      }
      setMessageOk(true)
    }, 200);

    hubConnection.on('OnlineMessage', (message) => {
    // console.log(JSON.parse(message))
     start()
     
  });

  };

  const sendMessage = async () => {

    if (hubConnection && message) {
      // Mesaj gönderme
      await hubConnection.invoke('SendMessage', message, reciever.Id);
      setMessage("");
      setChat([...chat, {
        isMine: true,
        tarih: "şimdi",
        messageText: message,
        id: moment(new Date()).format("dmmyyyhhmmss")
      }])
    }

  };



  useEffect(() => {

    start()
  }, [isOpen])

  return (
    <div className="chat-container" style={{ right: 310 * (count) }}>
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="chat-user-info">
              <img
                src={fileUploadUrl + reciever.Resim}
                alt="Profile"
                className="chat-user-img"
              />
              <div className="chat-user-name">
                <strong>{reciever.AdSoyad}</strong>
              </div>
            </div>
            <button className="close-btn" onClick={toggleChat}>
              X
            </button>
          </div>
          <div className="chat-body " id={"messages-container"}>
            {chat.map((chat) => (
              <>
                <div
                  style={messageOk && { opacity: 1 } || { opacity: 0 }}
                  key={chat.id}
                  className={`chat-bubble ${chat.isMine ? 'sender' : 'receiver'}`}
                >
                  {/* <strong>{chat.user}:</strong> */}
                  {chat.messageText}
                  <br></br>
                  <div className='chat-date'>
                    <i>{chat.tarih}</i>
                  </div>

                </div>
                <div style={{ clear: "both" }}></div>
              </>

            ))}

          </div>
          <div className="chat-footer">
            <input type="text" value={message} onChange={(x) => { setMessage(x.target.value); }}
              onKeyUp={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault(); // Varsayılan davranışı engelle (form gönderimini)
                  sendMessage(); // Mesaj gönder
                }
              }}
              placeholder="Mesajınızı yazın..." />
            <button onClick={() => { sendMessage() }} className="send-btn">Gönder</button>
          </div>
        </div>
      )}

    </div>
  );
};

export default ChatWindow;