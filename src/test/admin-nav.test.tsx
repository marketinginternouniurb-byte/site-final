import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  createRouter,
  createRootRoute,
  createRoute,
  createMemoryHistory,
  RouterProvider,
  Outlet,
  Link,
} from "@tanstack/react-router";
import { adminNavLinks } from "@/lib/admin-nav";

const EXPECTED = [
  { to: "/admin", label: "Dashboard" },
  { to: "/admin/empreendimentos", label: "Empreendimentos" },
  { to: "/admin/leads", label: "Leads" },
  { to: "/admin/blog", label: "Blog" },
  { to: "/admin/depoimentos", label: "Depoimentos" },
  { to: "/admin/usuarios", label: "Usuários" },
  { to: "/admin/perfil", label: "Perfil" },
] as const;

function buildTestRouter() {
  const rootRoute = createRootRoute({
    component: () => (
      <div>
        <nav>
          {adminNavLinks.map((l) => (
            <Link key={l.to} to={l.to} data-testid={`nav-${l.to}`}>
              {l.label}
            </Link>
          ))}
        </nav>
        <Outlet />
      </div>
    ),
  });

  const routes = adminNavLinks.map((l) =>
    createRoute({
      getParentRoute: () => rootRoute,
      path: l.to,
      component: () => <div data-testid={`page-${l.to}`}>{l.label} page</div>,
    }),
  );

  const tree = rootRoute.addChildren(routes);
  return createRouter({
    routeTree: tree,
    history: createMemoryHistory({ initialEntries: ["/admin"] }),
  });
}

describe("admin menu navigation", () => {
  it("contains every expected admin link, in order", () => {
    expect(adminNavLinks.map((l) => ({ to: l.to, label: l.label }))).toEqual(EXPECTED);
  });

  it("each link href matches its declared `to` path", async () => {
    const router = buildTestRouter();
    await router.load();
    render(<RouterProvider router={router} />);

    for (const l of adminNavLinks) {
      const link = await screen.findByTestId(`nav-${l.to}`);
      expect(link).toBeInTheDocument();
      expect(link.getAttribute("href")).toBe(l.to);
    }
  });

  it("navigates to each link's route", async () => {
    const router = buildTestRouter();
    await router.load();
    render(<RouterProvider router={router} />);

    for (const l of adminNavLinks) {
      await router.navigate({ to: l.to });
      await router.invalidate();
      const page = await screen.findByTestId(`page-${l.to}`);
      expect(page).toHaveTextContent(`${l.label} page`);
    }
  });
});
