from typing import Union, List
from db.helper_functions import insert_doc_metadata, get_all_tables, insert_new_row, update_new_row, delete_row, fetch_row
from db.helper_functions import fetch_images_url, extract_text, chunk_text, insert_title, create_embeddings_and_store
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from datetime import datetime

from app.models import upload_doc, Status #, Status
# from db.supabase_client import create_supabase_client


app = FastAPI()

import boto3
import key_config as keys

s3 = boto3.client('s3',
                  aws_access_key_id=keys.AWS_ACCESS_KEY_ID,
                  aws_secret_access_key=keys.AWS_SECRET_ACCESS_KEY
                  )

BUCKET_NAME = 'new-mono-s3-31-nov'

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

# because this CORS (line: 36) is only for your FastAPI server, not for S3.
# ✔ Works for:

# http://localhost:8000/upload

# http://localhost:8000/view/...

# ❌ Does NOT work for:

# https://your-bucket.s3.amazonaws.com/...

# EACH SERVER NEED ITS OWN CORS CONFIGURATION!
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



@app.get("/")
def read_root():
    # check if the server is runnig  or not
    # s3 = boto3.resource('s3')
    # for bucket in s3.buckets.all():
    #     print(bucket.name)
    return {"Hello": "World"}

@app.get("/getallfiles")
async def get_all_files():
    response = s3.list_objects_v2(Bucket=BUCKET_NAME)
    
    print("from getallfiles:", response)

    return response

@app.post("/upload")
async def upload(file: UploadFile = File(...)):

    # print(fetch_images_url())
    try:

        if file:
            # response = insert_doc_metadata(file, BUCKET_NAME)
            # print(response)
        # print(fetch_images())
        

            response = insert_doc_metadata(file)
            print("response:", response)
            # print("newly inserted row:", response.data[-1]['id'])
            uploaded_doc_id = response.data[-1]['doc_id']
            if response:
                # extract text
                extracted_text = await extract_text(file)
                # print(extracted_text)

                if extracted_text:
                    # chunk the text
                    chunked_text = chunk_text(extracted_text)
                    print(chunked_text[0])
                    print(type(chunked_text))
                    if chunked_text:
                        # add the title of the paper in the existing row (to reduce the same paper uploading)
                        title_added = insert_title(uploaded_doc_id, chunked_text[0])
                        print(title_added)
                        # embedding creation
                        response = create_embeddings_and_store(uploaded_doc_id, chunked_text)
                        #print(vectores)
                        if response:
                            # store in s3
                          s3.upload_fileobj(file.file, BUCKET_NAME, file.filename)
                
            

           
           
        return "file uploaded successfully"
   
    except Exception as e:
        return e

        

# get the file key from the jsx and then generate presigned url to view the file.   
@app.get("/view/{file_key}")
def view_file(file_key: str):
    print("file key: ", file_key)
    url = s3.generate_presigned_url(
        "get_object",
        Params={"Bucket": BUCKET_NAME,
                "Key": file_key,
                },
        ExpiresIn=3600,
    )
    print(url)
    return {"url": url}


@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}

