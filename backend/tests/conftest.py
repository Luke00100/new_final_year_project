"""
Shared pytest configuration and fixtures.
Place this file in the same directory as your test files.
"""

import sys
import os

# ── Add your backend source directory to the Python path ──
# Adjust this path so pytest can find your modules (auth, document_processor, etc.)
# For example, if your tests/ folder sits alongside your source files:
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))