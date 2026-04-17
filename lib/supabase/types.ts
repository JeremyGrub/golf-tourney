// Handwritten database types matching supabase/migrations/0001_initial.sql.
// Regenerate once the Supabase project exists with:
//   npx supabase gen types typescript --project-id <id> > lib/supabase/types.ts

export type TournamentStatus = "draft" | "live" | "complete";
export type ScoringFormat = "stroke_play";

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["users"]["Insert"]>;
        Relationships: [];
      };
      tournaments: {
        Row: {
          id: string;
          host_id: string;
          name: string;
          slug: string;
          course_name: string | null;
          course_location: string | null;
          start_date: string | null;
          start_time: string | null;
          hole_count: 9 | 18;
          status: TournamentStatus;
          format: ScoringFormat;
          created_at: string;
        };
        Insert: {
          id?: string;
          host_id: string;
          name: string;
          slug: string;
          course_name?: string | null;
          course_location?: string | null;
          start_date?: string | null;
          start_time?: string | null;
          hole_count: 9 | 18;
          status?: TournamentStatus;
          format?: ScoringFormat;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["tournaments"]["Insert"]>;
        Relationships: [];
      };
      holes: {
        Row: {
          id: string;
          tournament_id: string;
          hole_number: number;
          par: number;
          yardage: number | null;
          handicap_index: number | null;
        };
        Insert: {
          id?: string;
          tournament_id: string;
          hole_number: number;
          par?: number;
          yardage?: number | null;
          handicap_index?: number | null;
        };
        Update: Partial<Database["public"]["Tables"]["holes"]["Insert"]>;
        Relationships: [];
      };
      tee_times: {
        Row: {
          id: string;
          tournament_id: string;
          tee_time: string;
          starting_hole: number;
          group_label: string | null;
        };
        Insert: {
          id?: string;
          tournament_id: string;
          tee_time: string;
          starting_hole?: number;
          group_label?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["tee_times"]["Insert"]>;
        Relationships: [];
      };
      participants: {
        Row: {
          id: string;
          tournament_id: string;
          display_name: string;
          hometown: string | null;
          tee_time_id: string | null;
          access_token: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          tournament_id: string;
          display_name: string;
          hometown?: string | null;
          tee_time_id?: string | null;
          access_token?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["participants"]["Insert"]>;
        Relationships: [];
      };
      scores: {
        Row: {
          id: string;
          participant_id: string;
          hole_id: string;
          strokes: number;
          submitted_at: string;
        };
        Insert: {
          id?: string;
          participant_id: string;
          hole_id: string;
          strokes: number;
          submitted_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["scores"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: {
      public_participants: {
        Row: {
          id: string;
          tournament_id: string;
          display_name: string;
          hometown: string | null;
          tee_time_id: string | null;
          created_at: string;
        };
      };
    };
    Functions: {
      submit_score: {
        Args: {
          p_token: string;
          p_hole_number: number;
          p_strokes: number;
        };
        Returns: Database["public"]["Tables"]["scores"]["Row"];
      };
    };
    Enums: {
      tournament_status: TournamentStatus;
      scoring_format: ScoringFormat;
    };
  };
}
