# BACKEND_ENGINEERING_STANDARD.md — OctoSight

Dokumen ini adalah standar teknis detail backend. Baca setelah `BACKEND_BEST_PRACTICES.md`.

---

## 1. Arsitektur & Layer Boundaries

### Aturan Absolut

```
Request → Router → Service → Repository → DB
                ↘ Storage (jika ada file)
                ↘ ML Inference (jika ada scoring)
```

| Layer | Boleh | Tidak Boleh |
|---|---|---|
| Router | Parse request, validasi Pydantic, return `JSONResponse`, inject dependency | Logika bisnis, query DB langsung, load model ML |
| Service | Logika bisnis, orkestrasi, transformasi data, kalkulasi pagination | `JSONResponse`, `HTTPException`, import `Session` tanpa parameter |
| Repository | Query SQLAlchemy ORM | Logika bisnis, validasi, `try/except` |
| ML Module | Load model, preprocess, inference | Query DB, akses request/response |

---

## 2. Detection Engine Standards

### Rule-Based Engine (`detection/rules.py`)

Implementasikan setiap rule sebagai fungsi independen yang mengembalikan `(score: int, reason: str | None)`:

```python
def check_typosquatting(text: str, known_domains: list[str]) -> tuple[int, str | None]:
    """Cek kemiripan domain dengan edit distance."""
    from Levenshtein import distance
    for domain in known_domains:
        if distance(extract_domain(text), domain) <= 2:
            return 25, f"domain mirip dengan {domain}"
    return 0, None

def check_phishing_keywords(text: str) -> tuple[int, str | None]:
    """Cek keberadaan kata kunci phishing."""
    KEYWORDS = ["verifikasi", "klik", "menang", "hadiah", "segera", "otp", "data pribadi"]
    found = [kw for kw in KEYWORDS if kw in text.lower()]
    if found:
        score = min(len(found) * 15, 30)
        return score, f"mengandung kata mencurigakan: {', '.join(found)}"
    return 0, None

def check_suspicious_tld(url: str) -> tuple[int, str | None]:
    SUSPICIOUS_TLDS = [".xyz", ".top", ".click", ".tk", ".ml", ".ga"]
    for tld in SUSPICIOUS_TLDS:
        if url.endswith(tld):
            return 15, f"menggunakan TLD mencurigakan: {tld}"
    return 0, None
```

Aggregate di `RuleBasedEngine.analyze()`:

```python
class RuleBasedEngine:
    def analyze(self, text: str) -> tuple[int, list[str]]:
        total_score = 0
        explanations = []
        rules = [check_typosquatting, check_phishing_keywords, check_suspicious_tld, ...]
        for rule in rules:
            score, reason = rule(text)
            total_score += score
            if reason:
                explanations.append(reason)
        return min(total_score, 100), explanations
```

### ML Engine (`ml/inference.py`)

```python
import joblib
from functools import lru_cache

@lru_cache(maxsize=1)
def load_model():
    """Load model sekali saja ke memory, reuse via cache."""
    model = joblib.load(settings.ML_MODEL_PATH)
    vectorizer = joblib.load(settings.ML_VECTORIZER_PATH)
    return model, vectorizer

def predict(text: str) -> float:
    """Return probabilitas phishing (0.0–1.0)."""
    model, vectorizer = load_model()
    features = vectorizer.transform([text])
    probability = model.predict_proba(features)[0][1]
    return float(probability)
```

### Risk Scoring Formula

```python
def calculate_risk_score(rule_score: int, ml_probability: float) -> dict:
    ml_score = int(ml_probability * 100)
    final_score = int((rule_score * 0.35) + (ml_score * 0.65))
    final_score = max(0, min(100, final_score))  # clamp 0–100

    if final_score >= 70:
        priority, label = "HIGH", "Phishing"
    elif final_score >= 40:
        priority, label = "MEDIUM", "Suspicious"
    else:
        priority, label = "LOW", "Safe"

    return {
        "rule_score": rule_score,
        "ml_score": ml_score,
        "final_risk_score": final_score,
        "priority": priority,
        "label": label,
    }
```

---

## 3. Ticket Workflow Standards

### Validasi Transisi Status

Implementasikan state machine eksplisit. Tolak transisi yang tidak valid:

```python
VALID_TRANSITIONS = {
    "Submitted":      ["In Review"],
    "In Review":      ["Confirmed", "False Positive", "Need More Info"],
    "Need More Info": ["In Review"],
    "Confirmed":      ["Mitigated"],
    "Mitigated":      ["Closed"],
    "False Positive": [],  # terminal state
    "Closed":         [],  # terminal state
}

def validate_transition(current: str, target: str) -> None:
    allowed = VALID_TRANSITIONS.get(current, [])
    if target not in allowed:
        raise ValueError(f"Transisi dari '{current}' ke '{target}' tidak diizinkan.")
```

### Audit Trail Wajib

Setiap perubahan status harus membuat record `TicketLog`:

```python
def update_status(db: Session, ticket_id: int, payload: TicketUpdate, admin_id: int) -> Ticket:
    ticket = ticket_repository.get_by_id(db, ticket_id)
    if not ticket:
        raise ValueError("Ticket tidak ditemukan")

    validate_transition(ticket.status, payload.status)

    # Update ticket
    ticket_repository.update_status(db, ticket_id, payload.status)

    # Wajib: buat audit log
    ticket_repository.create_log(db, TicketLogCreate(
        ticket_id=ticket_id,
        admin_id=admin_id,
        from_status=ticket.status,
        to_status=payload.status,
        action_taken=payload.action_taken or "",
        notes=payload.notes or "",
    ))

    return ticket_repository.get_by_id(db, ticket_id)
```

---

## 4. Database Standards

### ORM Model Conventions

```python
# models/ticket.py
from sqlalchemy import Column, Integer, String, Text, JSON, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.db.base import Base

class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    ticket_code = Column(String(20), unique=True, nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    url_or_sender = Column(Text, nullable=False)
    modus_type = Column(String(20), nullable=False)
    incident_summary = Column(Text, nullable=False)
    evidence_path = Column(String(500), nullable=True)
    rule_score = Column(Integer, default=0)
    ml_score = Column(Integer, default=0)
    final_risk_score = Column(Integer, default=0)
    priority = Column(String(10), default="LOW")  # HIGH, MEDIUM, LOW
    label = Column(String(20), default="Safe")    # Phishing, Suspicious, Safe
    explanation = Column(JSON, default=list)
    status = Column(String(20), default="Submitted")
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
```

### Migration Conventions

- Setiap migration punya nama deskriptif: `alembic revision -m "add_explanation_column_to_tickets"`
- Selalu implementasikan `downgrade()` yang benar-benar membalik `upgrade()`.
- Jangan drop kolom yang masih digunakan di production tanpa deprecation period.

---

## 5. JWT & Security Standards

### Token Generation

```python
# app/core/security.py
from jose import jwt
from datetime import datetime, timedelta
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_access_token(user_id: int, role: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": str(user_id), "role": role, "exp": expire}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)
```

### Checklist Keamanan per Endpoint

Sebelum menyelesaikan setiap endpoint, verifikasi:
- [ ] Input divalidasi via Pydantic schema
- [ ] `get_current_user` dependency terpasang jika endpoint memerlukan login
- [ ] `require_admin` dependency terpasang jika endpoint hanya untuk admin
- [ ] Error tidak mengekspose detail internal
- [ ] File upload divalidasi tipe dan ukurannya
- [ ] Tidak ada secret yang hardcode

---

## 6. Testing Standards

Buat test di `backend/tests/<module>/test_<layer>.py`:

```python
# tests/tickets/test_ticket_service.py
import pytest
from unittest.mock import MagicMock
from app.modules.tickets.ticket.service import ticket_service
from app.modules.tickets.ticket.schema import TicketCreate

def test_create_ticket_generates_unique_code():
    db = MagicMock()
    payload = TicketCreate(
        url_or_sender="http://evil.xyz",
        modus_type="Web",
        incident_summary="Website palsu menyerupai CIMB",
        report_date="2026-04-14",
    )
    # Mock repository
    ticket_service.create(db, payload, user_id=1)
    db_call = db.add.call_args[0][0]
    assert db_call.ticket_code.startswith("OCT-")

def test_invalid_status_transition_raises():
    with pytest.raises(ValueError, match="tidak diizinkan"):
        from app.modules.tickets.ticket.service import validate_transition
        validate_transition("Closed", "In Review")
```

### Jalankan Test

```bash
cd backend
pytest tests/ -v --tb=short
```

---

## 7. Docker & Development

```yaml
# docker-compose.yml (ringkasan)
services:
  backend:
    build: ./backend
    ports: ["8000:8000"]
    env_file: ./backend/.env
    depends_on: [db]
    volumes: ["./backend:/app", "./uploads:/app/uploads"]

  frontend:
    build: ./frontend
    ports: ["3000:3000"]
    env_file: ./frontend/.env.local
    depends_on: [backend]

  db:
    image: mysql:8.0
    environment:
      MYSQL_DATABASE: octosight
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
    volumes: ["mysql_data:/var/lib/mysql"]
    ports: ["3306:3306"]
```

### Seed Database

```bash
cd backend
python -m seeds.run_seeds
# Membuat: 1 admin, 3 users, 20 dummy tickets dengan variasi status/priority
```

---

## 8. Ticket Code Generation

```python
import random
import string
from datetime import datetime

def generate_ticket_code() -> str:
    """Format: OCT-YYYYMMDD-XXXX (X = random alphanumeric)"""
    date_part = datetime.now().strftime("%Y%m%d")
    rand_part = "".join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f"OCT-{date_part}-{rand_part}"
```

---

## 9. Checklist Sebelum PR Backend

- [ ] `pylint` atau `ruff` bersih — tidak ada unused import, error level
- [ ] `pytest` lulus tanpa failure
- [ ] Semua endpoint baru terdokumentasi di Swagger (lihat FastAPI `/docs`)
- [ ] Migration Alembic dibuat jika ada perubahan skema DB
- [ ] Seed data diupdate jika ada tabel atau kolom baru
- [ ] Tidak ada `print()` debugging yang tertinggal
- [ ] Tidak ada secret atau hardcoded path di kode
- [ ] `BACKEND_BEST_PRACTICES.md` telah diikuti