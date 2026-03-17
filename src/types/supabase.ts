export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      perfis: {
        Row: {
          id: string
          nome_completo: string
          cpf: string | null
          nivel: string
          endereco: Json | null
          avatar_url: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id: string
          nome_completo: string
          cpf?: string | null
          nivel?: string
          endereco?: Json | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          nome_completo?: string
          cpf?: string | null
          nivel?: string
          endereco?: Json | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      entidades_governamentais: {
        Row: {
          id: string
          tipo: string
          nome: string
          codigo_ibge: string | null
          pai_id: string | null
          municipio_id: string | null
          regiao_imediata: string | null
          regiao_intermediaria: string | null
          estado_sigla: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          tipo: string
          nome: string
          codigo_ibge?: string | null
          pai_id?: string | null
          municipio_id?: string | null
          regiao_imediata?: string | null
          regiao_intermediaria?: string | null
          estado_sigla?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          tipo?: string
          nome?: string
          codigo_ibge?: string | null
          pai_id?: string | null
          municipio_id?: string | null
          regiao_imediata?: string | null
          regiao_intermediaria?: string | null
          estado_sigla?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      municipios: {
        Row: {
          id: string
          id_uf: number
          nome_uf: string
          sigla_uf: string
          id_regiao_interm: number | null
          nome_regiao_interm: string | null
          id_regiao_imed: number | null
          nome_regiao_imed: string | null
          id_munic: string
          id_munic_comp: string
          nome_municipio: string
          ativo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          id_uf: number
          nome_uf: string
          sigla_uf: string
          id_regiao_interm?: number | null
          nome_regiao_interm?: string | null
          id_regiao_imed?: number | null
          nome_regiao_imed?: string | null
          id_munic: string
          id_munic_comp: string
          nome_municipio: string
          ativo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          id_uf?: number
          nome_uf?: string
          sigla_uf?: string
          id_regiao_interm?: number | null
          nome_regiao_interm?: string | null
          id_regiao_imed?: number | null
          nome_regiao_imed?: string | null
          id_munic?: string
          id_munic_comp?: string
          nome_municipio?: string
          ativo?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
