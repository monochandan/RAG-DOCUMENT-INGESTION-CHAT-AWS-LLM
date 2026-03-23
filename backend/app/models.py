# '''
# validate the request body using pydentic Base Modle : https://docs.pydantic.dev/latest/concepts/models/
# '''

from pydantic import BaseModel;
from datetime import datetime

class Status(BaseModel):
    stored_in_s3:bool
    vectorization: str
    deleted_from_s3:bool
    

class upload_doc(BaseModel):
    # id:int
    created_at:datetime
    # user_id:int | None
    document_name:str
    storage_path:str
    file_type:str 
    file_size:int
    upload_date:datetime 
    status:Status # dict[str, str | bool]
