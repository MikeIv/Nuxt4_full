export interface NotesAccessStatusResponse {
  configured: boolean
  unlocked: boolean
}

export interface NotesAccessSetupBody {
  password: string
  confirmPassword: string
}

export interface NotesAccessUnlockBody {
  password: string
}

export interface NotesAccessActionResponse {
  ok: true
  unlocked: true
}
