import { useState, useEffect, useRef} from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import UploadDocumentComponent from  './components/UploadDocumentComponent.jsx'
import ChatInput from './components/ChatInput.jsx';
import DocumentViewerComponent from './components/DocumentViewerComponent.jsx';
import ChatMessages from './components/ChatMessages.jsx';
import './App.css'
import { Toaster } from 'react-hot-toast';
import axios from "axios";
import toast from 'react-hot-toast';

// import { pdfjs } from 'react-pdf';

// pdfjs.GlobalWorkerOptions.workerSrc = new URL(
//   'pdfjs-dist/build/pdf.worker.min.mjs',
//   import.meta.url,
// ).toString();



function App() {

  // state to hold the selected document key and pass (selectedDoc) to DocumentViewerComponent.
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [filesList, setFilesList] = useState([]);

  // this is because totrack the newly uploaded files without refreshing the page
  // so that it doesn't erase the previous chat messages. Dont break the flow of messages.
  const prevFilesRef = useRef([]);
  // const [doc, setDoc] = useState([{
  //   name: "doc_1.pdf",
  //   id: "id1"
  // },{
  //   name: "doc_2.pdf",
  //   id: "id2"
  // },{
  //   name: "doc_3.pdf",
  //   id: "id3"
  // }]);
  
  // function documentUploder(){
  //   let val = "doc_1.pdf";

  //   // generate a unique key
  //   const id = crypto.randomUUID();

  //   // store the value
  //   localStorage.setItem(id, val);

  //   // get updated keys
  //   const keys = Object.keys(localStorage);

  //   // log the latest stored value
  //   console.log("Stored:", localStorage.getItem(id));

  //   // log number of stored items
  //   console.log("Total items:", keys.length);
  // }

  // 1. save the data
  // 2. generate the html

  const [message, setMessage] = useState([{
      // message: "Hello Upload documents to chat with me?", 
      // sender: "robot",
      // id: "id1"
    }/*,{
      message: "Hello! How can I help you?", 
      sender: "robot",
      id: "id2"
    },{
      message: "can you get me todays date?", 
      sender: "user",
      id: "id3"
    },{
      message: "Today is November 28.", 
      sender: "robot",
      id: "id4"
    }*/]);

    // get all files from the s3 buckets
   const getFilesList = () => {
        axios.get('http://localhost:8000/getallfiles')
        .then((response) => {
            setFilesList(response.data.Contents);
            // console.log(response);
            console.log(response.data.Contents);
        })
        .catch((error) => {
            console.log(error);
        });
    };

    useEffect(() => {
      toast.success("Fetching Documents from AWS S3...");
      getFilesList();
    }, []);

    useEffect(() => {
      if(!filesList)
        toast.error("The S3 Bucket is empty!");
                
            // else
            //     toast.success("S3 bucket has file!")
        }, [filesList]);
    
    // useEffect(() => {
    //   toast.success("Fetching Documents from AWS S3...");
    //   //console.log("fileLists: ", filesList)
    //   getFilesList();
    //         //console.log(filesList);
    //   }, []);
    

    useEffect(() => {
      // This ensures your code won’t crash if filesList is null or undefined.
      // checks if filesList is defined or exists
      if (!filesList) return;
      // getting the previous files to check if there is any new file uploaded
      const prevFileList = prevFilesRef.current;
      const prevFilesKeys = prevFileList.map(file => file.Key);
      const currentFilesKeys = filesList.map(file => file.Key);

      const NO_DOC_MESSAGES = [
      "Hi! I don’t see any documents yet. Upload one and we can start chatting.",
      "Looks like there are no documents here. Add a file and I’ll help you explore it.",
      "Hello! Upload a document and I’ll answer questions based on it.",
      "I’m ready when you are, Please upload a document to begin."
      ];

      const DOC_PRESENT_MESSAGES = [
      (docs) => `Hi! I can see these documents:\n${docs}\nAsk me anything about them.`,
      (docs) => `Your documents are ready:\n${docs}\nWhat would you like to know?`,
      (docs) => `I’ve loaded the following files:\n${docs}\nLet’s chat!`,
      (docs) => `Great! I found these documents:\n${docs}\nFeel free to ask questions.`
      ];

      const NEW_DOC_MESSAGES = [
      (docs) => `I noticed you uploaded ${docs}. We can talk about this too.`,
      (docs) => `New document detected: ${docs}. I’m ready when you are.`,
      (docs) => `Nice! ${docs} has been added. Ask me anything about it.`,
      (docs) => `I see a new file: ${docs}. Let’s include it in our discussion.`
      ];

      const DOC_DELETED_MESSAGES = [
      (docs) => `${docs} was removed. I’ll ignore it from now on.`,
      (docs) => `The document ${docs} is no longer available.`,
      (docs) => `${docs} has been deleted. Let me know if you upload another.`,
      (docs) => `I can no longer access ${docs}.`
      ];

      // to pick th erandom text from the above arrays
      const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

      // detect newly uploaded file
      // filter the current file keys, such that keys are not included in previous file keys.
      const newFiles = currentFilesKeys.filter(
        key => !prevFilesKeys.includes(key)
      );

      setMessage(prevMessages => {
        // if there exist any initial message, skip adding another one
        const hasInitMessage = prevMessages.some(message => message.id === "init");

        if (!hasInitMessage) {
          if (filesList.length === 0) {
            return [{
              message: pickRandom(NO_DOC_MESSAGES),//"Hi! No documents uploaded yet. It's better to upload some documents to chat with me. Thanks!",
              sender: "robot",
              id: "init"
          }];
          }
          // const filenames = filesList.map(f => f.Key).join(", ");
          return [{
            message:pickRandom(DOC_PRESENT_MESSAGES)(currentFilesKeys.join(", ")),//`Hello! I can see these documents:\n${currentFilesKeys.join(", ")}\n. You can ask questions about this documents.`,
            sender: "robot",
            id: "init"
          }];
        }
        // if there are new files uploaded
        if (newFiles.length > 0) {
          return [
          ...prevMessages,
          {
            message:pickRandom(NEW_DOC_MESSAGES)(currentFilesKeys.join(", ")),//`Hello! I have noticed that you have uploaded:\n${currentFilesKeys.join(", ")}\n. You can ask questions about this documents.`,
            sender: "robot",
            id: crypto.randomUUID()
          }];
        }
        return prevMessages;
      });

      // update the previous files list after checking
      prevFilesRef.current = filesList;

      // Checks if filesList is an array of length 0 (empty array)
      // if (filesList.length === 0) {
      //   setMessage([{
      //     message: "Hi! No documents uploaded yet. It's better to upload some documents to chat with me. Thanks!",
      //     sender: "robot",
      //     id: "init"
      //   }]);
      // } else {
      //   const filenames = filesList.map(f => f.Key).join(", ");
      //   setMessage([{
      //     message: `Hello! I can see these documents:\n${filenames}\n. You can ask questions about this documents.`,
      //     sender: "robot",
      //     id: "init"
      //   }]);
      // }
    }, [filesList]);

  
  // console.log(typeof chatMessages);
  // directliy putting inside the 'chat-interface-inside-app-container' div 
  /* const chatMessageComponents = chatMessages.map((chatMessage) =>{
    return(
      <ChatMessage
        message = {chatMessage.message}
        sender = {chatMessage.sender}
      />
    );
  })*/

  /*code for automatic scroll in chatMessages component*/
 const chatMessagesRef = useRef(null);
  useEffect(() => {
    // console.log("Updated")
    const containerElem = chatMessagesRef.current;

    // console.log(containerElem);
    // scroll to the bottom whenever message state changes
    if(containerElem){
      containerElem.scrollTop = containerElem.scrollHeight;
    }
  }, [message]);
  /*---------------------------------------------------------------------------------*/

  /* getting the mssg prop from chatInput component afetr user typed it*/
  const saveNewMessage = (mssg) => {
    //console.log("Message from ChatInput component:", mssg);
    // chatMessages.push({
    //   message: mssg,
    //   sender: "user",
    //   id: crypto.randomUUID()
    // });

    // save in a new veriable
    // update setMessage with the veraible for only one stae update but not yet saved.
    // than setMessage again with the veriable and new response for final save.
    const newChatMessages = [
      ...message,
      {
        message: mssg,
        sender: "user",
        id: crypto.randomUUID()
      }
    ];
    setMessage(newChatMessages);
    const response =  window.Chatbot.getResponse(mssg);


   setMessage([
      ...newChatMessages,
      {
        message: response,
        sender: "robot",
        id: crypto.randomUUID()
      }
   ]);
  //  console.log("Chatbot response:", response);
    // console.log(message);
    // return response;
  };

  // console.log(message);




  return(
    <div className="app-container">
      {/* <UploadDocumentComponent/>
      <DocumentViewerComponent/>
      <ChatComponent/> */}
      <div className='document-uploder-inside-app-container'>
        <UploadDocumentComponent
          filesList={filesList}
          refreshFilesList={getFilesList}
          onSelectedDoc={setSelectedDoc} // get permission to set the selected document (onSelectedDoc - property from UploadDocumentComponent)
        />
        <Toaster 
          position="top-center"
          toasterOptions={{
            success: {
              duration: 3000,
              iconTheme: {
                primary: 'green',
                secondary: 'black',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: 'red',
                secondary: 'black',
              },
            },
          }} 
        />
      </div>

      <div className='pdf-viewer-inside-app-container'> 
        <DocumentViewerComponent
          fileKey={selectedDoc}
        />
        <Toaster 
          position="top-center"
          toasterOptions={{
            success: {
              duration: 3000,
              iconTheme: {
                primary: 'green',
                secondary: 'black',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: 'red',
                secondary: 'black',
              },
            },
          }} 
        />
      </div>

      <div className='chat-interface-inside-app-container'>
        {/* // eslint-disable-next-line react-hooks/immutability */}
        {/* {added the div to take all the remaining vertical space using flex 
        by chatmessage component and place the
        input box at the end of the page always, event there is no message} */}
        <div className='chat-message-container' ref={chatMessagesRef}>
          <ChatMessages messages={message}/>
        </div>
        <div className="chat-input-container">
          <ChatInput onClickBtn={saveNewMessage}/>
        </div>
        
        {/* {chatMessageComponents} */}
        {/* {chatMessages.map((chatMessage) =>{
          return(
            <ChatMessage
              message = {chatMessage.message}
              sender = {chatMessage.sender}
              key = {chatMessage.id}
            />
          );
        })} */}
        {/* <ChatMessage message="Hello Chatbot" sender="user"/>
        <ChatMessage message="Hello! How can I help you?" sender="robot"/>
        <ChatMessage message="can you get me todays date?" sender="user"/>
        <ChatMessage message="Today is November 28." sender="robot"/> */}
      </div>

        {/* <div className='chat-interface-inside-app-container'>
        <ChatComponent/>
      </div> */}
    </div>
    
  );
}

export default App
