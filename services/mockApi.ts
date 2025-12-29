
import { Companion, User, UserRole, UserCompanion, CompanionAssignment } from '../types';
import { INITIAL_COMPANIONS } from '../constants';

class MockApiService {
  private companions: Companion[] = [...INITIAL_COMPANIONS];
  private users: User[] = [
    { id: 'u1', username: 'Super User', email: 'super@system.com', role: UserRole.SUPER_ADMIN, learningPoints: 5000 },
    { id: 'u2', username: 'Admin Alex', email: 'admin@system.com', role: UserRole.ADMIN, learningPoints: 1000 },
    { id: 'u3', username: 'Creator Chris', email: 'chris@creator.com', role: UserRole.CREATOR, learningPoints: 1000 },
    { id: 'u4', username: 'Student Sam', email: 'sam@student.com', role: UserRole.STUDENT, learningPoints: 2000 }
  ];
  private assignments: CompanionAssignment[] = [
    { id: 'a1', companionId: '1', creatorId: 'u3', assignedBy: 'u1', assignedAt: new Date().toISOString() }
  ];
  private subscriptions: UserCompanion[] = [];
  
  private currentUserId: string | null = localStorage.getItem('companion_session');

  login(email: string, password: string): User {
    const user = this.users.find(u => u.email === email);
    if (!user) throw new Error('User not found');
    // In a real app, password would be hashed. For demo, we accept any pass if email is correct or hardcoded ones.
    if (password === 'admin123' || password === 'creator123' || password === 'student123') {
      this.currentUserId = user.id;
      localStorage.setItem('companion_session', user.id);
      return user;
    }
    throw new Error('Invalid credentials');
  }

  logout() {
    this.currentUserId = null;
    localStorage.removeItem('companion_session');
  }

  getCurrentUser(): User | null {
    if (!this.currentUserId) return null;
    return this.users.find(u => u.id === this.currentUserId) || null;
  }

  getUsersByRole(role?: UserRole) {
    return role ? this.users.filter(u => u.role === role) : this.users;
  }

  // Companions
  getCompanions(includeDeleted = false) {
    const user = this.getCurrentUser();
    if (!user) return [];

    let filtered = includeDeleted ? this.companions : this.companions.filter(c => !c.isDeleted);
    
    // RBAC logic for listing
    if (user.role === UserRole.CREATOR) {
      const assignedIds = this.assignments
        .filter(a => a.creatorId === user.id)
        .map(a => a.companionId);
      return filtered.filter(c => assignedIds.includes(c.id));
    }
    
    return filtered;
  }

  getCompanion(id: string) {
    return this.companions.find(c => c.id === id);
  }

  createCompanion(data: Partial<Companion>) {
    const user = this.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const newComp: Companion = {
      ...data as any,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stats: { rating: 0, currentSubscribers: 0, totalSubscribersEver: 0 },
      isDeleted: false,
      isActive: true
    };
    this.companions.push(newComp);
    return newComp;
  }

  updateCompanion(id: string, data: Partial<Companion>) {
    const user = this.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const index = this.companions.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Companion not found');
    
    // Authorization check
    if (user.role === UserRole.CREATOR) {
      const isAssigned = this.assignments.some(a => a.companionId === id && a.creatorId === user.id);
      if (!isAssigned) throw new Error('Access denied');
    }

    this.companions[index] = { ...this.companions[index], ...data, updatedAt: new Date().toISOString() };
    return this.companions[index];
  }

  deleteCompanion(id: string) {
    const user = this.getCurrentUser();
    if (user?.role !== UserRole.SUPER_ADMIN) throw new Error('Only Super Admin can delete');
    
    const index = this.companions.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Companion not found');
    
    const activeSubscribers = this.subscriptions.filter(s => s.companionId === id && s.isActive).length;
    if (activeSubscribers > 0) {
      return { success: false, warning: `Cannot delete: ${activeSubscribers} active subscriber(s).` };
    }

    this.companions[index].isDeleted = true;
    return { success: true };
  }

  // Assignments
  getAssignments() {
    return this.assignments;
  }

  assignCompanion(companionId: string, creatorId: string) {
    const user = this.getCurrentUser();
    if (user?.role !== UserRole.SUPER_ADMIN && user?.role !== UserRole.ADMIN) {
      throw new Error('Access denied');
    }
    const exists = this.assignments.find(a => a.companionId === companionId && a.creatorId === creatorId);
    if (exists) return exists;

    const newAssignment: CompanionAssignment = {
      id: Math.random().toString(36).substr(2, 9),
      companionId,
      creatorId,
      assignedBy: user.id,
      assignedAt: new Date().toISOString()
    };
    this.assignments.push(newAssignment);
    return newAssignment;
  }

  // Subscriptions
  recruitCompanion(companionId: string) {
    const user = this.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const companion = this.companions.find(c => c.id === companionId);
    if (!companion) throw new Error('Not found');
    if (user.learningPoints < companion.costPoints) throw new Error('Insufficient points');
    
    const existing = this.subscriptions.find(s => s.companionId === companionId && s.userId === user.id);
    if (existing?.isActive) throw new Error('Already recruited');

    user.learningPoints -= companion.costPoints;
    
    if (existing) {
      existing.isActive = true;
    } else {
      this.subscriptions.push({
        id: Math.random().toString(36).substr(2, 9),
        userId: user.id,
        companionId,
        recruitedAt: new Date().toISOString(),
        isActive: true,
        totalMessages: 0
      });
    }

    // Update stats
    companion.stats.currentSubscribers++;
    companion.stats.totalSubscribersEver++;
    
    return { success: true, pointsLeft: user.learningPoints };
  }

  unsubscribe(companionId: string) {
    const user = this.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const sub = this.subscriptions.find(s => s.companionId === companionId && s.userId === user.id && s.isActive);
    if (!sub) throw new Error('No active subscription found');
    
    sub.isActive = false;
    const companion = this.companions.find(c => c.id === companionId);
    if (companion) companion.stats.currentSubscribers--;
    
    return { success: true };
  }

  getMySubscriptions() {
    const user = this.getCurrentUser();
    if (!user) return [];

    return this.subscriptions
      .filter(s => s.userId === user.id && s.isActive)
      .map(s => {
        const comp = this.companions.find(c => c.id === s.companionId);
        return { ...s, companion: comp };
      });
  }
}

export const mockApi = new MockApiService();
