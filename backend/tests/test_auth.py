"""
Unit Tests for Authentication Module (auth.py)
Tests password hashing, JWT token creation, and token verification.
"""

import pytest
from datetime import datetime, timedelta
from unittest.mock import patch
from jose import jwt

# ── Adjust this import to match your project structure ──
# e.g. if auth.py is in a folder called 'app', use: from app.auth import ...
from auth import (
    hash_password,
    verify_password,
    create_access_token,
    verify_token,
    SECRET_KEY,
    ALGORITHM,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)


# ============================================================
# PASSWORD HASHING TESTS
# ============================================================

class TestPasswordHashing:
    """Tests for bcrypt password hashing and verification."""

    def test_hash_password_returns_string(self):
        """Hash function should return a string."""
        result = hash_password("TestPassword123")
        assert isinstance(result, str)

    def test_hash_password_produces_bcrypt_format(self):
        """Hashed password should start with a bcrypt identifier ($2b$)."""
        result = hash_password("TestPassword123")
        assert result.startswith("$2b$") or result.startswith("$2a$")

    def test_hash_password_not_plaintext(self):
        """Hashed password must not equal the original plaintext."""
        password = "TestPassword123"
        result = hash_password(password)
        assert result != password

    def test_hash_password_unique_salts(self):
        """Two hashes of the same password should differ (unique salts)."""
        hash1 = hash_password("TestPassword123")
        hash2 = hash_password("TestPassword123")
        assert hash1 != hash2

    def test_verify_password_correct(self):
        """Verification should return True for the correct password."""
        password = "SecurePassword456"
        hashed = hash_password(password)
        assert verify_password(password, hashed) is True

    def test_verify_password_incorrect(self):
        """Verification should return False for an incorrect password."""
        hashed = hash_password("CorrectPassword")
        assert verify_password("WrongPassword", hashed) is False

    def test_verify_password_empty_string(self):
        """Verification should handle empty password input without crashing."""
        hashed = hash_password("SomePassword")
        assert verify_password("", hashed) is False

    def test_hash_password_special_characters(self):
        """Hashing should work with special characters."""
        password = "p@$$w0rd!#%^&*()"
        hashed = hash_password(password)
        assert verify_password(password, hashed) is True

    def test_hash_password_unicode(self):
        """Hashing should work with unicode characters."""
        password = "pässwörd™"
        hashed = hash_password(password)
        assert verify_password(password, hashed) is True


# ============================================================
# JWT TOKEN CREATION TESTS
# ============================================================

class TestCreateAccessToken:
    """Tests for JWT access token creation."""

    def test_returns_string(self):
        """Token should be returned as a string."""
        token = create_access_token({"sub": "user@test.com"})
        assert isinstance(token, str)

    def test_token_contains_subject_claim(self):
        """Token payload should contain the data passed in."""
        token = create_access_token({"sub": "user@test.com"})
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        assert payload["sub"] == "user@test.com"

    def test_token_contains_expiry(self):
        """Token payload should contain an 'exp' claim."""
        token = create_access_token({"sub": "user@test.com"})
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        assert "exp" in payload

    def test_token_expiry_is_in_future(self):
        """Token expiry should be set in the future."""
        token = create_access_token({"sub": "user@test.com"})
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        exp_datetime = datetime.utcfromtimestamp(payload["exp"])
        assert exp_datetime > datetime.utcnow()

    def test_token_expiry_approximately_correct(self):
        """Token expiry should be approximately ACCESS_TOKEN_EXPIRE_MINUTES from now."""
        before = datetime.utcnow()
        token = create_access_token({"sub": "user@test.com"})
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        exp_datetime = datetime.utcfromtimestamp(payload["exp"])
        expected = before + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        # Allow 5-second tolerance for execution time
        assert abs((exp_datetime - expected).total_seconds()) < 5

    def test_token_preserves_custom_claims(self):
        """Token should preserve additional custom data."""
        data = {"sub": "user@test.com", "user_id": 42, "role": "admin"}
        token = create_access_token(data)
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        assert payload["user_id"] == 42
        assert payload["role"] == "admin"

    def test_original_data_not_mutated(self):
        """The original data dict should not be modified by token creation."""
        data = {"sub": "user@test.com"}
        original_keys = set(data.keys())
        create_access_token(data)
        assert set(data.keys()) == original_keys


# ============================================================
# JWT TOKEN VERIFICATION TESTS
# ============================================================

class TestVerifyToken:
    """Tests for JWT token verification."""

    def test_valid_token_returns_payload(self):
        """A valid token should return its decoded payload."""
        token = create_access_token({"sub": "user@test.com"})
        payload = verify_token(token)
        assert payload is not None
        assert payload["sub"] == "user@test.com"

    def test_invalid_token_returns_none(self):
        """A malformed token should return None."""
        result = verify_token("this.is.not.a.valid.token")
        assert result is None

    def test_tampered_token_returns_none(self):
        """A token signed with a different key should return None."""
        token = jwt.encode(
            {"sub": "user@test.com", "exp": datetime.utcnow() + timedelta(hours=1)},
            "wrong-secret-key",
            algorithm=ALGORITHM,
        )
        result = verify_token(token)
        assert result is None

    def test_expired_token_returns_none(self):
        """An expired token should return None."""
        expired_payload = {
            "sub": "user@test.com",
            "exp": datetime.utcnow() - timedelta(minutes=5),
        }
        token = jwt.encode(expired_payload, SECRET_KEY, algorithm=ALGORITHM)
        result = verify_token(token)
        assert result is None

    def test_empty_string_returns_none(self):
        """An empty string token should return None."""
        result = verify_token("")
        assert result is None


# ============================================================
# CONFIGURATION TESTS
# ============================================================

class TestAuthConfiguration:
    """Tests for authentication configuration values."""

    def test_algorithm_is_hs256(self):
        """Algorithm should be HS256."""
        assert ALGORITHM == "HS256"

    def test_token_expiry_is_60_minutes(self):
        """Token expiry should be set to 60 minutes."""
        assert ACCESS_TOKEN_EXPIRE_MINUTES == 60

    def test_secret_key_is_set(self):
        """Secret key should not be empty."""
        assert SECRET_KEY is not None
        assert len(SECRET_KEY) > 0