
import { Companion, User, UserRole } from '../types';
import { supabase } from './supabaseClient';

class MockApiService {
  private currentUser: User | null = null;

  // Helper to map DB companion to Frontend interface
  private mapCompanion(c: any): Companion {
    return {
      id: c.id,
      name: c.name,
      roleDescription: c.role_description,
      category: c.category,
      avatarEmoji: c.avatar_emoji,
      colorClass: c.color_class,
      costPoints: c.cost_points,
      description: c.description,
      quote: c.quote,
      difyPromptLink: c.dify_prompt_link,
      difyApiKey: c.dify_api_key,
      remarks: c.remarks,
      isActive: c.is_active,
      isDeleted: c.is_deleted,
      createdAt: c.created_at,
      updatedAt: c.updated_at,
      stats: {
        rating: c.stats?.rating || 0,
        currentSubscribers: c.stats?.current_subscribers || 0,
        totalSubscribersEver: c.stats?.total_subscribers_ever || 0
      }
    };
  }

  async login(email: string, password: string): Promise<User> {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) throw new Error(authError.message);

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) throw new Error(profileError.message);

    this.currentUser = {
      id: profile.id,
      username: profile.username,
      email: authData.user.email!,
      role: profile.role as UserRole,
      learningPoints: profile.learning_points,
    };

    return this.currentUser;
  }

  async logout() {
    await supabase.auth.signOut();
    this.currentUser = null;
  }

  async getCurrentUser(): Promise<User | null> {
    if (this.currentUser) return this.currentUser;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (profile) {
      this.currentUser = {
        id: profile.id,
        username: profile.username,
        email: session.user.email!,
        role: profile.role as UserRole,
        learningPoints: profile.learning_points,
      };
    }

    return this.currentUser;
  }

  async getCompanions(includeDeleted = false): Promise<Companion[]> {
    const user = await this.getCurrentUser();
    if (!user) return [];

    let query = supabase.from('companions').select('*');
    
    if (!includeDeleted) {
      query = query.eq('is_deleted', false);
    }

    const { data, error } = await query;
    if (error) throw error;

    let companions = (data || []).map(this.mapCompanion);

    // RBAC filter for Creator
    if (user.role === UserRole.CREATOR) {
      const { data: assignments } = await supabase
        .from('companion_assignments')
        .select('companion_id')
        .eq('creator_id', user.id);
      
      const assignedIds = assignments?.map(a => a.companion_id) || [];
      companions = companions.filter(c => assignedIds.includes(c.id));
    }

    return companions;
  }

  async getCompanion(id: string): Promise<Companion | null> {
    const { data, error } = await supabase
      .from('companions')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return null;
    return this.mapCompanion(data);
  }

  async createCompanion(data: Partial<Companion>) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const dbData = {
      name: data.name,
      role_description: data.roleDescription,
      category: data.category,
      avatar_emoji: data.avatarEmoji,
      color_class: data.colorClass,
      cost_points: data.costPoints,
      description: data.description,
      quote: data.quote,
      dify_prompt_link: data.difyPromptLink,
      dify_api_key: data.difyApiKey,
      remarks: data.remarks,
      is_deleted: false,
      is_active: data.isActive ?? true,
      stats: { rating: 0, current_subscribers: 0, total_subscribers_ever: 0 }
    };

    const { data: newComp, error } = await supabase
      .from('companions')
      .insert([dbData])
      .select()
      .single();

    if (error) throw error;
    return this.mapCompanion(newComp);
  }

  async updateCompanion(id: string, data: Partial<Companion>) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const dbData: any = { updated_at: new Date().toISOString() };
    if (data.name !== undefined) dbData.name = data.name;
    if (data.roleDescription !== undefined) dbData.role_description = data.roleDescription;
    if (data.category !== undefined) dbData.category = data.category;
    if (data.avatarEmoji !== undefined) dbData.avatar_emoji = data.avatarEmoji;
    if (data.colorClass !== undefined) dbData.color_class = data.colorClass;
    if (data.costPoints !== undefined) dbData.cost_points = data.costPoints;
    if (data.description !== undefined) dbData.description = data.description;
    if (data.quote !== undefined) dbData.quote = data.quote;
    if (data.difyPromptLink !== undefined) dbData.dify_prompt_link = data.difyPromptLink;
    if (data.difyApiKey !== undefined) dbData.dify_api_key = data.difyApiKey;
    if (data.remarks !== undefined) dbData.remarks = data.remarks;
    if (data.isActive !== undefined) dbData.is_active = data.isActive;

    const { error } = await supabase
      .from('companions')
      .update(dbData)
      .eq('id', id);

    if (error) throw error;
  }

  async deleteCompanion(id: string) {
    const user = await this.getCurrentUser();
    if (user?.role !== UserRole.SUPER_ADMIN) throw new Error('Only Super Admin can delete');
    
    const { data: subs } = await supabase
      .from('user_companions')
      .select('id')
      .eq('companion_id', id)
      .eq('is_active', true);

    if (subs && subs.length > 0) {
      return { success: false, warning: `Cannot delete: ${subs.length} active subscriber(s).` };
    }

    const { error } = await supabase
      .from('companions')
      .update({ is_deleted: true, is_active: false })
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  }

  async recruitCompanion(companionId: string) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const companion = await this.getCompanion(companionId);
    if (!companion) throw new Error('Not found');
    if (user.learningPoints < companion.costPoints) throw new Error('Insufficient points');

    const newPoints = user.learningPoints - companion.costPoints;
    await supabase.from('profiles').update({ learning_points: newPoints }).eq('id', user.id);
    user.learningPoints = newPoints;

    const { error } = await supabase
      .from('user_companions')
      .upsert({
        user_id: user.id,
        companion_id: companionId,
        is_active: true,
        recruited_at: new Date().toISOString()
      }, { onConflict: 'user_id,companion_id' });

    if (error) throw error;
    
    return { success: true, pointsLeft: user.learningPoints };
  }

  async getMySubscriptions(): Promise<any[]> {
    const user = await this.getCurrentUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('user_companions')
      .select(`
        *,
        companion:companions (*)
      `)
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (error) throw error;
    return (data || []).map(s => ({
      ...s,
      companion: this.mapCompanion(s.companion)
    }));
  }

  async getUsersByRole(role: UserRole): Promise<User[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', role);

    if (error) throw error;
    return (data || []).map(p => ({
      id: p.id,
      username: p.username,
      email: '', 
      role: p.role as UserRole,
      learningPoints: p.learning_points
    }));
  }
}

export const mockApi = new MockApiService();
