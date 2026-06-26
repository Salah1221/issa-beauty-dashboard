import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Login from "./Login";

const navigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom"
  );
  return { ...actual, useNavigate: () => navigate };
});

const login = vi.fn();
vi.mock("./lib/auth", () => ({
  login: (password: string) => login(password),
}));

function renderLogin() {
  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );
}

beforeEach(() => {
  navigate.mockReset();
  login.mockReset();
});

describe("Login", () => {
  it("navigates home after a successful login", async () => {
    login.mockResolvedValue({ data: { success: true } });
    renderLogin();
    await userEvent.type(screen.getByLabelText(/password/i), "letmein");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));
    expect(login).toHaveBeenCalledWith("letmein");
    expect(navigate).toHaveBeenCalledWith("/");
  });

  it("shows an error and does not navigate on a failed login", async () => {
    login.mockRejectedValue({ response: { status: 401 } });
    renderLogin();
    await userEvent.type(screen.getByLabelText(/password/i), "wrong");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));
    expect(await screen.findByText(/incorrect password/i)).toBeInTheDocument();
    expect(navigate).not.toHaveBeenCalled();
  });
});
