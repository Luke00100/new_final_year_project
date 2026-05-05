"""
Unit Tests for Query Classification Service (classification_service.py)
Uses mocked OpenAI responses to test classification logic without API calls.
"""

import pytest
from unittest.mock import patch, MagicMock

# ── Adjust this import to match your project structure ──
from services.classification_service import (
    classify_query,
    classify_query_with_confidence,
    CATEGORIES,
    CLASSIFICATION_PROMPT,
)


# ============================================================
# HELPER — mock OpenAI response object
# ============================================================

def mock_openai_response(content: str):
    """Create a mock object mimicking the OpenAI chat completion response."""
    mock_choice = MagicMock()
    mock_choice.message.content = content
    mock_response = MagicMock()
    mock_response.choices = [mock_choice]
    return mock_response


# ============================================================
# CATEGORY CONFIGURATION TESTS
# ============================================================

class TestCategoryConfiguration:
    """Tests for the classification category setup."""

    def test_five_categories_defined(self):
        """There should be exactly five categories."""
        assert len(CATEGORIES) == 5

    def test_expected_categories_present(self):
        """All expected category names should be present."""
        expected = {"Support", "HR", "Marketing", "IT", "Finance"}
        assert set(CATEGORIES) == expected

    def test_prompt_contains_all_categories(self):
        """The classification prompt should reference all categories."""
        for category in CATEGORIES:
            assert category in CLASSIFICATION_PROMPT

    def test_prompt_has_query_placeholder(self):
        """The prompt should contain a {query} placeholder."""
        assert "{query}" in CLASSIFICATION_PROMPT


# ============================================================
# CLASSIFY_QUERY TESTS (mocked OpenAI)
# ============================================================

class TestClassifyQuery:
    """Tests for the classify_query function with mocked API calls."""

    @patch("services.classification_service.client")
    def test_returns_support(self, mock_client):
        """Should return 'Support' for a support-related query."""
        mock_client.chat.completions.create.return_value = mock_openai_response("Support")
        result = classify_query("How do I return a product?")
        assert result == "Support"

    @patch("services.classification_service.client")
    def test_returns_hr(self, mock_client):
        """Should return 'HR' for an HR-related query."""
        mock_client.chat.completions.create.return_value = mock_openai_response("HR")
        result = classify_query("What is the annual leave policy?")
        assert result == "HR"

    @patch("services.classification_service.client")
    def test_returns_marketing(self, mock_client):
        """Should return 'Marketing' for a marketing-related query."""
        mock_client.chat.completions.create.return_value = mock_openai_response("Marketing")
        result = classify_query("What campaigns are planned for Q4?")
        assert result == "Marketing"

    @patch("services.classification_service.client")
    def test_returns_it(self, mock_client):
        """Should return 'IT' for an IT-related query."""
        mock_client.chat.completions.create.return_value = mock_openai_response("IT")
        result = classify_query("How do I reset my password?")
        assert result == "IT"

    @patch("services.classification_service.client")
    def test_returns_finance(self, mock_client):
        """Should return 'Finance' for a finance-related query."""
        mock_client.chat.completions.create.return_value = mock_openai_response("Finance")
        result = classify_query("What were last quarter's expenses?")
        assert result == "Finance"

    @patch("services.classification_service.client")
    def test_result_is_valid_category(self, mock_client):
        """Returned category should always be in the CATEGORIES list."""
        mock_client.chat.completions.create.return_value = mock_openai_response("IT")
        result = classify_query("VPN is not working")
        assert result in CATEGORIES

    @patch("services.classification_service.client")
    def test_strips_whitespace_from_response(self, mock_client):
        """Should strip whitespace from the API response."""
        mock_client.chat.completions.create.return_value = mock_openai_response("  Finance  ")
        result = classify_query("Show me the budget report")
        assert result == "Finance"

    @patch("services.classification_service.client")
    def test_partial_match_fallback(self, mock_client):
        """Should match partial responses containing a valid category name."""
        mock_client.chat.completions.create.return_value = mock_openai_response(
            "The category is Marketing."
        )
        result = classify_query("Tell me about our brand strategy")
        assert result == "Marketing"

    @patch("services.classification_service.client")
    def test_invalid_response_defaults_to_support(self, mock_client):
        """Should default to 'Support' if the API returns an invalid category."""
        mock_client.chat.completions.create.return_value = mock_openai_response(
            "Unknown"
        )
        result = classify_query("Something random")
        assert result == "Support"

    @patch("services.classification_service.client")
    def test_api_error_defaults_to_support(self, mock_client):
        """Should default to 'Support' if the API call raises an exception."""
        mock_client.chat.completions.create.side_effect = Exception("API error")
        result = classify_query("This should still return something")
        assert result == "Support"

    @patch("services.classification_service.client")
    def test_empty_query_does_not_crash(self, mock_client):
        """Should handle an empty query string without raising an error."""
        mock_client.chat.completions.create.return_value = mock_openai_response("Support")
        result = classify_query("")
        assert result in CATEGORIES

    @patch("services.classification_service.client")
    def test_uses_gpt4o_mini_model(self, mock_client):
        """Should call the API with the gpt-4o-mini model."""
        mock_client.chat.completions.create.return_value = mock_openai_response("IT")
        classify_query("Reset my password")
        call_kwargs = mock_client.chat.completions.create.call_args
        assert call_kwargs.kwargs["model"] == "gpt-4o-mini"

    @patch("services.classification_service.client")
    def test_uses_zero_temperature(self, mock_client):
        """Should call the API with temperature=0 for deterministic output."""
        mock_client.chat.completions.create.return_value = mock_openai_response("IT")
        classify_query("Reset my password")
        call_kwargs = mock_client.chat.completions.create.call_args
        assert call_kwargs.kwargs["temperature"] == 0


# ============================================================
# CLASSIFY_QUERY_WITH_CONFIDENCE TESTS
# ============================================================

class TestClassifyQueryWithConfidence:
    """Tests for the classify_query_with_confidence wrapper function."""

    @patch("services.classification_service.client")
    def test_returns_dict(self, mock_client):
        """Should return a dictionary."""
        mock_client.chat.completions.create.return_value = mock_openai_response("HR")
        result = classify_query_with_confidence("Leave policy question")
        assert isinstance(result, dict)

    @patch("services.classification_service.client")
    def test_contains_category_key(self, mock_client):
        """Returned dict should contain a 'category' key."""
        mock_client.chat.completions.create.return_value = mock_openai_response("HR")
        result = classify_query_with_confidence("Leave policy question")
        assert "category" in result

    @patch("services.classification_service.client")
    def test_contains_query_key(self, mock_client):
        """Returned dict should contain the original 'query' key."""
        mock_client.chat.completions.create.return_value = mock_openai_response("HR")
        query = "What is the sick leave policy?"
        result = classify_query_with_confidence(query)
        assert result["query"] == query

    @patch("services.classification_service.client")
    def test_category_is_valid(self, mock_client):
        """The category value should be a valid category."""
        mock_client.chat.completions.create.return_value = mock_openai_response("Finance")
        result = classify_query_with_confidence("Show me the budget")
        assert result["category"] in CATEGORIES