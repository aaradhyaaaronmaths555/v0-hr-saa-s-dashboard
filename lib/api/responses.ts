import { NextResponse } from "next/server"

export function jsonOk<T>(body: T, status = 200) {
  return NextResponse.json(body, { status })
}

export function jsonCreated<T>(body: T) {
  return jsonOk(body, 201)
}

export function jsonBadRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 })
}

export function jsonUnauthorized(message = "Unauthenticated") {
  return NextResponse.json({ error: message }, { status: 401 })
}

export function jsonForbidden(message: string) {
  return NextResponse.json({ error: message }, { status: 403 })
}

export function jsonNotFound(message: string) {
  return NextResponse.json({ error: message }, { status: 404 })
}

export function jsonServerError(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : fallback
  return NextResponse.json({ error: message }, { status: 500 })
}
