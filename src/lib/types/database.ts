export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Enums: {
      asistencia_estado: "presente" | "falta" | "tardanza" | "justificado";
      estado_general: "activo" | "inactivo";
      matricula_estado: "reservada" | "activa" | "retirada" | "finalizada";
      parentesco_tipo:
        | "padre"
        | "madre"
        | "abuelo"
        | "abuela"
        | "tio"
        | "tia"
        | "hermano"
        | "hermana"
        | "apoderado_legal"
        | "otro";
      pension_estado: "pendiente" | "pagado_parcial" | "pagado" | "vencido" | "anulado";
      sexo_tipo: "M" | "F";
      turno_tipo: "manana" | "tarde";
      usuario_rol_tipo:
        | "super_admin"
        | "director"
        | "subdirector"
        | "secretaria"
        | "tesoreria"
        | "docente"
        | "tutor"
        | "apoderado";
    };
    Tables: {
      usuarios: {
        Row: {
          id: string;
          persona_id: string;
          username: string;
          rol_id: string;
          estado: Database["public"]["Enums"]["estado_general"];
          created_at: string;
        };
      };
      personas: {
        Row: {
          id: string;
          dni: string;
          nombres: string;
          apellido_paterno: string;
          apellido_materno: string;
          email: string | null;
          telefono: string | null;
        };
      };
      anios_escolares: {
        Row: {
          id: string;
          anio: number;
          fecha_inicio: string;
          fecha_fin: string;
          activo: boolean;
        };
      };
    };
    Functions: {
      get_user_role: {
        Args: Record<PropertyKey, never>;
        Returns: Database["public"]["Enums"]["usuario_rol_tipo"];
      };
      get_user_persona_id: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      get_user_profile: {
        Args: Record<PropertyKey, never>;
        Returns: {
          role: Database["public"]["Enums"]["usuario_rol_tipo"];
          persona_id: string;
        }[];
      };
      crear_matricula: {
        Args: {
          p_alumno_id: string;
          p_anio_escolar_id: string;
          p_seccion_id: string;
          p_conceptos: Json;
        };
        Returns: string;
      };
      registrar_pago: {
        Args: {
          p_pension_id: string;
          p_monto: number;
          p_metodo_pago: string;
        };
        Returns: string;
      };
    };
  };
}
