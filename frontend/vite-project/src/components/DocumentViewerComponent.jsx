import "./DocumentViewerComponent.css";
import React, {useState, useEffect} from "react";
import { Page, Document} from "react-pdf";
import { pdfjs } from 'react-pdf';
import axios from "axios";
import toast from 'react-hot-toast';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

function DocumentViewerComponent({fileKey}){
    const [numPages, setNumPages] = useState(0);
    const [pageNumber, setPageNumber] = useState(1);

    // url for the pdf file to be viewed
    const [url, setUrl] = useState(null);

    useEffect(() => {
        // if(!fileKey){
        //     toast.error("No Document Selected!");
        //     return;
        // }

        // if(fileKey)
        //     toast.success(`Loaded ${fileKey}....`)
        console.log("file key:", fileKey);
        axios.get(`http://localhost:8000/view/${fileKey}`)
        .then((response) => {
            setUrl(response.data.url);
            if (fileKey)
                toast.success(`Loaded ${fileKey}....`);
        })
    }, [fileKey])

        if (!fileKey) return <div className="init-mssg">Select a document</div>;
        if (!url) return <div className="loading-mssg">Loading document...</div>;

    function onDocumentLoadSuccess({numPages}){
        // console.log(numPages);
        setNumPages(numPages);
        setPageNumber(1);
    }

    // function changePage(offset){
    //     setPageNumber(prevPageNumber => prevPageNumber + offset);
    // }

    // function changePageBack(){
    //     changePage(-1);
    // }

    // function changePageNext(){
    //     changePage(+1);
    // }
    return(
        <div className="document-viewer-container">
            <center>
                <div className="doc-vew">
                    <Document file={url} onLoadSuccess={onDocumentLoadSuccess}>   {/*file="Terms_and_conditions.pdf"*/}
                        {Array.from(new Array(numPages), (element, index) => (
                            <Page 
                                key={`page_${index + 1}`}
                                pageNumber={index + 1}
                                /*onChange={() => setPageNumber(index + 1)}*/>
                            <p font="5px">Page {index + 1} of {numPages}</p>
                            </Page>
                        )
                        )}
                        
                    </Document>
                </div>
            </center>
        </div>
    );
}
export default DocumentViewerComponent;