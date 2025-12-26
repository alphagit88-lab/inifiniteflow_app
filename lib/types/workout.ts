// Workout Types - will be integrated with API later

export interface Exercise {
  id?: string
  name: string
  duration: string
  completed?: boolean
}

export interface WorkoutClass {
  id: string
  title: string
  subtitle: string
  exercises: Exercise[]
  image: string
  duration: string
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels'
  category?: string
}

export interface WorkoutDetail {
  id: string
  title: string
  description: string
  image: string
  videoUrl?: string
  duration: string
  level: string
  calories?: string
  instructor: {
    name: string
    avatar: string
  }
  instructions: string
  workoutList: Exercise[]
  equipment: string[]
  notes?: string
  comments: Comment[]
}

export interface Comment {
  id: string
  user: {
    name: string
    avatar: string
  }
  text: string
  date: string
  likes: number
}

// Mock data for development - will be replaced with API calls

export const mockClasses: WorkoutClass[] = [
  {
    id: '1',
    title: 'Heal Your Body',
    subtitle: 'Breathwork Class',
    exercises: [
      { name: 'Exercise Name', duration: '5 min' },
      { name: 'Exercise Name', duration: '8 min' },
    ],
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80',
    duration: '0:41',
    level: 'Beginner',
  },
  {
    id: '2',
    title: 'Breathwork Class',
    subtitle: 'Morning Flow',
    exercises: [
      { name: 'Breath exercise', duration: '10 min' },
      { name: 'Guided meditation', duration: '5 min' },
    ],
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80',
    duration: '0:41',
    level: 'All Levels',
  },
  {
    id: '3',
    title: 'Pilates Body Class',
    subtitle: 'Core Strength',
    exercises: [
      { name: 'Exercise Name', duration: '5 min' },
      { name: 'Exercise Name', duration: '8 min' },
    ],
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80',
    duration: '0:41',
    level: 'Intermediate',
  },
  {
    id: '4',
    title: 'Controlled Movement',
    subtitle: 'Balance & Flexibility',
    exercises: [
      { name: 'Exercise Name', duration: '5 min' },
      { name: 'Exercise Name', duration: '8 min' },
    ],
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80',
    duration: '0:41',
    level: 'Advanced',
  },
]

export const mockWorkoutDetail: WorkoutDetail = {
  id: '1',
  title: 'Ab Burner Workout',
  description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent eu euismod lorem, non facilisis elit. Praesent eu euismod. Praesent eu euismod. Praesent eu euismod lorem, non facilisis elit.',
  image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80',
  videoUrl: 'https://example.com/video.mp4',
  duration: '30 min',
  level: 'Intermediate',
  calories: '250',
  instructor: {
    name: 'Clara Martinez',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
  },
  instructions: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent eu euismod lorem, non facilisis elit. Praesent eu euismod. 

Nulla porta accumsan quam. Praesent eu euismod lorem, non facilisis elit. Praesent eu euismod.

adipiscing elit. Praesent eu euismod lorem. Nulla non rutrum eros. Maecenas a pretium neque. Morbi vehicula porta convallis. Ut amet tellus eros. Lorem ipsum dolor sit amet, adipiscing elit. Praesent eu euismod lorem. Class non rutrum elementum dui.`,
  workoutList: [
    { name: 'Exercise 1 - Ab Burner', duration: '5 min', completed: true },
    { name: 'Exercise 1 - Ab Burner', duration: '5 min', completed: false },
    { name: 'Exercise 1 - Ab Burner', duration: '5 min', completed: false },
    { name: 'Exercise 1 - Ab Burner', duration: '5 min', completed: false },
    { name: 'Exercise 1 - Ab Burner', duration: '5 min', completed: false },
  ],
  equipment: [
    'Yoga Mat',
    'Resistance bands',
    'Foam Roller',
  ],
  notes: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent eu euismod lorem, non facilisis elit. Neque a porta. Nulla non rutrum eros. Maecenas a pretium neque. Ut amet tellus eros.',
  comments: [
    {
      id: '1',
      user: {
        name: 'Nana Paul',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80',
      },
      text: 'This workout was amazing!',
      date: 'now',
      likes: 0,
    },
    {
      id: '2', 
      user: {
        name: 'Jessica Jodan',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80',
      },
      text: '',
      date: '2d ago',
      likes: 1,
    },
  ],
}
