import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://epqxxkzekemtudvrxchc.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwcXh4a3pla2VtdHVkdnJ4Y2hjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxOTA5MjEsImV4cCI6MjA3Mjc2NjkyMX0.FNgJ_0tIls-D_2aCo4ZZ31a7HMWw7aeHAKHeNgsqUjY'

// Debug: Mostrar todas las variables de entorno disponibles
console.log('🔍 Debug todas las variables de entorno:', import.meta.env)
console.log('🔍 Debug VITE_SUPABASE_URL:', supabaseUrl)
console.log('🔍 Debug VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'CONFIGURADA' : 'FALTANTE')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables de entorno faltantes:', { supabaseUrl, supabaseAnonKey })
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos de base de datos basados en tu estructura de Supabase
export interface Database {
  public: {
    Tables: {
      inventory_items: {
        Row: {
          id: string
          codigo: string
          descripcion: string
          categoria: string | null
          ubicacion: string | null
          stock_actual: number
          stock_minimo: number | null
          precio_unitario: number | null
          unidad_medida: string | null
          estado: string | null
          created_at: string
          updated_at: string
          created_by: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          codigo: string
          descripcion: string
          categoria?: string | null
          ubicacion?: string | null
          stock_actual?: number
          stock_minimo?: number | null
          precio_unitario?: number | null
          unidad_medida?: string | null
          estado?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          codigo?: string
          descripcion?: string
          categoria?: string | null
          ubicacion?: string | null
          stock_actual?: number
          stock_minimo?: number | null
          precio_unitario?: number | null
          unidad_medida?: string | null
          estado?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
      }
      inventory_movements: {
        Row: {
          id: string
          item_id: string
          tipo_movimiento: string
          cantidad: number
          stock_anterior: number
          stock_nuevo: number
          motivo: string | null
          comentarios: string | null
          documento_referencia: string | null
          usuario_id: string
          created_at: string
        }
        Insert: {
          id?: string
          item_id: string
          tipo_movimiento: string
          cantidad: number
          stock_anterior: number
          stock_nuevo: number
          motivo?: string | null
          comentarios?: string | null
          documento_referencia?: string | null
          usuario_id: string
          created_at?: string
        }
        Update: {
          id?: string
          item_id?: string
          tipo_movimiento?: string
          cantidad?: number
          stock_anterior?: number
          stock_nuevo?: number
          motivo?: string | null
          comentarios?: string | null
          documento_referencia?: string | null
          usuario_id?: string
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          role: string
          nombre_completo: string | null
          last_login_at: string | null
          created_at: string
          updated_at: string
          email: string | null
        }
        Insert: {
          id: string
          role?: string
          nombre_completo?: string | null
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
          email?: string | null
        }
        Update: {
          id?: string
          role?: string
          nombre_completo?: string | null
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
          email?: string | null
        }
      }
    }
  }
}