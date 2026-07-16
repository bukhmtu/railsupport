from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..core.database import get_db
from ..core.security import get_current_user, require_roles, hash_password
from ..models.user import User
from ..schemas import UserOut, UserCreate, UserUpdate

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/", response_model=List[UserOut])
def list_users(
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("admin", "dispatcher")),
):
    return db.query(User).order_by(User.id).all()


@router.get("/technicians", response_model=List[UserOut])
def list_technicians(
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("admin", "dispatcher")),
):
    return db.query(User).filter(User.role == "technician", User.is_active == True).all()


@router.post("/", response_model=UserOut, status_code=201)
def create_user(
    body: UserCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("admin")),
):
    if db.query(User).filter(User.username == body.username).first():
        raise HTTPException(400, "Bu username band")

    user = User(
        fullname=body.fullname,
        username=body.username,
        password=hash_password(body.password),
        role=body.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.patch("/{user_id}", response_model=UserOut)
def update_user(
    user_id: int,
    body: UserUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("admin")),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "Foydalanuvchi topilmadi")

    if body.fullname is not None:
        user.fullname = body.fullname
    if body.password is not None:
        user.password = hash_password(body.password)
    if body.role is not None:
        user.role = body.role
    if body.is_active is not None:
        user.is_active = body.is_active

    db.commit()
    db.refresh(user)
    return user


@router.delete("/{user_id}", status_code=204)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin")),
):
    if user_id == current_user.id:
        raise HTTPException(400, "O'zingizni o'chira olmaysiz")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "Foydalanuvchi topilmadi")

    db.delete(user)
    db.commit()
