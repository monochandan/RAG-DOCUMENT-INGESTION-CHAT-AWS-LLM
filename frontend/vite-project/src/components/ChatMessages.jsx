import ChatMessage from "./ChatMessage";
import "./ChatMessages.css";
// import { useRef } from "react";
function ChatMessages({messages}){
    // console.log(props)
    // console.log(message);
    // console.log(sender);
    // console.log(id);
    // const message = props.message;
    // const sender = props.sender;
    // const {message, sender} = props;

    // const result = value1 && value2;

    // if(sender === "robot"){
    //     return (
    //         <div>
    //             <img src="\src\assets\robot.png" width="50"/>
    //             {message}
    //         </div>
    //     );
    // }

    //Another way to render the chat messages --------------------------------------------------
    // const chatMessages = [{
    //     message: "Hello Chatbot", 
    //     sender: "user", 
    //     id:"id1"
    //     },{
    //     message: "Hello! How can I help you?", 
    //     sender: "robot",
    //     id:"id2"
    //     },{
    //     message: "can you get me todays date?", 
    //     sender: "user",
    //     id:"id3"
    //     },{
    //     message: "Today is November 28.", 
    //     sender: "robot",
    //     id:"id4"
    //     }];
  // const chatMessagesRef = useRef(null);


  // useEffect(() => {
  //   console.log(chatMessagesRef.current)
  //   const containerElem = chatMessagesRef.current;

  //   if (containerElem) {
  //     // Scroll to the bottom of the container
  //     containerElem.scrollTop = containerElem.scrollHeight;
  //   }
  // }, [messages]);
  const chatMessageComponents = messages.map((chatMessage) =>{
    return(
      <div>
        
        {/* {chatMessage.sender === "robot" &&  <img src="\src\assets\robot.png" width="50"/>}
        {chatMessage.message}
        {chatMessage.sender === "user" && <img src="\src\assets\user.png" width="50"/>} */}
        <ChatMessage 
          message={chatMessage.message}
          sender={chatMessage.sender}
          // key={chatMessage.id}
          />
      </div>
    );
  })
  return(
    <div>
        {chatMessageComponents}
    </div>
  );
  

    // return (
    //     <div>
    //         {sender === "robot" &&  <img src="\src\assets\robot.png" width="50"/>}
    //         {message}
    //         {sender === "user" && <img src="\src\assets\user.png" width="50"/>}
    //     </div>
    //     );
}
export default ChatMessages;