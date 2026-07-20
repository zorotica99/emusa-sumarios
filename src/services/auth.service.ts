import { supabase } from "../lib/supabase";

export async function iniciarSessao(
  email: string,
  password: string,
) {
  const { data, error } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function terminarSessao() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
}

export async function obterSessao() {
  const { data } = await supabase.auth.getSession();

  return data.session;
}