from fastapi import FastAPI
from .database import engine, Base
from .routes import tasks
from fastapi.middleware.cors import CORSMiddleware

# Crear las tablas en la base de datos
Base.metadata.create_all(bind=engine)

app = FastAPI()

# Habilitar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permitir todas las solicitudes (puedes restringirlo)
    allow_credentials=True,
    allow_methods=["*"],  # Permitir todos los métodos (GET, POST, etc.)
    allow_headers=["*"],  # Permitir todos los headers
)


# Incluir las rutas
app.include_router(tasks.router)

