import './UploadDocumentComponent.css';
import { useState, useRef } from 'react';
import axios from "axios";
import toast from 'react-hot-toast';
function UploadDocumentComponent({filesList, refreshFilesList, onSelectedDoc}) {
    // const docRef = useRef(null);

    // useEffect(() =>{
    //     const containerElem = docRef.current;
    //     if(containerElem){
    //         containerElem.scrollTop = containerElem.scrollHeoight;
    //     }
    // }, [doc])
    // const [title, setTitle] = useState("");

    // get the file from the selected input
    const [file, setFile] = useState("");
    const fileInputRef = useRef(null)
    // get the file list from s3 bucket
    // const [filesList, setFilesList] = useState([]);

    // const [selectedDoc, setSelectedDoc] = useState(null);

    // get the file list from s3 bucket
    // The 'showFilesList' function makes the dependencies of useEffect Hook (at line 43) 
    // change on every render. To fix this, wrap the definition of 'showFilesList' in its own useCallback() Hook.
    // Wrap the showFilesList definition in useCallback and import useCallback from React so the 
    // function identity stays stable across renders.
    // const showFilesList = () => {
    //     axios.get('http://localhost:8000/getallfiles')
    //     .then((response) => {
    //         setFilesList(response.data.Contents);
    //         // console.log(response);
    //         console.log(response.data.Contents);
    //     })
    //     .catch((error) => {
    //         console.log(error);
    //     });
    // };

// //    useEffect(() => {
// //     showFilesList();
// //     }, []);

//     useEffect(() => {
//         if(!filesList)
//             toast.error("The S3 Bucket is empty!");
            
//         // else
//         //     toast.success("S3 bucket has file!")
//     }, [filesList]);

//     useEffect(() => {
//         toast.success("Fetching Documents from AWS S3...");
//         //console.log("fileLists: ", filesList)
//         refreshFilesList();
//         //console.log(filesList);
//         }, []);

    // file input change handler
    const handleFileChange=(event) =>{
        // console.log(event);
        const selectedFile = event.target.files[0];
        if(selectedFile){
            // if we want to check the file size we can check here.....selectedFile has size property.
            console.log("selected files:", selectedFile)
            setFile(selectedFile);
            // console.log(title);
        }
    }
    // button click handler
    const handleUpload = () => {
        // if(!file && !title)
        if(!file){
            toast.error("Please Select any file.");
            return;
        }
        const formData = new FormData();
        // formData.append("title", title);
        formData.append("file", file);
        // console.log("form Data",formData);
        // console.log("uploaded fil name:", file.name)

        axios.post('http://localhost:8000/upload', formData, {
            headers:{
                'Content-Type': 'multipart/form-data',
            }
        }).then((response) => {
            toast.success(file.name + "Uploaded Successfully in AWS S3!");
            console.log("data from response:", response.data);
            // console.log("contents in response.datas:", response.data.Contents);
            // showFilesList();

            // refreshFilesList() is actually getFilesList() from App.jsx, 
            // so that when i upload a document, it automatically adds to the file list 
            // without refreshing the page.
            refreshFilesList();
            // after uploading, clear the file input, for avoiding  conflict.
            setFile(null);
            // make input firld empty after uplolading the file.
            fileInputRef.current.value = "";

        }).catch((error) => {
            toast.error("Document faield to upload, please check the console!");
            console.log(error);
        });

        

    }

    
    return(
        <div className="doc-component-container">
            <div className="title">
                <h3 className='page-title'>RAG-AWS Project</h3>
            </div>
            {/* <div className='uploaded-doc-list'> */}

            {/* </div> */}
            <div className='doc-upload-div'>
                {/* <input className="choosen-file-name" placeholder='Choose appropriate title' type='text' required onChange={(event) => setTitle(event.target.value)}/> */}
                <input className="file-chose-from-divice" ref={fileInputRef} type='file' accept='application/pdf' onChange={handleFileChange}/>   
                <button className='upload-button' onClick={handleUpload}>Upload Doc</button>   
            </div>

            <div className='uploaded-doc-list'>
                {filesList && filesList.map((file, index) => (
                    <div key={index} className='uploaded-file-item'>
                        {file.Key} 
                        <button className='vew-doc-button'
                        onClick={() => 
                            onSelectedDoc(file.Key)
                            }
                        >Vew DOC</button> 
                    </div>
                    
                ))}
            </div>
                
                
        </div>
    );
}
export default UploadDocumentComponent;