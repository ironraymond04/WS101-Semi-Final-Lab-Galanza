# Web stack and run target

Type: grilling
Status: resolved

## Question

Given this repository has no application code or package manifest, which web framework/tooling and run or deployment target should the MVP use? Choose a stack that fits a responsive, single-user expense tracker with same-browser/device data and no stated technology constraints.

## Answer

- Build the app with React and Vite, using JavaScript and npm.
- Run it locally with Vite and produce a static build. No hosting provider or deployment target is selected for the MVP.
- Persist expenses in localStorage on the same browser/device.
- Use Vitest and Testing Library for unit/component coverage and Playwright for browser acceptance tests at the agreed user-visible seam.