import "./ChatMessage.css";
function ChatMessage({message, sender}){
    // console.log(key);
    return(
        <div className={sender === "robot" ? "chat-message-robot" : "chat-message-user"}>
        {/* {chatMessage.sender === "robot" &&  <img src="\src\assets\robot.png" width="50"/>}
        {chatMessage.message}
        {chatMessage.sender === "user" && <img src="\src\assets\user.png" width="50"/>} */}
        {sender === "robot" &&  <img src="\src\assets\robot.png" className="chat-message-profile"/>}

            <div className="chat-message-text">{message}</div>
        
        {sender === "user" && <img src="\src\assets\user.png" className="chat-message-profile"/>}
      </div>
    );
}
export default ChatMessage;