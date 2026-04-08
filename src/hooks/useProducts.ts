import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import type { Product } from '../lib/types';

export function useProducts() {
  const { profile } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const householdId = profile?.household_id;

  const fetchProducts = useCallback(async () => {
    if (!householdId) return;
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('household_id', householdId)
      .eq('status', 'active')
      .order('expiry_date', { ascending: true });

    if (!error && data) setProducts(data as Product[]);
    setLoading(false);
  }, [householdId]);

  useEffect(() => {
    fetchProducts();

    if (!householdId) return;

    const channel = supabase
      .channel('products-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products', filter: `household_id=eq.${householdId}` },
        () => { fetchProducts(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [householdId, fetchProducts]);

  const addProduct = useCallback(async (product: Omit<Product, 'id' | 'household_id' | 'created_at' | 'updated_at'>) => {
    if (!householdId) return;
    const { error } = await supabase
      .from('products')
      .insert({ ...product, household_id: householdId });
    if (error) throw error;
  }, [householdId]);

  const updateProduct = useCallback(async (id: string, updates: Partial<Product>) => {
    const { error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id);
    if (error) throw error;
  }, []);

  return { products, loading, addProduct, updateProduct, refetch: fetchProducts };
}
