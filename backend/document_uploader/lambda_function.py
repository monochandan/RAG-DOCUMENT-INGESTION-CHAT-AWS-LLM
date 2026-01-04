import json
import pymupdf
import boto3
import urllib.parse
import key_config as keys
from PyPDF2 import PdfReader
import re
import nltk
from nltk.corpus import stopwords
from nltk.stem import PorterStemmer, WordNetLemmatizer
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_aws import BedrockEmbeddings

print("Loading function")

s3 = boto3.resource(service_name = 's3',
                    region_name = 'eu-central-1',
                    aws_access_key_id = keys.aws_access_key_id,
                    aws_secret_access_key = keys.aws_secret_access_key)

# initialize stemmer and lemmatizer
stemmer = PorterStemmer()
lemmatizer = WordNetLemmatizer()
stopwords = set(stopwords.words('english'))

nltk.download('stopwords')
nltk.download('wordnet')

# Initialize text splitter
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size = 1000,
    chunk_overlap = 200
)

# Createa a Bedrock runtime client in the AWS region where you want to use Bedrock
bedrock_client = boto3.client("bedrock-runtime", region_name = "eu-central-1")

# Set the model ID
model_id = "amazon.titan-embed-text-v2:0"

# Initialize Bedrock embeddings
bedrock_embeddings = BedrockEmbeddings(model_id = model_id, client = bedrock_client)

# create opensearch client here
opensearch_client = boto3.client('opensearch', region_name='eu-central-1')



def lambda_handler(event, context):
   
   # Extract Text from PDF
   text, key = extract_text_from_pdf(event)
   # preprocessing the text
   cleaned_text = clean_text(text)
   # Split into chunks
   process_chunks(cleaned_text, key)
   
   pass ;

def extract_text_from_pdf(event):
   print("Extracting Text from PDF...")
   bucket = event['Records'][0]['s3']['bucket']['name']
   key = urllib.parse.unquote_plus(event['Records'][0]['s3']['object']['key'], encoding='utf-8')

   obj = s3.Bucket(bucket).Object(key)
   reader = PdfReader(obj.get()['Body'].read())
   all_text = ""
   for page in reader.pages:
        all_text += page.extract_text()

   return all_text, key

def clean_text(text):
    print("Cleaning the text...")
    # convert all characters in text to lowercase
    text= text.lower()

    # remove urls
    text = re.sub(r'https?://\S+|www.\.S+', '', text)

    # remove html tags
    text = re.sub(r'<.*?>', '', text)

    # remove mentions
    text = re.sub(r'@\w+', '', text)

    # remove hashtags
    text = re.sub(r'#\w+', '', text)

    # translate emoticons to their equivalent word
    emotions = {':)': 'smile', ':-)': 'smile', ':(': 'sad', ':-(': 'sad', ':D': 'laugh', ':-D': 'laugh'}
    words = text.split()
    words = [emotions.get(word, word) for word in words]
    text = " ".join(words)

    # remove punctuations
    text = re.sub(r'[^\w\s]', '', text)

    # remove standalone single alphabetical characters
    text = re.sub(r'\s+[a-zA-Z]\s+', ' ', text)

    # substitute multiple consecutivespaces with single spaces
    text = re.sub(r'\s+', ' ', text, flags = re.IGNORECASE)

    # remove stopwords
    text = ' '.join(word for word in text.split() if word not in stopwords)

    # stemming
    text = ' '.join(stemmer.stem(word) for word in text.split())

    # lemmatizsation
    text = ' '.join(lemmatizer.lemmatize(word) for word in text.split())

    return text

def create_embeddings(text_chunks):
    # bedrock_client, model_id
    print("Creating Embeddings...")
    native_request = {"inputText": text_chunks}
    request = json.dumps(native_request)
    response = bedrock_client.invoke_model(
        modelId = model_id,
        body = request
    )
    model_response = json.loads(response['body'].read())
    embeddings = model_response["embedding"] # list[flolat]

    return embeddings



def process_chunks(text, key):

    # chunks - list of string
    print("Creating Chunks...")
    chunks = text_splitter.split(text)

    # Creates Embeddings for each text from the list
    for chunk in chunks:
        embedding_vector = create_embeddings(chunk)

    # Stores Vector in OpenSearch / FAISS
    # Store metadata in DynamoDB
