import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import type { ShoppingItem } from '../lib/types';

export function useShoppingList() {
  const { profile } = useAuth();
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);

  const householdId = profile?.household_id;

  const fetchItems = useCallback(async () => {
    if (!householdId) return;
    const { data, error } = await supabase
      .from('shopping_list')
      .select('*')
      .eq('household_id', householdId)
      .order('checked', { ascending: true })
      .order('created_at', { ascending: false });

    if (!error && data) setItems(data as ShoppingItem[]);
    setLoading(false);
  }, [householdId]);

  useEffect(() => {
    fetchItems();

    if (!householdId) return;

    const channel = supabase
      .channel('shopping-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'shopping_list', filter: `household_id=eq.${householdId}` },
        () => { fetchItems(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [householdId, fetchItems]);

  const addItem = useCallback(async (name: string, quantity: number = 1, source: string = 'manual') => {
    if (!householdId || !profile) return;
    const { error } = await supabase.from('shopping_list').insert({
      household_id: householdId,
      name,
      quantity,
      source,
      added_by: profile.id,
    });
    if (error) throw error;
  }, [householdId, profile]);

  const toggleItem = useCallback(async (id: string, checked: boolean) => {
    const { error } = await supabase
      .from('shopping_list')
      .update({ checked })
      .eq('id', id);
    if (error) throw error;
  }, []);

  const deleteItem = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('shopping_list')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }, []);

  const clearChecked = useCallback(async () => {
    if (!householdId) return;
    const { error } = await supabase
      .from('shopping_list')
      .delete()
      .eq('household_id', householdId)
      .eq('checked', true);
    if (error) throw error;
  }, [householdId]);

  return { items, loading, addItem, toggleItem, deleteItem, clearChecked };
}
