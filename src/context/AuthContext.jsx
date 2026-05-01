import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

// Helper: clear all Supabase auth data from localStorage
function clearSupabaseSession() {
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('supabase') || key.includes('sb-'))) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
  console.log('Cleared corrupted Supabase session from localStorage');
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId, currentUser) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) throw error;
      setProfile(data);
    } catch (err) {
      console.error('Error fetching profile:', err);
      // Fallback: build profile from user_metadata so admin panel still works
      const meta = currentUser?.user_metadata;
      if (meta) {
        setProfile({
          id: userId,
          full_name: meta.full_name || null,
          phone: meta.phone || null,
          user_role: meta.user_role || 'customer',
        });
      } else {
        setProfile(null);
      }
    }
  };

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      // Safety timeout to prevent infinite loading
      const fallbackTimer = setTimeout(() => {
        if (mounted) {
          console.warn('Auth initialization timed out, clearing stale session');
          clearSupabaseSession();
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      }, 4000);

      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (!mounted) return;

        // If getSession itself returned an error, clear the bad session
        if (error) {
          console.error('Session error, clearing:', error.message);
          clearSupabaseSession();
          setUser(null);
          setProfile(null);
          if (mounted) setLoading(false);
          clearTimeout(fallbackTimer);
          return;
        }

        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id, session.user);
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (err) {
        console.error('Error during auth initialization:', err);
        // On any error, clear potentially corrupted session
        clearSupabaseSession();
        setUser(null);
        setProfile(null);
      } finally {
        clearTimeout(fallbackTimer);
        if (mounted) setLoading(false);
      }
    }

    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        // Handle token refresh failures — clear corrupted session
        if (event === 'TOKEN_REFRESHED' && !session) {
          console.warn('Token refresh failed, clearing session');
          clearSupabaseSession();
          setUser(null);
          setProfile(null);
          if (mounted) setLoading(false);
          return;
        }

        if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          if (mounted) setLoading(false);
          return;
        }

        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id, session.user);
        } else {
          setUser(null);
          setProfile(null);
        }
        
        if (mounted) setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  const register = async (email, password, fullName, phone) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, phone },
      },
    });
    if (error) throw error;
    return data;
  };

  const logout = async () => {
    // Clear state locally immediately so the UI updates
    setUser(null);
    setProfile(null);

    // Clear any stored session data
    clearSupabaseSession();

    // Call signOut but don't await — prevents hanging
    supabase.auth.signOut({ scope: 'local' }).catch(err => {
      console.error('AuthContext: signOut error', err);
    });
  };

  const isAdmin = profile?.user_role === 'admin' || user?.user_metadata?.user_role === 'admin';

  const value = {
    user,
    profile,
    loading,
    login,
    register,
    logout,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
