"use client";

import { createClientSupabase } from "../lib/supabase";
import { useMemo } from "react";

export function useSupabase() {
  return useMemo(() => createClientSupabase(), []);
}
