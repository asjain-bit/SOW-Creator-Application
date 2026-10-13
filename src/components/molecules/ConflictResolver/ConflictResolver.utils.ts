/**
 * ConflictResolver utilities — build the questions for a set of documents and
 * turn the answers into Context changes. (Mock extraction: values are synthetic.)
 */

import type {
  ContextFieldKey,
  ContextUpdate,
  DocumentQuestion,
  QuestionAnswer,
} from './ConflictResolver.types'

const baseName = (fileName: string) =>
  fileName
    .replace(/\.[^.]+$/, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\b(rfp|msa|sow|draft|spec|specs|requirements|template|annex|final)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim()

/**
 * Build the questions raised when two or more documents are read together.
 * Returns an empty list when there is nothing to compare.
 */
export function buildDocumentQuestions(
  fileNames: string[],
  current: Partial<Record<ContextFieldKey, string>> = {}
): DocumentQuestion[] {
  if (fileNames.length < 2) return []
  const [a, b] = fileNames
  const c = fileNames[2] ?? fileNames[0]
  const client = current.clientName?.trim() || `${baseName(a) || 'Synthetic'} Health Group`

  return [
    {
      id: 'q-client',
      kind: 'conflict',
      fieldKey: 'clientName',
      fieldLabel: 'Client Name',
      candidates: [
        { id: 'a', value: client, source: a },
        { id: 'b', value: `${client} LLC`, source: b },
      ],
    },
    {
      id: 'q-description',
      kind: 'discrepancy',
      fieldKey: 'description',
      fieldLabel: 'Description',
      candidates: [
        { id: 'a', value: 'East wing expansion: 40 additional beds.', source: a },
        { id: 'b', value: 'East wing expansion: 40 additional beds and two theatres.', source: b },
      ],
    },
    {
      id: 'q-value',
      kind: 'conflict',
      fieldKey: 'importanceValue',
      fieldLabel: 'Importance & Value of Solution',
      candidates: [
        { id: 'a', value: 'Reduce patient wait times by 20%.', source: a },
        { id: 'b', value: 'Reduce patient wait times by 30%.', source: b },
      ],
    },
    {
      id: 'q-outcome',
      kind: 'needs-review',
      fieldKey: 'businessOutcome',
      fieldLabel: 'Business Outcome',
      candidates: [
        { id: 'claim', value: 'All patient data remains in the UAE for the life of the engagement.', source: c },
      ],
    },
  ]
}

/** Turn the answers into the Context changes they imply. Skipped, rejected and "both" answers change nothing. */
export function answersToUpdates(
  questions: DocumentQuestion[],
  answers: Record<string, QuestionAnswer>
): ContextUpdate[] {
  const updates: ContextUpdate[] = []
  for (const q of questions) {
    const ans = answers[q.id]
    if (!ans) continue
    if (ans.kind === 'pick') {
      const picked = q.candidates.find((c) => c.id === ans.candidateId)
      if (picked) updates.push({ field: q.fieldKey, mode: 'replace', value: picked.value })
    } else if (ans.kind === 'custom' && ans.value.trim()) {
      updates.push({ field: q.fieldKey, mode: 'replace', value: ans.value.trim() })
    } else if (ans.kind === 'accept') {
      updates.push({ field: q.fieldKey, mode: 'append', value: q.candidates[0].value })
    } else if (ans.kind === 'edit' && ans.value.trim()) {
      updates.push({ field: q.fieldKey, mode: 'append', value: ans.value.trim() })
    }
  }
  return updates
}

/** Apply updates to a values object (replace, or append unless already present). */
export function applyContextUpdates<T extends Partial<Record<ContextFieldKey, string>>>(
  data: T,
  updates: ContextUpdate[]
): T {
  const next = { ...data }
  for (const u of updates) {
    const existing = (next[u.field] as string | undefined) ?? ''
    if (u.mode === 'replace') {
      ;(next as Record<string, unknown>)[u.field] = u.value
    } else if (!existing.includes(u.value)) {
      ;(next as Record<string, unknown>)[u.field] = existing ? `${existing} ${u.value}` : u.value
    }
  }
  return next
}
