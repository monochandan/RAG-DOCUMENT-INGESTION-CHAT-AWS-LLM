import pymupdf

# doc = pymupdf.open("paper-37.pdf")
doc = pymupdf.open("Document_Ingestion_and_RAG_System_with_AWS_Services/backend/paper-37.pdf")
out = open("output.txt", "wb")
all_text = ""

for page in doc:
    all_text += page.get_text()

print(all_text)