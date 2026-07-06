"""Configuración compartida de pytest para las pruebas del backend.

Inserta el directorio `server/` (padre de esta carpeta) en sys.path para que
los módulos del servidor (flaskAPI, profile_refiner, travel_planner, etc.)
puedan importarse sin importar desde dónde se ejecute pytest.
"""
import os
import sys

SERVER_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if SERVER_DIR not in sys.path:
    sys.path.insert(0, SERVER_DIR)
