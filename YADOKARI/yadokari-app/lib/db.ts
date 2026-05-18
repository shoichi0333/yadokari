// Phase 2: Prisma / Supabase クライアント
// DATABASE_URL が設定されている場合はPrismaを使用。
// 未設定時はlib/data/properties.tsのモックデータにフォールバック（lib/properties-service.ts経由）。
export { prisma } from "./prisma";
export { getSupabaseClient, getSupabaseServerClient } from "./supabase";
