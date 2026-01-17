#!/bin/bash
# Script para fazer login no Instagram
# Execute: ./login.sh

cd "$(dirname "$0")"
source venv/bin/activate
python3 login_instagram.py
