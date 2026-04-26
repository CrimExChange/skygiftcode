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
    from: (table: string) => {
      const getTableData = () => getStorage(table);
      
      const queryBuilder = (currentData: any[]): any => ({
        eq: (col: string, val: any) => queryBuilder(currentData.filter(r => r[col] === val)),
        in: (col: string, vals: any[]) => queryBuilder(currentData.filter(r => vals.includes(r[col]))),
        order: (col: string, { ascending = true } = {}) => {
          const sorted = [...currentData].sort((a, b) => (a[col] > b[col] ? 1 : -1) * (ascending ? 1 : -1));
          return queryBuilder(sorted);
        },
        limit: (n: number) => queryBuilder(currentData.slice(0, n)),
        select: (query?: string) => queryBuilder(currentData),
        single: () => Promise.resolve({ data: currentData[0], error: null }),
        then: (onfulfilled: any) => Promise.resolve({ data: currentData, error: null }).then(onfulfilled)
      });

      return {
        select: (query: string = '*') => {
          let data = getTableData();
          if (table === 'orders' && query.includes('coupons')) {
            const coupons = getStorage('coupons');
            data = data.map((o: any) => ({ ...o, coupons: coupons.find((c: any) => c.id === o.coupon_id) }));
          }
          return queryBuilder(data);
        },
        insert: (input: any) => {
          const rows = getTableData();
          const dataToInsert = Array.isArray(input) ? input : [input];
          const newRows = dataToInsert.map(row => ({
            id: Math.random().toString(36).substring(7),
            created_at: new Date().toISOString(),
            ...row
          }));
          setStorage(table, [...newRows, ...rows]);
          return queryBuilder(newRows);
        },
        update: (row: any) => ({
          eq: (col: string, val: any) => {
            const rows = getTableData();
            const updated = rows.map((r: any) => r[col] === val ? { ...r, ...row } : r);
            setStorage(table, updated);
            return Promise.resolve({ data: updated, error: null });
          }
        }),
        delete: () => ({
          eq: (col: string, val: any) => {
            const rows = getTableData();
            setStorage(table, rows.filter((r: any) => r[col] !== val));
            return Promise.resolve({ error: null });
          }
        })
      };
    },
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
