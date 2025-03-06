import { supabase } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { User } from "@/types/users";
export function useUsers(id: number) {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.from("users").select("*").eq("id", id).single();
      setUser(data as User);
    };
    fetchUser();
  }, [id]);
  return user;
}
