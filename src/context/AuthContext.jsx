import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Build a profile from user_metadata (instant, no DB call needed for admin check)
  const buildProfileFromMeta = (currentUser) => {
    const meta = currentUser?.user_metadata;
    if (meta) {
      return {
        id: currentUser.id,
        full_name: meta.full_name || null,
        phone: meta.phone || null,
        user_role: meta.user_role || 'customer',
      };
    }
    return null;
  };

  const fetchProfile = async (userId, currentUser) => {
    // Set profile from metadata immediately so admin access works instantly
    const metaProfile = buildProfileFromMeta(currentUser);
    if (metaProfile) {
      setProfile(metaProfile);
    }

    // Then try to get the full profile from the DB (non-blocking enhancement)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (!error && data) {
        setProfile(data);
      }
    } catch (err) {
      // Metadata fallback is already set, so this is fine
      console.warn('Could not fetch DB profile, using metadata fallback:', err.message);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Safety timeout — if onAuthStateChange never fires, stop loading
    const fallbackTimer = setTimeout(() => {
      if (mounted && loading) {
        console.warn('Auth: onAuthStateChange did not fire within 10s, assuming no session');
        setLoading(false);
      }
    }, 10000);

    // Use ONLY onAuthStateChange — do NOT also call getSession().
    // Supabase v2 fires an INITIAL_SESSION event automatically.
    // Calling both causes a navigator lock deadlock in the browser.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('Auth event:', event);

        if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          setLoading(false);
          clearTimeout(fallbackTimer);
          return;
        }

        if (event === 'TOKEN_REFRESHED' && !session) {
          // Token refresh failed
          setUser(null);
          setProfile(null);
          setLoading(false);
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

        if (mounted) {
          setLoading(false);
          clearTimeout(fallbackTimer);
        }
      }
    );

    return () => {
      mounted = false;
      clearTimeout(fallbackTimer);
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
    setUser(null);
    setProfile(null);

    try {
      await supabase.auth.signOut({ scope: 'local' });
    } catch (err) {
      console.error('Logout error:', err);
    }
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

