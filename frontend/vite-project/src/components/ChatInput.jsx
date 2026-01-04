import ChatMessages from "./ChatMessages";
import {useState} from "react";
import './ChatInput.css';

// crypto.randomUUID()
function ChatInput(props){

  // call back to the App component
  const [input, setInput] = useState("");

  // const message =[{
  //   message: "what is goig on?",
  //   sender: "user",
  //   id: "id6"
  // }]

  const inputChangeHandler = (event) =>{
    // console.log("Input changed:", event.target.value);
    setInput(event.target.value);
  };

  const inputButtonHandler = () => {

    props.onClickBtn(input);
    // console.log("Input button clicked. Message sent:", input);

    // Clear the input field after sending the message
    setInput("");

  };


  // function sendMessage(){
  //     const message =[{
  //       message: "what is goig on?",
  //       sender: "user",
  //       id: "id6"
  //     }]
  //     console.log(message);
  //     return message;
  // }
  // const msg = sendMessage();
    return (
        <div className='button-input-container'>
          <input value={input} onChange = {inputChangeHandler} className='message-input' placeholder="Send a message" size= "30"/>
          <button className='message-send-button' onClick={inputButtonHandler} disabled={!input}>Send</button>
          {/* <button className='message-mic-button' >Send Message</button> */}
          {/* <ChatMessages
            message = {sendMessage.message}
            sender = {sendMessage.sender}
            id = {sendMessage.id}
          /> */}
        </div>
    );
}

export default ChatInput;