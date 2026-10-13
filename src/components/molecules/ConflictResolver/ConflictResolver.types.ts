/**
 * ConflictResolver Types
 * Questions raised when uploaded documents disagree, and the answers that change the Context.
 */

export type QuestionKind = 'conflict' | 'discrepancy' | 'needs-review'

export type ContextFieldKey =
  | 'clientName'
  | 'description'
  | 'importanceValue'
  | 'businessOutcome'

export interface QuestionCandidate {
  id: string
  value: string
  /** Document the value was found in */
  source: string
}

export interface DocumentQuestion {
  id: string
  kind: QuestionKind
  fieldKey: ContextFieldKey
  fieldLabel: string
  /** conflict / discrepancy: the values found. needs-review: the single claim. */
  candidates: QuestionCandidate[]
}

export type QuestionAnswer =
  | { kind: 'pick'; candidateId: string }
  | { kind: 'custom'; value: string }
  | { kind: 'both' }
  | { kind: 'skip' }
  | { kind: 'accept' }
  | { kind: 'reject' }
  | { kind: 'edit'; value: string }

/** A change to apply to one Context field once a question is answered */
export interface ContextUpdate {
  field: ContextFieldKey
  mode: 'replace' | 'append'
  value: string
}

export interface ConflictResolverProps {
  isOpen: boolean
  questions: DocumentQuestion[]
  /** Names of the documents that were read, shown in the intro */
  fileNames: string[]
  /** Called with the Context changes when the user finishes (or closes after answering some) */
  onComplete: (updates: ContextUpdate[]) => void
  /** Called when the user dismisses without answering anything */
  onClose: () => void
}
