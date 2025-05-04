from flask import Blueprint, jsonify
import traceback
import logging

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("error_logs.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)
