import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { supabase } from '../lib/supabase';
import type { Profile } from '../lib/types';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string, inviteCode?: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuthProvider(): AuthContextValue {
  const [state, setState] = useState<AuthState>({ user: null, profile: null, loading: true });

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    return data as Profile | null;
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        setState({ user: session.user, profile, loading: false });
      } else {
        setState({ user: null, profile: null, loading: false });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          setState({ user: session.user, profile, loading: false });
        } else {
          setState({ user: null, profile: null, loading: false });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const register = useCallback(async (
    email: string,
    password: string,
    displayName: string,
    inviteCode?: string
  ) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
    if (authError) throw authError;
    if (!authData.user) throw new Error('Registration failed');

    let householdId: string;

    if (inviteCode) {
      const { data: household, error: hError } = await supabase
        .from('households')
        .select('id')
        .eq('invite_code', inviteCode.toLowerCase().trim())
        .single();
      if (hError || !household) throw new Error('Nieprawidłowy kod zaproszenia');
      householdId = household.id;
    } else {
      const { data: household, error: hError } = await supabase
        .from('households')
        .insert({ name: `Dom ${displayName}` })
        .select('id')
        .single();
      if (hError || !household) throw new Error('Nie udało się utworzyć gospodarstwa');
      householdId = household.id;
    }

    const { error: pError } = await supabase.from('profiles').insert({
      id: authData.user.id,
      household_id: householdId,
      email,
      display_name: displayName,
    });
    if (pError) throw pError;
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return { ...state, login, register, logout };
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthContext');
  return ctx;
}
