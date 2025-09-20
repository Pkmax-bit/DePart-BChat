import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# from routers.quote import router as quote_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# app.include_router(quote_router, prefix='/api/v1')

@app.get("/")
def root():
    return {"message": "Test API"}

@app.get("/api/v1/quote/invoices")
def test_endpoint():
    return {"quotes": []}