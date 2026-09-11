import { expect, test } from '@playwright/test'

test.describe('Landing Page E2E Suite', () => {
  test('renders landing page title and seed components correctly', async ({ page }) => {
    await page.goto('/')

    // Check main heading
    await expect(page.getByRole('heading', { name: /atomic architecture showcase/i })).toBeVisible()

    // Check header brand
    await expect(page.getByText('Acme Corp')).toBeVisible()

    // Check KPI cards
    await expect(page.getByText('Total Projects')).toBeVisible()
    await expect(page.getByText('Test Coverage')).toBeVisible()
  })

  test('toggles theme mode and updates data-theme attribute on document', async ({ page }) => {
    await page.goto('/')

    const htmlElement = page.locator('html')

    // Find theme toggle button in header
    const themeButton = page.getByRole('button', { name: /current theme/i }).first()
    await expect(themeButton).toBeVisible()

    // Click theme toggle to cycle theme (system -> light)
    await themeButton.click()
    await expect(htmlElement).toHaveAttribute('data-theme', 'light')

    // Click again to cycle to dark
    await themeButton.click()
    await expect(htmlElement).toHaveAttribute('data-theme', 'dark')
  })
})
