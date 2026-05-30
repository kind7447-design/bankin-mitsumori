import { supabase } from './supabase';
import type { Quote, Material, ProcessItem } from '../types';

const KEYS = {
  materialMaster: 'bankin_material_master',
  processMaster:  'bankin_process_master',
};

// ===== Quotes (Supabase) =====

export async function saveQuote(quote: Quote): Promise<void> {
  await supabase.from('quotes').upsert({ id: quote.id, data: quote });
}

export async function loadQuotes(): Promise<Quote[]> {
  const { data, error } = await supabase
    .from('quotes')
    .select('data')
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return data.map(row => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const q = row.data as any;
    return {
      ...q,
      rows: q.rows ?? [],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      processes: q.processes.map((p: any) => ({ setupCost: 0, ...p } as ProcessItem)),
      spec: { ...q.spec, includeScrap: q.spec.includeScrap ?? false },
    } as Quote;
  });
}

export async function deleteQuote(id: string): Promise<void> {
  await supabase.from('quotes').delete().eq('id', id);
}

// ===== Creators (Supabase) =====

export async function loadCreators(): Promise<string[]> {
  const { data } = await supabase
    .from('creators')
    .select('name')
    .order('sort_order', { ascending: true });
  return data ? data.map(r => r.name as string) : [];
}

export async function saveCreators(names: string[]): Promise<void> {
  await supabase.from('creators').delete().neq('id', 0);
  if (names.length > 0) {
    await supabase.from('creators').insert(
      names.map((name, i) => ({ name, sort_order: i }))
    );
  }
}

// ===== Materials & Process Master (localStorage) =====

export function saveMaterials(materials: Material[]): void {
  localStorage.setItem(KEYS.materialMaster, JSON.stringify(materials));
}

export function loadMaterials(): Material[] | null {
  try {
    const raw = localStorage.getItem(KEYS.materialMaster);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function saveProcessMaster(processes: Omit<ProcessItem, 'id' | 'qty' | 'enabled'>[]): void {
  localStorage.setItem(KEYS.processMaster, JSON.stringify(processes));
}

export function loadProcessMaster(): Omit<ProcessItem, 'id' | 'qty' | 'enabled'>[] | null {
  try {
    const raw = localStorage.getItem(KEYS.processMaster);
    if (!raw) return null;
    const data = JSON.parse(raw) as Omit<ProcessItem, 'id' | 'qty' | 'enabled'>[];
    // migration: バリ取りを実周長（perimeter_raw）計算に移行
    const migrated = data.map(p =>
      p.name === 'バリ取り' && p.calcType !== 'perimeter_raw'
        ? { ...p, calcType: 'perimeter_raw' as const, unitPrice: 0.08, setupCost: 0, unit: 'mm' }
        : p
    );
    return migrated;
  } catch { return null; }
}
