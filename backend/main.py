from typing import Union, List

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

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
    # s3 = boto3.resource('s3')
    # for bucket in s3.buckets.all():
    #     print(bucket.name)
    return {"Hello": "World"}

@app.get("/getallfiles")
async def get_all_files():
    response = s3.list_objects_v2(Bucket=BUCKET_NAME)
    print(response)

    return response

@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    if file:
        print("Uploading file:", file.filename )
        s3.upload_fileobj(file.file, BUCKET_NAME, file.filename)
        return "file uploaded successfully"
    else:
        return "errro in uploading"

# get the file key from the jsx and then generate presigned url to view the file.   
@app.get("/view/{file_key}")
def view_file(file_key: str):
    url = s3.generate_presigned_url(
        "get_object",
        Params={"Bucket": BUCKET_NAME,
                "Key": file_key,
                },
        ExpiresIn=3600,
    )
    return {"url": url}


# @app.get("/items/{item_id}")
# def read_item(item_id: int, q: Union[str, None] = None):
#     return {"item_id": item_id, "q": q}

