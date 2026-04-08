import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import type { ShoppingTemplate } from '../lib/types';

export function useTemplates() {
  const { profile } = useAuth();
  const [templates, setTemplates] = useState<ShoppingTemplate[]>([]);

  const householdId = profile?.household_id;

  const fetchTemplates = useCallback(async () => {
    if (!householdId) return;
    const { data } = await supabase
      .from('shopping_templates')
      .select('*')
      .eq('household_id', householdId)
      .order('name');
    if (data) setTemplates(data as ShoppingTemplate[]);
  }, [householdId]);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  const createTemplate = useCallback(async (name: string, items: ShoppingTemplate['items']) => {
    if (!householdId) return;
    const { error } = await supabase.from('shopping_templates').insert({
      household_id: householdId,
      name,
      items,
    });
    if (error) throw error;
    await fetchTemplates();
  }, [householdId, fetchTemplates]);

  const deleteTemplate = useCallback(async (id: string) => {
    const { error } = await supabase.from('shopping_templates').delete().eq('id', id);
    if (error) throw error;
    await fetchTemplates();
  }, [fetchTemplates]);

  return { templates, createTemplate, deleteTemplate };
}
