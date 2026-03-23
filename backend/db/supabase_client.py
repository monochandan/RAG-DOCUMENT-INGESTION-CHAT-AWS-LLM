from dotenv import load_dotenv
import os
from supabase import Client, create_client 

# connect supabase
load_dotenv()
text = os.environ.get("SUPABASE_URL"),
text_1 = os.environ.get("SUPABASE_PUBLISHABLE_DEFAULT_KEY")

# print(text)
# print(text_1)

# create client
def create_supabase_client():
    supabase: Client = create_client(
        os.environ.get("SUPABASE_URL"),
        os.environ.get("SUPABASE_PUBLISHABLE_DEFAULT_KEY")
    )

    return supabase

