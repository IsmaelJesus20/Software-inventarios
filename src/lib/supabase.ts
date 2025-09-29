import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xtfsblacodfzgdhvyezz.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0ZnNibGFjb2RmemdkaHZ5ZXp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2Mzc0NDIsImV4cCI6MjA3MzIxMzQ0Mn0.gI6Y2QSh2ryY3MunER5LaUutlK2oV-dAo-WWwoeVyxM'

// Variables configuradas correctamente para producción

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables de entorno faltantes:', { supabaseUrl, supabaseAnonKey })
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos de base de datos basados en tu estructura de Supabase
export interface Database {
  public: {
    Tables: {
      materials: {
        Row: {
          id: string
          name: string
          category: string
          location: string
          current_stock: number
          min_stock: number | null
          initial_stock: number
          created_at: string
          updated_at: string
          unit: string | null
        }
        Insert: {
          id?: string
          name: string
          category: string
          location: string
          current_stock?: number
          min_stock?: number | null
          initial_stock?: number
          created_at?: string
          updated_at?: string
          unit?: string | null
        }
        Update: {
          id?: string
          name?: string
          category?: string
          location?: string
          current_stock?: number
          min_stock?: number | null
          initial_stock?: number
          created_at?: string
          updated_at?: string
          unit?: string | null
        }
      }
      movements: {
        Row: {
          id: string
          material_id: string
          material_name: string
          type: string
          quantity: number
          responsible: string
          comment: string
          timestamp: string
        }
        Insert: {
          id?: string
          material_id: string
          material_name: string
          type: string
          quantity: number
          responsible: string
          comment?: string
          timestamp?: string
        }
        Update: {
          id?: string
          material_id?: string
          material_name?: string
          type?: string
          quantity?: number
          responsible?: string
          comment?: string
          timestamp?: string
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