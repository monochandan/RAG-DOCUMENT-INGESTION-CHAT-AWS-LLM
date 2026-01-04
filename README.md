# Document Ingestion & Chatbot System (RAG)

## Overview
This project is a **document ingestion and retrieval system** using AWS services. Users can upload PDF documents, view them in a web interface, and interact with a **chatbot** to ask questions about the uploaded documents. The system leverages **Retrieval-Augmented Generation (RAG)** for intelligent responses.

<img width="947" height="462" alt="Image" src="https://github.com/user-attachments/assets/4906a386-9b73-46b0-be6e-21530a47de07" />

## Features
- Upload PDF documents via web interface
- Preview uploaded documents in a PDF viewer
- Automatic text extraction and chunking of documents
- Embedding generation using **AWS Bedrock**
- Store embeddings in **OpenSearch** for vector search
- Store document metadata in **DynamoDB**
- Interactive chatbot powered by RAG:
  - Detects uploaded documents
  - Responds to user queries based on document content
  - Notifies when new documents are uploaded during chat
- Real-time updates in chat without losing previous messages

## Architecture
- **Frontend:** React
  - Document uploader
  - PDF viewer
  - Chat interface
- **Backend:** FastAPI + Lambda
  - API endpoints for document upload and retrieval
  - Handles text extraction, chunking, embedding, and OpenSearch indexing
- **AWS Services:**
  - **S3:** Store raw documents
  - **Lambda:** Process documents, generate embeddings
  - **Bedrock:** Create embeddings for document chunks
  - **OpenSearch:** Store embeddings for vector search
  - **DynamoDB:** Store metadata for uploaded documents
  - **API Gateway:** Expose FastAPI endpoints
- **RAG Pipeline:**  
  1. Upload document to S3 → triggers Lambda  
  2. Lambda extracts text, splits into chunks, generates embeddings  
  3. Embeddings stored in OpenSearch; metadata stored in DynamoDB  
  4. Chatbot queries OpenSearch to answer user questions

<!--## Getting Started
1. Clone the repo
2. Set up AWS services: S3, OpenSearch, Lambda, DynamoDB, Bedrock
3. Configure IAM roles and policies for Lambda and OpenSearch
4. Install Python dependencies for Lambda (PyMuPDF, LangChain, boto3, etc.)
5. Run frontend React app: `npm install && npm start`
6. Run backend FastAPI server: `uvicorn main:app --reload`
7. Open the web app and start uploading documents-->

## Usage
- Upload documents via **DocumentUploader**
- Preview documents in **DocumentViewer**
- Ask questions in the chat interface about uploaded documents
- Chatbot will automatically detect new uploads and respond

<!--## License
MIT License-->
