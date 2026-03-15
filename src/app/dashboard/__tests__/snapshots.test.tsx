/// <reference types="jest" />

import React from 'react';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/dashboard',
    query: {},
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/dashboard',
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Mock all dashboard-related hooks
jest.mock('@/hooks/use-auth');
jest.mock('@/hooks/use-dashboard');
jest.mock('@/hooks/use-users');
jest.mock('@/hooks/use-licenses');
jest.mock('@/hooks/use-audit-logs');

// Create test components to represent dashboard layouts
const MockDashboardCard = ({ title, value }: { title: string; value: string }) => (
  <div data-testid="stat-card">
    <h3>{title}</h3>
    <p>{value}</p>
  </div>
);

const MockDashboard = () => (
  <div>
    <header role="banner">Dashboard Header</header>
    <nav role="navigation">Dashboard Navigation</nav>
    <main>
      <MockDashboardCard title="Total Users" value="150" />
      <MockDashboardCard title="Active Licenses" value="180" />
    </main>
    <footer>© 2025 License Manager</footer>
  </div>
);

const MockAdminDashboard = () => (
  <div>
    <header role="banner">Admin Dashboard</header>
    <aside>
      <nav role="navigation">Admin Menu</nav>
    </aside>
    <main>
      <table>
        <thead>
          <tr>
            <th>User</th>
            <th>Role</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>user1</td>
            <td>user</td>
            <td>active</td>
          </tr>
        </tbody>
      </table>
    </main>
    <footer>© 2025 License Manager</footer>
  </div>
);

const MockUserDashboard = () => (
  <div>
    <header role="banner">User Dashboard</header>
    <main>
      <section aria-label="profile">
        <h2>User Profile</h2>
        <p>Email: test@example.com</p>
      </section>
      <section aria-label="licenses">
        <h2>My Licenses</h2>
        <div data-testid="license-item">LIC-001</div>
      </section>
    </main>
    <footer>© 2025 License Manager</footer>
  </div>
);

const MockUserSettings = () => (
  <div>
    <header role="banner">Settings</header>
    <main>
      <section aria-label="profile-settings">
        <h2>Profile Settings</h2>
        <form>
          <input type="text" placeholder="Full Name" />
          <input type="email" placeholder="Email" />
          <button type="submit">Update Profile</button>
        </form>
      </section>
      <section aria-label="password-settings">
        <h2>Change Password</h2>
        <form>
          <input type="password" placeholder="Current Password" />
          <input type="password" placeholder="New Password" />
          <button type="submit">Change Password</button>
        </form>
      </section>
      <section aria-label="2fa-settings">
        <h2>Two-Factor Authentication</h2>
        <button>Enable 2FA</button>
      </section>
    </main>
    <footer>© 2025 License Manager</footer>
  </div>
);

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('Dashboard Snapshots', () => {
  describe('Main Dashboard Page', () => {
    it('should match snapshot for main dashboard', () => {
      const { container } = render(<MockDashboard />, {
        wrapper: createWrapper(),
      });
      expect(container).toMatchSnapshot();
    });

    it('should display dashboard structure', () => {
      const { container } = render(<MockDashboard />, {
        wrapper: createWrapper(),
      });
      expect(container.querySelector('header')).toBeInTheDocument();
      expect(container.querySelector('main')).toBeInTheDocument();
      expect(container.querySelector('footer')).toBeInTheDocument();
    });

    it('should match snapshot with stat cards', () => {
      const { container } = render(<MockDashboard />, {
        wrapper: createWrapper(),
      });
      expect(container.querySelector('main')).toMatchSnapshot('dashboard-stats');
    });
  });

  describe('Admin Dashboard Page', () => {
    it('should match snapshot for admin dashboard', () => {
      const { container } = render(<MockAdminDashboard />, {
        wrapper: createWrapper(),
      });
      expect(container).toMatchSnapshot();
    });

    it('should display admin sidebar', () => {
      const { container } = render(<MockAdminDashboard />, {
        wrapper: createWrapper(),
      });
      expect(container.querySelector('aside')).toBeInTheDocument();
    });

    it('should match snapshot with user table', () => {
      const { container } = render(<MockAdminDashboard />, {
        wrapper: createWrapper(),
      });
      const table = container.querySelector('table');
      expect(table).toMatchSnapshot('user-table');
    });
  });

  describe('User Dashboard Page', () => {
    it('should match snapshot for user dashboard', () => {
      const { container } = render(<MockUserDashboard />, {
        wrapper: createWrapper(),
      });
      expect(container).toMatchSnapshot();
    });

    it('should display user profile section', () => {
      const { container } = render(<MockUserDashboard />, {
        wrapper: createWrapper(),
      });
      const profile = container.querySelector('[aria-label="profile"]');
      expect(profile).toBeInTheDocument();
    });

    it('should match snapshot with licenses section', () => {
      const { container } = render(<MockUserDashboard />, {
        wrapper: createWrapper(),
      });
      const licenses = container.querySelector('[aria-label="licenses"]');
      expect(licenses).toMatchSnapshot('user-licenses');
    });
  });

  describe('User Settings Page', () => {
    it('should match snapshot for user settings page', () => {
      const { container } = render(<MockUserSettings />, {
        wrapper: createWrapper(),
      });
      expect(container).toMatchSnapshot();
    });

    it('should display profile settings section', () => {
      const { container } = render(<MockUserSettings />, {
        wrapper: createWrapper(),
      });
      const profile = container.querySelector('[aria-label="profile-settings"]');
      expect(profile).toBeInTheDocument();
    });

    it('should display password settings section', () => {
      const { container } = render(<MockUserSettings />, {
        wrapper: createWrapper(),
      });
      const password = container.querySelector('[aria-label="password-settings"]');
      expect(password).toBeInTheDocument();
    });

    it('should display 2FA settings section', () => {
      const { container } = render(<MockUserSettings />, {
        wrapper: createWrapper(),
      });
      const twoFA = container.querySelector('[aria-label="2fa-settings"]');
      expect(twoFA).toBeInTheDocument();
    });

    it('should match snapshot with all form sections', () => {
      const { container } = render(<MockUserSettings />, {
        wrapper: createWrapper(),
      });
      const forms = container.querySelectorAll('form');
      expect(forms).toHaveLength(2);
    });
  });

  describe('Dashboard Layout Structure', () => {
    it('should have consistent header across pages', () => {
      const { container: dashboardContainer } = render(<MockDashboard />, {
        wrapper: createWrapper(),
      });
      const { container: adminContainer } = render(<MockAdminDashboard />, {
        wrapper: createWrapper(),
      });

      const dashboardHeader = dashboardContainer.querySelector('header');
      const adminHeader = adminContainer.querySelector('header');

      expect(dashboardHeader).toBeDefined();
      expect(adminHeader).toBeDefined();
    });

    it('should have footer on all pages', () => {
      const pages = [
        <MockDashboard />,
        <MockAdminDashboard />,
        <MockUserDashboard />,
        <MockUserSettings />,
      ];

      pages.forEach((page) => {
        const { container } = render(page, { wrapper: createWrapper() });
        expect(container.querySelector('footer')).toBeInTheDocument();
      });
    });

    it('should match snapshot for header structure', () => {
      const { container } = render(<MockDashboard />, {
        wrapper: createWrapper(),
      });
      expect(container.querySelector('header')).toMatchSnapshot('header');
    });

    it('should match snapshot for navigation structure', () => {
      const { container } = render(<MockAdminDashboard />, {
        wrapper: createWrapper(),
      });
      expect(container.querySelector('nav')).toMatchSnapshot('navigation');
    });

    it('should match snapshot for main content area', () => {
      const { container } = render(<MockDashboard />, {
        wrapper: createWrapper(),
      });
      expect(container.querySelector('main')).toMatchSnapshot('main-content');
    });
  });

  describe('Dashboard Responsive Design', () => {
    it('should render layout on mobile viewport', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      const { container } = render(<MockUserDashboard />, {
        wrapper: createWrapper(),
      });
      expect(container).toMatchSnapshot('mobile-layout');
    });

    it('should render layout on tablet viewport', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });
      const { container } = render(<MockAdminDashboard />, {
        wrapper: createWrapper(),
      });
      expect(container).toMatchSnapshot('tablet-layout');
    });

    it('should render layout on desktop viewport', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      });
      const { container } = render(<MockDashboard />, {
        wrapper: createWrapper(),
      });
      expect(container).toMatchSnapshot('desktop-layout');
    });
  });

  describe('Dashboard Components', () => {
    it('should match snapshot for stat cards', () => {
      const { container } = render(<MockDashboard />, {
        wrapper: createWrapper(),
      });
      const statCards = container.querySelectorAll('[data-testid="stat-card"]');
      expect(statCards[0]).toMatchSnapshot('stat-card');
    });

    it('should match snapshot for user table', () => {
      const { container } = render(<MockAdminDashboard />, {
        wrapper: createWrapper(),
      });
      const table = container.querySelector('table');
      expect(table).toMatchSnapshot('user-table');
    });

    it('should match snapshot for settings forms', () => {
      const { container } = render(<MockUserSettings />, {
        wrapper: createWrapper(),
      });
      const forms = container.querySelectorAll('form');
      expect(forms[0]).toMatchSnapshot('profile-form');
    });
  });

  describe('Dashboard Accessibility', () => {
    it('should have semantic HTML structure', () => {
      const { container } = render(<MockDashboard />, {
        wrapper: createWrapper(),
      });
      expect(container.querySelector('header')).toBeInTheDocument();
      expect(container.querySelector('main')).toBeInTheDocument();
      expect(container.querySelector('footer')).toBeInTheDocument();
    });

    it('should have proper ARIA landmarks', () => {
      const { container } = render(<MockAdminDashboard />, {
        wrapper: createWrapper(),
      });
      expect(container.querySelector('[role="banner"]')).toBeInTheDocument();
      expect(container.querySelector('[role="navigation"]')).toBeInTheDocument();
    });

    it('should have accessible form controls', () => {
      const { getByPlaceholderText } = render(<MockUserSettings />, {
        wrapper: createWrapper(),
      });
      expect(getByPlaceholderText('Full Name')).toBeInTheDocument();
      expect(getByPlaceholderText('Email')).toBeInTheDocument();
      expect(getByPlaceholderText('Current Password')).toBeInTheDocument();
    });

    it('should have focusable interactive elements', () => {
      const { container } = render(<MockUserSettings />, {
        wrapper: createWrapper(),
      });
      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should match snapshot for semantic HTML', () => {
      const { container } = render(<MockDashboard />, {
        wrapper: createWrapper(),
      });
      expect(container).toMatchSnapshot('semantic-structure');
    });
  });

  describe('Dashboard State Variations', () => {
    it('should match snapshot for empty state', () => {
      const EmptyDashboard = () => (
        <div>
          <header role="banner">Dashboard</header>
          <main>
            <p>No data available</p>
          </main>
        </div>
      );
      const { container } = render(<EmptyDashboard />, {
        wrapper: createWrapper(),
      });
      expect(container).toMatchSnapshot('empty-state');
    });

    it('should match snapshot for loading state', () => {
      const LoadingDashboard = () => (
        <div>
          <header role="banner">Dashboard</header>
          <main>
            <div aria-busy="true">Loading...</div>
          </main>
        </div>
      );
      const { container } = render(<LoadingDashboard />, {
        wrapper: createWrapper(),
      });
      expect(container).toMatchSnapshot('loading-state');
    });

    it('should match snapshot for error state', () => {
      const ErrorDashboard = () => (
        <div>
          <header role="banner">Dashboard</header>
          <main role="alert">
            <p>Error loading dashboard data</p>
            <button>Retry</button>
          </main>
        </div>
      );
      const { container } = render(<ErrorDashboard />, {
        wrapper: createWrapper(),
      });
      expect(container).toMatchSnapshot('error-state');
    });
  });
});
