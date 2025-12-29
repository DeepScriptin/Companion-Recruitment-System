
import { Companion, User, UserRole, UserCompanion, CompanionAssignment } from '../types';
import { supabase } from './supabaseClient';

class MockApiService {
  private currentUser: User | null = null;

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

    let companions = data as Companion[];

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
    return data as Companion;
  }

  async createCompanion(data: Partial<Companion>) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const { data: newComp, error } = await supabase
      .from('companions')
      .insert([{
        ...data,
        is_deleted: false,
        is_active: true,
        stats: { rating: 0, current_subscribers: 0, total_subscribers_ever: 0 }
      }])
      .select()
      .single();

    if (error) throw error;
    return newComp;
  }

  async updateCompanion(id: string, data: Partial<Companion>) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('companions')
      .update({ ...data, updated_at: new Date().toISOString() })
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

    // Deduct points locally and in DB
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
    return data || [];
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
      email: '', // Supabase profiles usually don't have email unless joined with auth.users
      role: p.role as UserRole,
      learningPoints: p.learning_points
    }));
  }
}

export const mockApi = new MockApiService();
