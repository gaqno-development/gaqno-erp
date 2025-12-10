export type CharacterRole = 'protagonist' | 'antagonist' | 'supporting' | 'minor'

export interface ICharacterTraits {
  physical: string[]
  psychological: string[]
  social: string[]
}

export interface ICharacterRelationship {
  characterId: string
  characterName?: string
  relationshipType: string
  description: string
}

export interface ICharacterCurrentState {
  chapterNumber: number
  emotionalState: string
  location: string
  objectives: string[]
}

export interface ICharacterDetails {
  backstory: string
  traits: ICharacterTraits
  relationships: ICharacterRelationship[]
  avatarPrompt: string
  role: CharacterRole
  currentState?: ICharacterCurrentState
}

export interface ICharacterAnalysis {
  characterId: string
  characterName: string
  currentState: string
  development: string
  relationships: string
  motivations: string[]
  relevance: 'high' | 'medium' | 'low'
}

