from db.supabase_client import create_supabase_client
# import supabase
import uuid
from datetime import datetime
from PyPDF2 import PdfReader
from io import BytesIO
supabase = create_supabase_client()
import os
from dotenv import load_dotenv
load_dotenv()
# for chunking the text data
from langchain_text_splitters import RecursiveCharacterTextSplitter
# convert to the text document
# from PyPDF2 import PdfReader
# from io import BytesIO

# vectore store
# from langchain_chroma import Chroma

# using gemini to convert the text into embedding convertable text
from google import genai
from google.genai import types
# google_api_key = os.getenv("GOOGLE_GEMINI_API_KEY")
client = genai.Client( api_key=os.getenv("GOOGLE_GEMINI_API_KEY"),)
# text cleaning
import nltk, re, string
from nltk.corpus import stopwords
from nltk.stem.porter import PorterStemmer
stop_words = stopwords.words('english')
ps = PorterStemmer()
# embeddings
from langchain_huggingface import HuggingFaceEndpointEmbeddings

# embedding model
embedding = HuggingFaceEndpointEmbeddings(
    model="sentence-transformers/all-MiniLM-L6-v2",
    task="feature-extraction",
    huggingfacehub_api_token=os.environ.get("HUGGINGFACE_READ_ONLY_KEY")
    )

# # initialize supabase client
# supabase = create_supabase_client()

# def user_exists(key: str = "email", value: str = None):
#     user = supabase.from_("users").select("*").eq(key, value).execute()
#     return len(user.data) > 0

def fetch_images_url():
    results = supabase.storage.from_('demo-bucket').get_public_url('mine.png')
    return results

# fetch the specific rrow based on info, to check if teh data is already exist or not
def fetch_row(title: str):
    results = supabase.table('demo-table').select('*').eq('title', 'Attention all you needs').execute()
    return results

def delete_row():
    supabase.table('demo-table').delete().eq('id', 2).execute()
    results = supabase.table('demo-table').select('*').execute()
    return results

def update_new_row():
    new_row = {'first_name':'kumar das'}
    supabase.table('demo-table').update(new_row).eq('id', 2).execute()
    results = supabase.table('demo-table').select('*').execute()
    return results

def insert_new_row():
    new_row = {'first_name':'kd'}
    supabase.table('demo-table').insert(new_row).execute()
    results = supabase.table('demo-table').select('*').execute()
    return results

def get_all_tables():
    results = supabase.table('demo-table').select('*').execute()
    return results

def insert_doc_metadata(file):
    
     # .insert(data.model_dump())
    try:
        new_row = {'doc_name':str(file.filename),
                'file_size':int(file.size),
                'doc_id':str(uuid.uuid4())}
        supabase.table('doc-metadata').insert(new_row).execute()
        response = supabase.table('doc-metadata').select('*').execute()
        if response:
           return response
    except Exception as e:
        print(e)
        return "error insert initial data"
    
    # return response

async def extract_text(file):
    try:
        content = await file.read()
        pdf_reader = PdfReader(BytesIO(content))
        text = ""
        for page in pdf_reader.pages:
          text += page.extract_text()
       # # print("Text: ", text)
        if text:
          return text
    except Exception as e:
        print(e)
        return "error extract text"

def chunk_text(text):
    try:
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=400, chunk_overlap=400*0.2)
        texts = text_splitter.split_text(text)
        if texts:
           return texts
    except Exception as e:
        print(e)
        return "error to split the text"
    

def insert_title(id, text):

    try:
        new_row = {'title':str(text)}
        supabase.table('doc-metadata').update(new_row).eq('doc_id', id).execute()
        response = supabase.table('doc-metadata').select('*').execute()
        if response:
          return response
    except Exception as e:
        print(e)
        return "error in inserting title"
    
def genai_text_conversion(text):
     # Remove null characters
    text = text.replace('', '')
    text = text.replace('\u0000', '')
    text = re.sub(r'[x00-x1fx7f-x9f]', '', text)
    text = re.sub(r'[\x00-\x1f\x7f-\x9f]', '', text)

    prompt = f"""
    Clean the following text for embedding in pgvector. Remove punctuation, HTML, and control characters.
    Convert to lowercase, remove stop words, and stem words. Return only the cleaned, space-separated text.

    Text: "{text}"
    Cleaned text:
    """

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash-lite",
            contents=types.Content(
                role="user",
                parts=[types.Part(text=prompt)]
            )
        )
        return response.candidates[0].content.parts[0].text.strip()
    except Exception as e:
        print("Error in Gemini:", e)
        return text  # Fallback to original text

def create_embeddings_and_store(uploaded_doc_id, chunked_text):
    print("inside embedding creation function")
    try:
        for text in chunked_text:
         
         # pre embedding text cleaning:
         print("text:", text)
         # convert text , suitable for vectorization
         #c_text = genai_text_conversion(text)
        #  print("cleaned text:", c_text)
         cleaned_text = clean_text(text)
         print("cleaned text:", cleaned_text)
         # create embeddin
         query_result = embedding.embed_query(cleaned_text)
         # insert into supabase
         chunk_id = str(uuid.uuid4())
         document = str(cleaned_text)
         doc_id = str(uploaded_doc_id)
         new_row = {'cleaned_text':cleaned_text,
                'chunk_id':chunk_id,
                'embeddings':query_result,
                'doc_id':doc_id}
         supabase.table('document_vector').insert(new_row).execute()

        response = supabase.table('doc-metadata').select('*').execute()
        if response:
            return response
    except Exception as e:
        print(e)
        return "error in storing embedding"   


def clean_text(text):
   
    # text = text.replace('', '')
    text = text.replace('\u0000', '')
    # Or remove all control characters (including nulls)
    text = re.sub(r'[\x00-\x1f\x7f-\x9f]', '', text)
    text = re.sub(r'[^\w\s.,;:!?-]', '', text)  # Keep basic punctuation
    text = re.sub(r'\s+', ' ', text)  # Normalize spaces
    # text = re.sub(r'[\x00-x1fx7f-x9f]', '', text) 

    # text = text.encode('utf-8', 'ignore').decode('utf-8')
    # text = text.replace('\x00', '')

    # words = text.split()
    # re_punc = re.compile('[%s]' % re.escape(string.punctuation))
    # stripped = [re_punc.sub('', word) for word in words]
# remove the text which are not printable
    # re_print = re.compile('[^%s]' % re.escape(string.printable))
    # result = [re_print.sub('', word) for word in stripped]
    # result = [word.lower() for word in result]
# remove words with one character
    # result = [word for word in result if len(word) > 1]

    # remove stop words
    # result = [word for word in result if word not in set(stop_words)]

    # # stemming
    # result = [ps.stem(word) for word in result]

    # # remove words, which are not made of alphabet alone
    # result = [word for word in result if word.isalpha()]

    # cleaned_text = ' '.join(result)

    
    return text.strip().lower()

