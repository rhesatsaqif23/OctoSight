# BACKEND_BEST_PRACTICES.md — OctoSight Backend

Stack: **FastAPI + Python 3.11 + SQLAlchemy + MySQL + Pydantic v2 + JWT**

---

## 1. Struktur Modul

Setiap fitur diorganisasi sebagai modul mandiri di `backend/app/modules/<feature>/`:

```
backend/app/modules/
  tickets/
    ticket.router.py      # FastAPI route handlers
    ticket.service.py     # Business logic
    ticket.repository.py  # Database access (SQLAlchemy)
    ticket.schema.py      # Pydantic schemas (request & response)
    __init__.py           # Barrel exports
  detection/
    detection.router.py
    detection.service.py
    detection.repository.py
    detection.schema.py
    __init__.py
  auth/
  users/
  education/
  notifications/
  blacklist/
  dashboard/
```

Route handler hanya boleh import dari barrel (`__init__.py`) modul tersebut:

```python
from app.modules.tickets import ticket_service, TicketCreate, TicketResponse
```

---

## 2. Tanggung Jawab Setiap Layer

### Router (`*.router.py`)
- Hanya menangani HTTP concerns: parse request, validasi input via Pydantic, return `JSONResponse`.
- Tidak boleh mengandung logika bisnis.
- Satu `try/except` block per handler — tangkap semua exception, return format standar.
- Dekorasi setiap route dengan dependency autentikasi yang sesuai.

```python
@router.post("/", response_model=APIResponse[TicketResponse], status_code=201)
async def create_ticket(
    payload: TicketCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        data = ticket_service.create(db, payload, user_id=current_user.id)
        return success_response(data, "Ticket berhasil dibuat", 201)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")
```

### Service (`*.service.py`)
- Berisi semua logika bisnis: validasi lanjutan, orkestrasi repository, transformasi data, kalkulasi pagination.
- Tidak boleh menggunakan `Session` langsung — terima `db` dari parameter dan teruskan ke repository.
- Lempar `ValueError` untuk kesalahan validasi bisnis.
- Tidak boleh return `JSONResponse` atau `HTTPException`.

```python
def create(db: Session, payload: TicketCreate, user_id: int) -> TicketResponse:
    if not payload.url_or_sender and not payload.incident_summary:
        raise ValueError("Minimal satu dari URL atau ringkasan kejadian harus diisi.")

    ticket_code = generate_ticket_code()
    ticket = ticket_repository.create(db, payload, user_id, ticket_code)
    return TicketResponse.model_validate(ticket)
```

### Repository (`*.repository.py`)
- Hanya berisi query database menggunakan SQLAlchemy ORM.
- Tidak ada logika bisnis, tidak ada validasi.
- Tidak menggunakan `try/except` — biarkan exception naik ke service atau router.
- Return ORM model atau `None`.

```python
def create(db: Session, payload: TicketCreate, user_id: int, ticket_code: str) -> Ticket:
    ticket = Ticket(
        ticket_code=ticket_code,
        user_id=user_id,
        **payload.model_dump(exclude_unset=True),
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return ticket

def get_by_id(db: Session, ticket_id: int) -> Ticket | None:
    return db.query(Ticket).filter(Ticket.id == ticket_id).first()
```

### Schema (`*.schema.py`)
- Definisikan Pydantic v2 schema terpisah untuk request (create/update) dan response.
- Update schema: semua field `.Optional[...]` kecuali identifier resource.
- Gunakan `model_config = ConfigDict(from_attributes=True)` pada response schema.

```python
from pydantic import BaseModel, ConfigDict, HttpUrl
from typing import Optional
from datetime import datetime

class TicketCreate(BaseModel):
    url_or_sender: str
    modus_type: str  # "SMS" | "WhatsApp" | "Email" | "Web"
    incident_summary: str
    report_date: datetime

class TicketUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    action_taken: Optional[str] = None

class TicketResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    ticket_code: str
    status: str
    priority: str
    final_risk_score: int
    label: str
    explanation: list[str]
    created_at: datetime
```

---

## 3. Format Response Standar

Semua endpoint menggunakan format yang konsisten. Gunakan helper dari `app/core/response.py`:

```python
# Success
{
  "success": true,
  "message": "Ticket berhasil dibuat",
  "data": { ... }
}

# Success dengan pagination
{
  "success": true,
  "message": "Tickets berhasil diambil",
  "data": [ ... ],
  "metadata": {
    "total_items": 42,
    "current_page": 1,
    "last_page": 5,
    "items_per_page": 10
  }
}

# Error
{
  "success": false,
  "message": "Validation error: modus_type harus salah satu dari SMS/WhatsApp/Email/Web"
}
```

Helper function:
```python
# app/core/response.py
def success_response(data, message: str = "Success", status_code: int = 200):
    return JSONResponse({"success": True, "message": message, "data": data}, status_code)

def paginated_response(data, message: str, metadata: dict, status_code: int = 200):
    return JSONResponse({"success": True, "message": message, "data": data, "metadata": metadata}, status_code)

def error_response(message: str, status_code: int = 500):
    return JSONResponse({"success": False, "message": message}, status_code)
```

---

## 4. Autentikasi & Otorisasi

- Gunakan JWT (HS256). Token di-generate saat login, expire dalam 60 menit.
- Dependency `get_current_user` memvalidasi token dan mengembalikan objek `User`.
- Dependency `require_admin` mengecek `user.role == "admin"` setelah `get_current_user`.

```python
# app/core/dependencies.py
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    payload = decode_token(token)  # raises HTTPException 401 jika invalid
    user = user_repository.get_by_id(db, payload["sub"])
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User tidak aktif atau tidak ditemukan")
    return user

def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Akses ditolak: hanya admin")
    return current_user
```

---

## 5. Error Handling

| HTTP Code | Kondisi |
|---|---|
| 400 | Validation error, bad input, logika bisnis gagal (`ValueError`) |
| 401 | Token tidak valid atau expired |
| 403 | Autentikasi sukses tapi role tidak cukup |
| 404 | Resource tidak ditemukan |
| 500 | Unexpected error — jangan expose detail |

---

## 6. Pagination

Hitung di service layer:

```python
def get_all(db: Session, page: int = 1, limit: int = 10) -> dict:
    offset = (page - 1) * limit
    items = ticket_repository.get_all(db, offset=offset, limit=limit)
    total = ticket_repository.count(db)
    return {
        "data": [TicketResponse.model_validate(t) for t in items],
        "metadata": {
            "total_items": total,
            "current_page": page,
            "last_page": -(-total // limit),  # ceiling division
            "items_per_page": limit,
        }
    }
```

---

## 7. Upload File (Evidence)

- Terima `multipart/form-data` via `UploadFile` FastAPI.
- Validasi tipe (hanya JPEG/PNG) dan ukuran (≤ 5 MB) di router sebelum memanggil service.
- Simpan ke `UPLOAD_DIR/evidence/<user_id>/<timestamp>_<filename>`.
- Simpan **path relatif** ke kolom `evidence_path` di DB, bukan URL absolut.
- Resolve URL publik di service saat response.

```python
@router.post("/")
async def create_ticket(
    url_or_sender: str = Form(...),
    modus_type: str = Form(...),
    incident_summary: str = Form(...),
    evidence_file: UploadFile | None = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if evidence_file:
        if evidence_file.content_type not in ["image/jpeg", "image/png"]:
            raise HTTPException(status_code=400, detail="Hanya JPEG/PNG yang diizinkan")
        content = await evidence_file.read()
        if len(content) > 5 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Ukuran file maksimal 5 MB")
    ...
```

---

## 8. Naming Conventions

| Item | Konvensi | Contoh |
|---|---|---|
| File modul | `<resource>.<layer>.py` | `ticket.service.py` |
| Fungsi/method | `snake_case` | `get_by_id`, `create_ticket` |
| Kelas Pydantic | `PascalCase` | `TicketCreate`, `TicketResponse` |
| Kolom DB / field JSON | `snake_case` | `final_risk_score`, `created_at` |
| Konstanta | `UPPER_SNAKE_CASE` | `ML_MODEL_PATH` |
| Router prefix | `/api/<resource>` | `/api/tickets`, `/api/detection` |

---

## 9. Swagger / OpenAPI

Dekorasi setiap router dengan tag dan deskripsi. Gunakan `response_model` dan `responses` untuk mendokumentasikan semua kemungkinan respons:

```python
@router.get(
    "/{ticket_id}",
    response_model=APIResponse[TicketResponse],
    responses={
        404: {"description": "Ticket tidak ditemukan"},
        403: {"description": "Akses ditolak"},
    },
    summary="Ambil detail ticket",
    tags=["Tickets"],
)
```

---

## 10. Keamanan

- Jangan pernah return raw database error ke client.
- Password di-hash dengan `passlib[bcrypt]` sebelum disimpan.
- Semua input pengguna melewati Pydantic schema sebelum diproses.
- Environment variable via `python-dotenv` — tidak ada hardcode secret.
- CORS dikonfigurasi eksplisit — jangan gunakan `allow_origins=["*"]` di production.