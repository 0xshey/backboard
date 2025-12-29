export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      game: {
        Row: {
          arena_city: string | null
          arena_name: string | null
          arena_state: string | null
          code: string | null
          created_at: string
          datetime: string | null
          id: string
          label: string | null
          live_clock: string | null
          live_period: number | null
          national_broadcaster: string | null
          status_code: number | null
          status_text: string | null
          sublabel: string | null
          team_away_id: string | null
          team_away_score: number | null
          team_home_id: string | null
          team_home_score: number | null
          week_nba: number | null
        }
        Insert: {
          arena_city?: string | null
          arena_name?: string | null
          arena_state?: string | null
          code?: string | null
          created_at?: string
          datetime?: string | null
          id: string
          label?: string | null
          live_clock?: string | null
          live_period?: number | null
          national_broadcaster?: string | null
          status_code?: number | null
          status_text?: string | null
          sublabel?: string | null
          team_away_id?: string | null
          team_away_score?: number | null
          team_home_id?: string | null
          team_home_score?: number | null
          week_nba?: number | null
        }
        Update: {
          arena_city?: string | null
          arena_name?: string | null
          arena_state?: string | null
          code?: string | null
          created_at?: string
          datetime?: string | null
          id?: string
          label?: string | null
          live_clock?: string | null
          live_period?: number | null
          national_broadcaster?: string | null
          status_code?: number | null
          status_text?: string | null
          sublabel?: string | null
          team_away_id?: string | null
          team_away_score?: number | null
          team_home_id?: string | null
          team_home_score?: number | null
          week_nba?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "game_team_away_id_fkey"
            columns: ["team_away_id"]
            isOneToOne: false
            referencedRelation: "team"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_team_home_id_fkey"
            columns: ["team_home_id"]
            isOneToOne: false
            referencedRelation: "team"
            referencedColumns: ["id"]
          },
        ]
      }
      game_player: {
        Row: {
          assists: number | null
          blocks: number | null
          blocks_received: number | null
          created_at: string
          field_goals_attempted: number | null
          field_goals_made: number | null
          field_goals_percentage: number | null
          first_name: string | null
          fouls_drawn: number | null
          fouls_offensive: number | null
          fouls_personal: number | null
          fouls_technical: number | null
          fp: number | null
          free_throws_attempted: number | null
          free_throws_made: number | null
          free_throws_percentage: number | null
          game_id: string
          jersey_number: number | null
          last_name: string | null
          minus: number | null
          not_playing_description: string | null
          not_playing_reason: string | null
          on_court: boolean | null
          played: boolean | null
          player_id: string
          plus: number | null
          plus_minus: number | null
          points: number | null
          points_fast_break: number | null
          points_in_the_paint: number | null
          points_second_chance: number | null
          rebounds_defensive: number | null
          rebounds_offensive: number | null
          rebounds_total: number | null
          seconds: number | null
          starter: boolean | null
          starting_position: string | null
          status: string | null
          steals: number | null
          still_playing: boolean | null
          team_id: string | null
          team_opp_id: string | null
          three_pointers_attempted: number | null
          three_pointers_made: number | null
          three_pointers_percentage: number | null
          turnovers: number | null
          two_pointers_attempted: number | null
          two_pointers_made: number | null
          two_pointers_percentage: number | null
        }
        Insert: {
          assists?: number | null
          blocks?: number | null
          blocks_received?: number | null
          created_at?: string
          field_goals_attempted?: number | null
          field_goals_made?: number | null
          field_goals_percentage?: number | null
          first_name?: string | null
          fouls_drawn?: number | null
          fouls_offensive?: number | null
          fouls_personal?: number | null
          fouls_technical?: number | null
          fp?: number | null
          free_throws_attempted?: number | null
          free_throws_made?: number | null
          free_throws_percentage?: number | null
          game_id: string
          jersey_number?: number | null
          last_name?: string | null
          minus?: number | null
          not_playing_description?: string | null
          not_playing_reason?: string | null
          on_court?: boolean | null
          played?: boolean | null
          player_id: string
          plus?: number | null
          plus_minus?: number | null
          points?: number | null
          points_fast_break?: number | null
          points_in_the_paint?: number | null
          points_second_chance?: number | null
          rebounds_defensive?: number | null
          rebounds_offensive?: number | null
          rebounds_total?: number | null
          seconds?: number | null
          starter?: boolean | null
          starting_position?: string | null
          status?: string | null
          steals?: number | null
          still_playing?: boolean | null
          team_id?: string | null
          team_opp_id?: string | null
          three_pointers_attempted?: number | null
          three_pointers_made?: number | null
          three_pointers_percentage?: number | null
          turnovers?: number | null
          two_pointers_attempted?: number | null
          two_pointers_made?: number | null
          two_pointers_percentage?: number | null
        }
        Update: {
          assists?: number | null
          blocks?: number | null
          blocks_received?: number | null
          created_at?: string
          field_goals_attempted?: number | null
          field_goals_made?: number | null
          field_goals_percentage?: number | null
          first_name?: string | null
          fouls_drawn?: number | null
          fouls_offensive?: number | null
          fouls_personal?: number | null
          fouls_technical?: number | null
          fp?: number | null
          free_throws_attempted?: number | null
          free_throws_made?: number | null
          free_throws_percentage?: number | null
          game_id?: string
          jersey_number?: number | null
          last_name?: string | null
          minus?: number | null
          not_playing_description?: string | null
          not_playing_reason?: string | null
          on_court?: boolean | null
          played?: boolean | null
          player_id?: string
          plus?: number | null
          plus_minus?: number | null
          points?: number | null
          points_fast_break?: number | null
          points_in_the_paint?: number | null
          points_second_chance?: number | null
          rebounds_defensive?: number | null
          rebounds_offensive?: number | null
          rebounds_total?: number | null
          seconds?: number | null
          starter?: boolean | null
          starting_position?: string | null
          status?: string | null
          steals?: number | null
          still_playing?: boolean | null
          team_id?: string | null
          team_opp_id?: string | null
          three_pointers_attempted?: number | null
          three_pointers_made?: number | null
          three_pointers_percentage?: number | null
          turnovers?: number | null
          two_pointers_attempted?: number | null
          two_pointers_made?: number | null
          two_pointers_percentage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "game_player_game_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "game"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_player_player_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_player_team_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "team"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_player_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "team"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_player_team_opp_id_fkey"
            columns: ["team_opp_id"]
            isOneToOne: false
            referencedRelation: "team"
            referencedColumns: ["id"]
          },
        ]
      }
      game_team: {
        Row: {
          assist_turnover_ratio: number | null
          assists: number | null
          bench_points: number | null
          biggest_lead: number | null
          biggest_scoring_run: number | null
          blocks: number | null
          blocks_received: number | null
          created_at: string
          field_goals_attempted: number | null
          field_goals_made: number | null
          field_goals_percentage: number | null
          fouls_drawn: number | null
          fouls_offensive: number | null
          fouls_personal: number | null
          fouls_team: number | null
          fouls_team_technical: number | null
          fouls_technical: number | null
          free_throws_attempted: number | null
          free_throws_made: number | null
          free_throws_percentage: number | null
          game_id: string
          plus_minus: number | null
          points: number | null
          points_against: number | null
          points_fast_break: number | null
          points_fast_break_attempted: number | null
          points_fast_break_made: number | null
          points_fast_break_percentage: number | null
          points_from_turnovers: number | null
          points_in_the_paint: number | null
          points_in_the_paint_attempted: number | null
          points_in_the_paint_made: number | null
          points_in_the_paint_percentage: number | null
          points_second_chance: number | null
          points_second_chance_attempted: number | null
          points_second_chance_made: number | null
          points_second_chance_percentage: number | null
          rebounds_defensive: number | null
          rebounds_offensive: number | null
          rebounds_team: number | null
          rebounds_team_defensive: number | null
          rebounds_team_offensive: number | null
          rebounds_total: number | null
          seconds: number | null
          steals: number | null
          team_field_goals_attempted: number | null
          team_id: string
          team_opp_id: string | null
          three_pointers_attempted: number | null
          three_pointers_made: number | null
          three_pointers_percentage: number | null
          time_leading: number | null
          times_tied: number | null
          true_shooting_attempts: number | null
          true_shooting_percentage: number | null
          turnovers: number | null
          turnovers_team: number | null
          turnovers_total: number | null
          two_pointers_attempted: number | null
          two_pointers_made: number | null
          two_pointers_percentage: number | null
        }
        Insert: {
          assist_turnover_ratio?: number | null
          assists?: number | null
          bench_points?: number | null
          biggest_lead?: number | null
          biggest_scoring_run?: number | null
          blocks?: number | null
          blocks_received?: number | null
          created_at?: string
          field_goals_attempted?: number | null
          field_goals_made?: number | null
          field_goals_percentage?: number | null
          fouls_drawn?: number | null
          fouls_offensive?: number | null
          fouls_personal?: number | null
          fouls_team?: number | null
          fouls_team_technical?: number | null
          fouls_technical?: number | null
          free_throws_attempted?: number | null
          free_throws_made?: number | null
          free_throws_percentage?: number | null
          game_id: string
          plus_minus?: number | null
          points?: number | null
          points_against?: number | null
          points_fast_break?: number | null
          points_fast_break_attempted?: number | null
          points_fast_break_made?: number | null
          points_fast_break_percentage?: number | null
          points_from_turnovers?: number | null
          points_in_the_paint?: number | null
          points_in_the_paint_attempted?: number | null
          points_in_the_paint_made?: number | null
          points_in_the_paint_percentage?: number | null
          points_second_chance?: number | null
          points_second_chance_attempted?: number | null
          points_second_chance_made?: number | null
          points_second_chance_percentage?: number | null
          rebounds_defensive?: number | null
          rebounds_offensive?: number | null
          rebounds_team?: number | null
          rebounds_team_defensive?: number | null
          rebounds_team_offensive?: number | null
          rebounds_total?: number | null
          seconds?: number | null
          steals?: number | null
          team_field_goals_attempted?: number | null
          team_id: string
          team_opp_id?: string | null
          three_pointers_attempted?: number | null
          three_pointers_made?: number | null
          three_pointers_percentage?: number | null
          time_leading?: number | null
          times_tied?: number | null
          true_shooting_attempts?: number | null
          true_shooting_percentage?: number | null
          turnovers?: number | null
          turnovers_team?: number | null
          turnovers_total?: number | null
          two_pointers_attempted?: number | null
          two_pointers_made?: number | null
          two_pointers_percentage?: number | null
        }
        Update: {
          assist_turnover_ratio?: number | null
          assists?: number | null
          bench_points?: number | null
          biggest_lead?: number | null
          biggest_scoring_run?: number | null
          blocks?: number | null
          blocks_received?: number | null
          created_at?: string
          field_goals_attempted?: number | null
          field_goals_made?: number | null
          field_goals_percentage?: number | null
          fouls_drawn?: number | null
          fouls_offensive?: number | null
          fouls_personal?: number | null
          fouls_team?: number | null
          fouls_team_technical?: number | null
          fouls_technical?: number | null
          free_throws_attempted?: number | null
          free_throws_made?: number | null
          free_throws_percentage?: number | null
          game_id?: string
          plus_minus?: number | null
          points?: number | null
          points_against?: number | null
          points_fast_break?: number | null
          points_fast_break_attempted?: number | null
          points_fast_break_made?: number | null
          points_fast_break_percentage?: number | null
          points_from_turnovers?: number | null
          points_in_the_paint?: number | null
          points_in_the_paint_attempted?: number | null
          points_in_the_paint_made?: number | null
          points_in_the_paint_percentage?: number | null
          points_second_chance?: number | null
          points_second_chance_attempted?: number | null
          points_second_chance_made?: number | null
          points_second_chance_percentage?: number | null
          rebounds_defensive?: number | null
          rebounds_offensive?: number | null
          rebounds_team?: number | null
          rebounds_team_defensive?: number | null
          rebounds_team_offensive?: number | null
          rebounds_total?: number | null
          seconds?: number | null
          steals?: number | null
          team_field_goals_attempted?: number | null
          team_id?: string
          team_opp_id?: string | null
          three_pointers_attempted?: number | null
          three_pointers_made?: number | null
          three_pointers_percentage?: number | null
          time_leading?: number | null
          times_tied?: number | null
          true_shooting_attempts?: number | null
          true_shooting_percentage?: number | null
          turnovers?: number | null
          turnovers_team?: number | null
          turnovers_total?: number | null
          two_pointers_attempted?: number | null
          two_pointers_made?: number | null
          two_pointers_percentage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "game_team_game_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "game"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_team_team_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "team"
            referencedColumns: ["id"]
          },
        ]
      }
      game_week_fantasy: {
        Row: {
          end_date: string | null
          label: string | null
          number: number
          provider: Database["public"]["Enums"]["fantasy_provider"]
          start_date: string | null
        }
        Insert: {
          end_date?: string | null
          label?: string | null
          number: number
          provider?: Database["public"]["Enums"]["fantasy_provider"]
          start_date?: string | null
        }
        Update: {
          end_date?: string | null
          label?: string | null
          number?: number
          provider?: Database["public"]["Enums"]["fantasy_provider"]
          start_date?: string | null
        }
        Relationships: []
      }
      player: {
        Row: {
          active_from_year: number | null
          active_to_year: number | null
          college: string | null
          country: string | null
          created_at: string
          draft_pick: number | null
          draft_round: number | null
          draft_year: number | null
          first_name: string | null
          height_inches: number | null
          id: string
          jersey_number: number | null
          last_name: string | null
          roles: Database["public"]["Enums"]["role"][] | null
          roster_status_code: number | null
          slug: string | null
          team_id: string | null
          weight_pounds: number | null
        }
        Insert: {
          active_from_year?: number | null
          active_to_year?: number | null
          college?: string | null
          country?: string | null
          created_at?: string
          draft_pick?: number | null
          draft_round?: number | null
          draft_year?: number | null
          first_name?: string | null
          height_inches?: number | null
          id: string
          jersey_number?: number | null
          last_name?: string | null
          roles?: Database["public"]["Enums"]["role"][] | null
          roster_status_code?: number | null
          slug?: string | null
          team_id?: string | null
          weight_pounds?: number | null
        }
        Update: {
          active_from_year?: number | null
          active_to_year?: number | null
          college?: string | null
          country?: string | null
          created_at?: string
          draft_pick?: number | null
          draft_round?: number | null
          draft_year?: number | null
          first_name?: string | null
          height_inches?: number | null
          id?: string
          jersey_number?: number | null
          last_name?: string | null
          roles?: Database["public"]["Enums"]["role"][] | null
          roster_status_code?: number | null
          slug?: string | null
          team_id?: string | null
          weight_pounds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "player_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "team"
            referencedColumns: ["id"]
          },
        ]
      }
      player_consistency: {
        Row: {
          as_of_date: string
          avg_fantasy_points: number | null
          avg_fantasy_points_l10: number | null
          consistency_std: number | null
          consistency_std_l10: number | null
          first_name: string | null
          games_missed: number | null
          games_played: number | null
          last_name: string | null
          player_id: string
          variation_pct: number | null
          variation_pct_l10: number | null
        }
        Insert: {
          as_of_date?: string
          avg_fantasy_points?: number | null
          avg_fantasy_points_l10?: number | null
          consistency_std?: number | null
          consistency_std_l10?: number | null
          first_name?: string | null
          games_missed?: number | null
          games_played?: number | null
          last_name?: string | null
          player_id: string
          variation_pct?: number | null
          variation_pct_l10?: number | null
        }
        Update: {
          as_of_date?: string
          avg_fantasy_points?: number | null
          avg_fantasy_points_l10?: number | null
          consistency_std?: number | null
          consistency_std_l10?: number | null
          first_name?: string | null
          games_missed?: number | null
          games_played?: number | null
          last_name?: string | null
          player_id?: string
          variation_pct?: number | null
          variation_pct_l10?: number | null
        }
        Relationships: []
      }
      player_season_averages: {
        Row: {
          age: number | null
          assists: number | null
          assists_rank: number | null
          blocks: number | null
          blocks_rank: number | null
          blocks_received: number | null
          blocks_received_rank: number | null
          created_at: string
          double_doubles: number | null
          double_doubles_rank: number | null
          field_goals_attempted: number | null
          field_goals_attempted_rank: number | null
          field_goals_made: number | null
          field_goals_made_rank: number | null
          field_goals_percentage: number | null
          field_goals_percentage_rank: number | null
          fouls_drawn: number | null
          fouls_drawn_rank: number | null
          fouls_personal: number | null
          fouls_personal_rank: number | null
          free_throws_attempted: number | null
          free_throws_attempted_rank: number | null
          free_throws_made: number | null
          free_throws_made_rank: number | null
          free_throws_percentage: number | null
          free_throws_percentage_rank: number | null
          games_played: number | null
          losses: number | null
          losses_rank: number | null
          minutes_average: number | null
          minutes_average_rank: number | null
          nba_fantasy_points: number | null
          nba_fantasy_points_rank: number | null
          player_id: string
          plus_minus: number | null
          plus_minus_rank: number | null
          points: number | null
          points_rank: number | null
          rebounds_defensive: number | null
          rebounds_defensive_rank: number | null
          rebounds_offensive: number | null
          rebounds_offensive_rank: number | null
          rebounds_total: number | null
          rebounds_total_rank: number | null
          season: string
          steals: number | null
          steals_rank: number | null
          team_id: string | null
          three_pointers_attempted: number | null
          three_pointers_attempted_rank: number | null
          three_pointers_made: number | null
          three_pointers_made_rank: number | null
          three_pointers_percentage: number | null
          three_pointers_percentage_rank: number | null
          triple_doubles: number | null
          triple_doubles_rank: number | null
          turnovers: number | null
          turnovers_rank: number | null
          win_percentage: number | null
          win_percentage_rank: number | null
          wins: number | null
          wins_rank: number | null
        }
        Insert: {
          age?: number | null
          assists?: number | null
          assists_rank?: number | null
          blocks?: number | null
          blocks_rank?: number | null
          blocks_received?: number | null
          blocks_received_rank?: number | null
          created_at?: string
          double_doubles?: number | null
          double_doubles_rank?: number | null
          field_goals_attempted?: number | null
          field_goals_attempted_rank?: number | null
          field_goals_made?: number | null
          field_goals_made_rank?: number | null
          field_goals_percentage?: number | null
          field_goals_percentage_rank?: number | null
          fouls_drawn?: number | null
          fouls_drawn_rank?: number | null
          fouls_personal?: number | null
          fouls_personal_rank?: number | null
          free_throws_attempted?: number | null
          free_throws_attempted_rank?: number | null
          free_throws_made?: number | null
          free_throws_made_rank?: number | null
          free_throws_percentage?: number | null
          free_throws_percentage_rank?: number | null
          games_played?: number | null
          losses?: number | null
          losses_rank?: number | null
          minutes_average?: number | null
          minutes_average_rank?: number | null
          nba_fantasy_points?: number | null
          nba_fantasy_points_rank?: number | null
          player_id: string
          plus_minus?: number | null
          plus_minus_rank?: number | null
          points?: number | null
          points_rank?: number | null
          rebounds_defensive?: number | null
          rebounds_defensive_rank?: number | null
          rebounds_offensive?: number | null
          rebounds_offensive_rank?: number | null
          rebounds_total?: number | null
          rebounds_total_rank?: number | null
          season: string
          steals?: number | null
          steals_rank?: number | null
          team_id?: string | null
          three_pointers_attempted?: number | null
          three_pointers_attempted_rank?: number | null
          three_pointers_made?: number | null
          three_pointers_made_rank?: number | null
          three_pointers_percentage?: number | null
          three_pointers_percentage_rank?: number | null
          triple_doubles?: number | null
          triple_doubles_rank?: number | null
          turnovers?: number | null
          turnovers_rank?: number | null
          win_percentage?: number | null
          win_percentage_rank?: number | null
          wins?: number | null
          wins_rank?: number | null
        }
        Update: {
          age?: number | null
          assists?: number | null
          assists_rank?: number | null
          blocks?: number | null
          blocks_rank?: number | null
          blocks_received?: number | null
          blocks_received_rank?: number | null
          created_at?: string
          double_doubles?: number | null
          double_doubles_rank?: number | null
          field_goals_attempted?: number | null
          field_goals_attempted_rank?: number | null
          field_goals_made?: number | null
          field_goals_made_rank?: number | null
          field_goals_percentage?: number | null
          field_goals_percentage_rank?: number | null
          fouls_drawn?: number | null
          fouls_drawn_rank?: number | null
          fouls_personal?: number | null
          fouls_personal_rank?: number | null
          free_throws_attempted?: number | null
          free_throws_attempted_rank?: number | null
          free_throws_made?: number | null
          free_throws_made_rank?: number | null
          free_throws_percentage?: number | null
          free_throws_percentage_rank?: number | null
          games_played?: number | null
          losses?: number | null
          losses_rank?: number | null
          minutes_average?: number | null
          minutes_average_rank?: number | null
          nba_fantasy_points?: number | null
          nba_fantasy_points_rank?: number | null
          player_id?: string
          plus_minus?: number | null
          plus_minus_rank?: number | null
          points?: number | null
          points_rank?: number | null
          rebounds_defensive?: number | null
          rebounds_defensive_rank?: number | null
          rebounds_offensive?: number | null
          rebounds_offensive_rank?: number | null
          rebounds_total?: number | null
          rebounds_total_rank?: number | null
          season?: string
          steals?: number | null
          steals_rank?: number | null
          team_id?: string | null
          three_pointers_attempted?: number | null
          three_pointers_attempted_rank?: number | null
          three_pointers_made?: number | null
          three_pointers_made_rank?: number | null
          three_pointers_percentage?: number | null
          three_pointers_percentage_rank?: number | null
          triple_doubles?: number | null
          triple_doubles_rank?: number | null
          turnovers?: number | null
          turnovers_rank?: number | null
          win_percentage?: number | null
          win_percentage_rank?: number | null
          wins?: number | null
          wins_rank?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "season_averages_player_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "season_averages_team_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "team"
            referencedColumns: ["id"]
          },
        ]
      }
      player_season_totals: {
        Row: {
          age: number | null
          ast: number | null
          blk: number | null
          created_at: string
          dd: number | null
          dreb: number | null
          fg_pct: number | null
          fg3_pct: number | null
          fg3a: number | null
          fg3m: number | null
          fga: number | null
          fgm: number | null
          fp: number | null
          ft_pct: number | null
          fta: number | null
          ftm: number | null
          gp: number | null
          l: number | null
          oreb: number | null
          pf: number | null
          player: string
          plus_minus: number | null
          pts: number | null
          reb: number | null
          season: string
          sec: number | null
          stl: number | null
          td: number | null
          tov: number | null
          w: number | null
        }
        Insert: {
          age?: number | null
          ast?: number | null
          blk?: number | null
          created_at?: string
          dd?: number | null
          dreb?: number | null
          fg_pct?: number | null
          fg3_pct?: number | null
          fg3a?: number | null
          fg3m?: number | null
          fga?: number | null
          fgm?: number | null
          fp?: number | null
          ft_pct?: number | null
          fta?: number | null
          ftm?: number | null
          gp?: number | null
          l?: number | null
          oreb?: number | null
          pf?: number | null
          player: string
          plus_minus?: number | null
          pts?: number | null
          reb?: number | null
          season: string
          sec?: number | null
          stl?: number | null
          td?: number | null
          tov?: number | null
          w?: number | null
        }
        Update: {
          age?: number | null
          ast?: number | null
          blk?: number | null
          created_at?: string
          dd?: number | null
          dreb?: number | null
          fg_pct?: number | null
          fg3_pct?: number | null
          fg3a?: number | null
          fg3m?: number | null
          fga?: number | null
          fgm?: number | null
          fp?: number | null
          ft_pct?: number | null
          fta?: number | null
          ftm?: number | null
          gp?: number | null
          l?: number | null
          oreb?: number | null
          pf?: number | null
          player?: string
          plus_minus?: number | null
          pts?: number | null
          reb?: number | null
          season?: string
          sec?: number | null
          stl?: number | null
          td?: number | null
          tov?: number | null
          w?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "player_season_totals_player_fkey"
            columns: ["player"]
            isOneToOne: false
            referencedRelation: "player"
            referencedColumns: ["id"]
          },
        ]
      }
      team: {
        Row: {
          city: string | null
          color_primary_hex: string | null
          color_secondary_hex: string | null
          conference: Database["public"]["Enums"]["conference"] | null
          created_at: string
          division: Database["public"]["Enums"]["division"] | null
          id: string
          name: string | null
          nba: boolean | null
          tricode: string | null
        }
        Insert: {
          city?: string | null
          color_primary_hex?: string | null
          color_secondary_hex?: string | null
          conference?: Database["public"]["Enums"]["conference"] | null
          created_at?: string
          division?: Database["public"]["Enums"]["division"] | null
          id: string
          name?: string | null
          nba?: boolean | null
          tricode?: string | null
        }
        Update: {
          city?: string | null
          color_primary_hex?: string | null
          color_secondary_hex?: string | null
          conference?: Database["public"]["Enums"]["conference"] | null
          created_at?: string
          division?: Database["public"]["Enums"]["division"] | null
          id?: string
          name?: string | null
          nba?: boolean | null
          tricode?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_games_for_week: {
        Args: {
          p_number: number
          p_provider: Database["public"]["Enums"]["fantasy_provider"]
        }
        Returns: {
          arena_city: string | null
          arena_name: string | null
          arena_state: string | null
          code: string | null
          created_at: string
          datetime: string | null
          id: string
          label: string | null
          live_clock: string | null
          live_period: number | null
          national_broadcaster: string | null
          status_code: number | null
          status_text: string | null
          sublabel: string | null
          team_away_id: string | null
          team_away_score: number | null
          team_home_id: string | null
          team_home_score: number | null
          week_nba: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "game"
          isOneToOne: false
          isSetofReturn: true
        }
      }
    }
    Enums: {
      conference: "East" | "West"
      division:
        | "Atlantic"
        | "Central"
        | "Southeast"
        | "Northwest"
        | "Pacific"
        | "Southwest"
      fantasy_provider: "yahoo" | "espn" | "sleeper"
      role: "G" | "F" | "C"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      conference: ["East", "West"],
      division: [
        "Atlantic",
        "Central",
        "Southeast",
        "Northwest",
        "Pacific",
        "Southwest",
      ],
      fantasy_provider: ["yahoo", "espn", "sleeper"],
      role: ["G", "F", "C"],
    },
  },
} as const
