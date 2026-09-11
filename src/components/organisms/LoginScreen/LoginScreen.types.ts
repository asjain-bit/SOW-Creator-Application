/**
 * LoginScreen Types
 * Interface definitions for LoginScreen organism.
 */

export type LoginStep = 'email' | 'otp' | 'loader' | 'success'

export interface LoginScreenProps {
  /**
   * Callback triggered upon successful authentication.
   */
  onLoginSuccess?: (email: string) => void
  /**
   * Initial step for testing or storybook demo purposes.
   * @default 'email'
   */
  initialStep?: LoginStep
  /**
   * Pre-filled email address for testing or pre-populating.
   */
  initialEmail?: string
  /**
   * Enable interactive dev toolbar to quickly test negative & edge case states.
   * @default false
   */
  showDevControls?: boolean
}
