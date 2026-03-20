import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

export const AuthDebugger: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      setDebugInfo({
        hasSession: !!session,
        user: session?.user?.email || 'None',
        error: error?.message || 'None',
        url: window.location.href,
      });
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setDebugInfo(prev => ({
        ...prev,
        lastEvent: event,
        hasSession: !!session,
        user: session?.user?.email || 'None',
      }));
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!isVisible) {
    return (
      <button 
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-50 hover:opacity-100 z-50 shadow-lg"
      >
        Debug Auth
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-green-400 p-4 rounded-lg text-xs font-mono z-50 max-w-xs break-words shadow-2xl border border-green-800/50">
      <div className="flex justify-between items-center mb-2 border-b border-green-800 pb-2">
        <span className="font-bold text-green-300">Auth Debugger (Mobile)</span>
        <button onClick={() => setIsVisible(false)} className="text-red-400 hover:text-red-300 font-bold">X</button>
      </div>
      <pre className="whitespace-pre-wrap overflow-auto max-h-64">
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
    </div>
  );
};
