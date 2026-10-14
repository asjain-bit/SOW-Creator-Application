import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ConflictResolver } from './ConflictResolver'
import { answersToUpdates, applyContextUpdates, buildDocumentQuestions } from './ConflictResolver.utils'

const names = ['Meridian_RFP.pdf', 'Vendor_MSA.docx']

describe('buildDocumentQuestions', () => {
  it('needs at least two documents', () => {
    expect(buildDocumentQuestions(['one.pdf'])).toHaveLength(0)
    expect(buildDocumentQuestions(names)).toHaveLength(4)
  })
})

describe('answersToUpdates', () => {
  it('turns answers into context changes and ignores skips', () => {
    const qs = buildDocumentQuestions(names)
    const updates = answersToUpdates(qs, {
      'q-client': { kind: 'pick', candidateId: 'b' },
      'q-description': { kind: 'skip' },
      'q-outcome': { kind: 'accept' },
    })
    expect(updates.map((u) => u.field)).toEqual(['clientName', 'businessOutcome'])
    expect(applyContextUpdates({ businessOutcome: 'Faster.' }, updates).businessOutcome).toContain('Faster.')
  })
})

describe('ConflictResolver', () => {
  it('walks through the questions and reports the updates', () => {
    const onComplete = vi.fn()
    const qs = buildDocumentQuestions(names)
    render(<ConflictResolver isOpen questions={qs} fileNames={names} onComplete={onComplete} onClose={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: /Answer 4 questions/i }))
    expect(screen.getByText('Question 1 of 4')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Back/i })).not.toBeInTheDocument()

    // 1 conflict → pick, 2 discrepancy → both, 3 conflict → skip, 4 needs review → accept
    fireEvent.click(screen.getByText(qs[0].candidates[0].value))
    fireEvent.click(screen.getByRole('button', { name: /^Next$/i }))
    fireEvent.click(screen.getByText('Both are correct'))
    fireEvent.click(screen.getByRole('button', { name: /Keep both/i }))
    fireEvent.click(screen.getByText('Skip for now'))
    fireEvent.click(screen.getByRole('button', { name: /^Skip$/i }))
    fireEvent.click(screen.getByRole('button', { name: /Accept/i }))

    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onComplete.mock.calls[0][0].map((u: { field: string }) => u.field)).toEqual(['clientName', 'businessOutcome'])
  })

  it('closes without changes from the intro', () => {
    const onClose = vi.fn()
    render(
      <ConflictResolver
        isOpen
        questions={buildDocumentQuestions(names)}
        fileNames={names}
        onComplete={vi.fn()}
        onClose={onClose}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /Not now/i }))
    expect(onClose).toHaveBeenCalled()
  })
})
