"""
Query Classification Service
Uses OpenAI to classify user queries into predefined categories.
"""
import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Valid categories for classification
CATEGORIES = ["Support", "HR", "Marketing", "IT", "Finance"]

CLASSIFICATION_PROMPT = """You are a query classifier. Classify the following user query into exactly ONE of these categories:
- Support: Customer service, refunds, returns, order issues, product questions, complaints
- HR: Leave policies, benefits, hiring, employee relations, workplace policies, onboarding
- Marketing: Campaigns, branding, social media, advertising, market research, promotions
- IT: Technical issues, software, hardware, passwords, VPN, system access, troubleshooting
- Finance: Budgets, expenses, invoices, financial reports, accounting, payments

Respond with ONLY the category name (Support, HR, Marketing, IT, or Finance). Nothing else.

User query: {query}

Category:"""


def classify_query(query: str) -> str:
    """
    Classify a user query into one of the predefined categories.
    Returns one of: Support, HR, Marketing, IT, Finance
    """
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "user", "content": CLASSIFICATION_PROMPT.format(query=query)}
            ],
            temperature=0,  # Deterministic output
            max_tokens=10
        )
        
        category = response.choices[0].message.content.strip()
        
        # Validate the category
        if category in CATEGORIES:
            return category
        
        # If invalid, try to match partial
        for valid_cat in CATEGORIES:
            if valid_cat.lower() in category.lower():
                return valid_cat
        
        # Default fallback
        return "Support"
        
    except Exception as e:
        print(f"Classification error: {e}")
        # Default to Support if classification fails
        return "Support"


def classify_query_with_confidence(query: str) -> dict:
    """
    Classify a query and return category with additional metadata.
    """
    category = classify_query(query)
    
    return {
        "category": category,
        "query": query
    }
