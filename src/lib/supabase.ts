import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Mock Supabase for Testing
const createMockClient = () => {
  console.warn("Using MOCK Supabase Client - Data will persist in LocalStorage");
  
  const getStorage = (key: string) => JSON.parse(localStorage.getItem(key) || '[]');
  const setStorage = (key: string, data: any) => localStorage.setItem(key, JSON.stringify(data));

  if (typeof window !== 'undefined' && !localStorage.getItem('coupons')) {
    setStorage('coupons', [
      { id: '1', code: 'GRAB-300-TEST', value: 300, status: 'available' },
      { id: '2', code: 'GRAB-500-TEST', value: 500, status: 'available' },
      { id: '3', code: 'GRAB-1000-TEST', value: 1000, status: 'available' },
    ]);
  }

  return {
    from: (table: string) => ({
      select: (query: string) => ({
        eq: (col: string, val: any) => ({
          order: (col: string, opt: any) => Promise.resolve({ data: getStorage(table).filter((r: any) => r[col] === val) }),
          single: () => Promise.resolve({ data: getStorage(table).filter((r: any) => r[col] === val)[0] }),
          limit: (n: number) => Promise.resolve({ data: getStorage(table).filter((r: any) => r[col] === val).slice(0, n) }),
          Promise: () => Promise.resolve({ data: getStorage(table).filter((r: any) => r[col] === val) }),
        }),
        order: (col: string, opt: any) => Promise.resolve({ data: [...getStorage(table)].sort((a,b) => b.created_at > a.created_at ? 1 : -1) }),
        single: () => Promise.resolve({ data: getStorage(table)[0] }),
        Promise: () => Promise.resolve({ data: getStorage(table) }),
        then: (cb: any) => Promise.resolve({ data: getStorage(table) }).then(cb),
      }),
      insert: (row: any) => {
        const rows = getStorage(table);
        const newRow = { id: Math.random().toString(), created_at: new Date().toISOString(), ...row };
        setStorage(table, [newRow, ...rows]);
        return { 
          select: () => ({ 
            single: () => Promise.resolve({ data: newRow }) 
          }) 
        };
      },
      update: (row: any) => ({
        eq: (col: string, val: any) => {
          const rows = getStorage(table);
          const updated = rows.map((r: any) => r[col] === val ? { ...r, ...row } : r);
          setStorage(table, updated);
          return Promise.resolve({ data: updated });
        }
      }),
      delete: () => ({
        eq: (col: string, val: any) => {
          const rows = getStorage(table);
          setStorage(table, rows.filter((r: any) => r[col] !== val));
          return Promise.resolve({ error: null });
        }
      })
    }),
    storage: {
      from: (bucket: string) => ({
        upload: (path: string, file: File) => Promise.resolve({ data: { path }, error: null }),
        getPublicUrl: (path: string) => ({ data: { publicUrl: 'https://placehold.co/600x400/00b14f/white?text=Mock+Payment+Slip' } })
      })
    },
    channel: () => ({
      on: () => ({
        subscribe: () => ({})
      })
    }),
    removeChannel: () => {}
  } as any;
};

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createMockClient();
