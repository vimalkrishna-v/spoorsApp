/**
 * Dashboard Controllers for role-based access
 */
class DashboardController {

  /**
   * BD Dashboard - Business Development user dashboard
   */
  static async getBDDashboard(req, res) {
    try {
      const user = req.user;

      // BD-specific dashboard data
      const dashboardData = {
        welcomeMessage: `Welcome to your BD Dashboard, ${user.email}!`,
        role: 'Business Development',
        permissions: [
          'View leads',
          'Create prospects',
          'Update client information',
          'Generate sales reports'
        ],
        quickActions: [
          { label: 'Add New Lead', url: '/leads/create' },
          { label: 'View Pipeline', url: '/pipeline' },
          { label: 'Client Meetings', url: '/meetings' },
          { label: 'Sales Reports', url: '/reports/sales' }
        ],
        stats: {
          totalLeads: 45,
          convertedLeads: 12,
          pendingFollowups: 8,
          monthlyTarget: 50000
        }
      };

      res.status(200).json({
        success: true,
        message: 'BD Dashboard data retrieved successfully',
        data: {
          user: user.toJSON(),
          dashboard: dashboardData
        }
      });

    } catch (error) {
      console.error('BD Dashboard error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Admin Dashboard - Administrator dashboard
   */
  static async getAdminDashboard(req, res) {
    try {
      const user = req.user;

      // Admin-specific dashboard data
      const dashboardData = {
        welcomeMessage: `Welcome to your Admin Dashboard, ${user.email}!`,
        role: 'Administrator',
        permissions: [
          'Manage users',
          'View all reports',
          'System configuration',
          'Data management',
          'Security settings'
        ],
        quickActions: [
          { label: 'User Management', url: '/admin/users' },
          { label: 'System Reports', url: '/admin/reports' },
          { label: 'Database Backup', url: '/admin/backup' },
          { label: 'Security Logs', url: '/admin/security' }
        ],
        stats: {
          totalUsers: 25,
          activeUsers: 22,
          systemHealth: 'Good',
          lastBackup: new Date().toISOString()
        }
      };

      res.status(200).json({
        success: true,
        message: 'Admin Dashboard data retrieved successfully',
        data: {
          user: user.toJSON(),
          dashboard: dashboardData
        }
      });

    } catch (error) {
      console.error('Admin Dashboard error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Get user-specific dashboard based on role
   */
  static async getDashboard(req, res) {
    try {
      const user = req.user;

      // Route to appropriate dashboard based on role
      switch (user.role) {
        case 'BD':
          return DashboardController.getBDDashboard(req, res);
        case 'Admin':
          return DashboardController.getAdminDashboard(req, res);
        default:
          return res.status(403).json({
            success: false,
            message: 'Invalid user role'
          });
      }

    } catch (error) {
      console.error('Dashboard error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = DashboardController;
