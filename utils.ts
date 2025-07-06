import { createDefine } from "fresh";
import { Session, User } from "@supabase/supabase-js";

export interface State {
  session?: {
    access_token: string;
    session?: Session;
    user?: User;

    refresh_token: string;
    expires_at: number;
  } | null;
  user?: {
    id: string;
    email: string;
  } | null;
}

export const define = createDefine<State>();
