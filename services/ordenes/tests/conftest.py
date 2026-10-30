import os
import tempfile

_db_file = os.path.join(tempfile.mkdtemp(), "test_ordenes.db")
os.environ["DATABASE_URL"] = f"sqlite:///{_db_file}"
os.environ["SECRET_KEY"] = "clave-solo-para-tests"
os.environ["ALGORITHM"] = "HS256"
os.environ["SERVICE_KEY"] = "service-key-solo-para-tests"
os.environ["CATALOGO_URL"] = "http://127.0.0.1:9"
