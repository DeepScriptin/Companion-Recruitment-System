
export const CATEGORIES = ['English', 'Maths', 'Chinese', 'Science', 'History', 'Other'];

export const COLOR_CLASSES = [
  { name: 'Blue', value: 'av-blue' },
  { name: 'Orange', value: 'av-orange' },
  { name: 'Red', value: 'av-red' },
  { name: 'Green', value: 'av-green' },
  { name: 'Purple', value: 'av-purple' },
  { name: 'Pink', value: 'av-pink' }
];

export const EMOJI_OPTIONS = ['🤖', '🦊', '🦁', '🐙', '🐼', '🦄', '🦉', '🐳', '🐯', '🐢', '🐬'];

export const INITIAL_COMPANIONS = [
  {
    id: '1',
    name: 'Sophie',
    roleDescription: 'English Tutor',
    category: 'English',
    avatarEmoji: '🦊',
    colorClass: 'av-orange',
    costPoints: 500,
    description: 'Expert in creative writing and vocabulary building.',
    quote: 'Words are windows to new worlds!',
    isActive: true,
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    stats: { rating: 4.8, currentSubscribers: 12, totalSubscribersEver: 45 }
  },
  {
    id: '2',
    name: 'David',
    roleDescription: 'Math Wizard',
    category: 'Maths',
    avatarEmoji: '🦉',
    colorClass: 'av-blue',
    costPoints: 750,
    description: 'Specializing in algebra and geometry visualization.',
    quote: 'Numbers never lie, they tell stories.',
    isActive: true,
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    stats: { rating: 4.9, currentSubscribers: 8, totalSubscribersEver: 30 }
  }
];
