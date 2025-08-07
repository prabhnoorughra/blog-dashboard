import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App.jsx'

describe('App Component', () => {
    it("renders correct heading", () => {
        render(<App></App>);
        expect(screen.getByRole("heading").textContent).toMatch(/our first test/i);
    });
});