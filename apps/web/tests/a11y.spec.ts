import { test, expect } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"

const urls = ["/en/music", "/zh-CN/music", "/en"]

for (const url of urls) {
  test(`${url} has no serious or critical axe violations`, async ({ page }) => {
    await page.goto(url)
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze()
    const violations = results.violations.filter(
      (violation) =>
        violation.impact === "serious" || violation.impact === "critical"
    )
    expect(violations).toEqual([])
  })
}
