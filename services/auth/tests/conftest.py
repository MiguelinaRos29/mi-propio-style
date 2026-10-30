import os
import tempfile

# Las variables deben fijarse ANTES de importar la app (database.py las lee al importarse).
_db_file = os.path.join(tempfile.mkdtemp(), "test_auth.db")
os.environ["DATABASE_URL"] = f"sqlite:///{_db_file}"
os.environ["SECRET_KEY"] = "clave-solo-para-tests"
os.environ["ALGORITHM"] = "HS256"

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.database import Base, engine


@pytest.fixture()
def client():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    with TestClient(app) as c:
        yield c
