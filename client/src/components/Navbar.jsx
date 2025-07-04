import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  AccountCircle,
  ExitToApp,
  Dashboard,
  DirectionsBus,
  People,
  AssignmentInd,
  Assessment,
  Menu as MenuIcon,
  History,
  CheckCircle,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Define navigation items based on user role
  const adminNavItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/admin/dashboard' },
    { text: 'Bus Operators', icon: <DirectionsBus />, path: '/admin/bus-operators' },
    { text: 'BD Executives', icon: <People />, path: '/admin/bd-executives' },
    { text: 'Assignments', icon: <AssignmentInd />, path: '/admin/assignments' },
    { text: 'Reports', icon: <Assessment />, path: '/admin/reports' },
  ];

  const bdNavItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/bd/dashboard' },
    { text: 'My Operators', icon: <DirectionsBus />, path: '/bd/operators' },
    { text: 'Check-in', icon: <CheckCircle />, path: '/bd/checkin' },
    { text: 'History', icon: <History />, path: '/bd/history' },
  ];

  // Choose navigation items based on user role
  const navItems = currentUser?.role?.toLowerCase() === 'admin' ? adminNavItems : bdNavItems;

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleClose();
  };

  const handleProfile = () => {
    const profilePath = currentUser?.role === 'admin' ? '/admin/profile' : '/bd/profile';
    navigate(profilePath);
    handleClose();
  };

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  // Drawer content with navigation links
  const drawerContent = (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Avatar sx={{ bgcolor: theme.palette.primary.main, mb: 1 }}>
          {currentUser?.name?.[0] || currentUser?.email?.[0] || 'U'}
        </Avatar>
        <Typography variant="subtitle1">{currentUser?.name || currentUser?.email}</Typography>
        <Typography variant="body2" color="text.secondary">
          {currentUser?.role === 'admin' ? 'Administrator' : 'BD Executive'}
        </Typography>
      </Box>

      <Divider />

      <List>
        {navItems.map((item) => (
          <ListItem
            button
            component={Link}
            to={item.path}
            key={item.text}
            selected={isActive(item.path)}
            sx={{
              bgcolor: isActive(item.path) ? 'rgba(218,188,255,0.2)' : 'transparent',
              '&:hover': {
                bgcolor: 'rgba(218,188,255,0.1)',
              }
            }}
          >
            <ListItemIcon>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>

      <Divider />

      <List>
        <ListItem
          button
          component={Link}
          to={currentUser?.role === 'admin' ? '/admin/profile' : '/bd/profile'}
          selected={isActive(currentUser?.role === 'admin' ? '/admin/profile' : '/bd/profile')}
        >
          <ListItemIcon>
            <AccountCircle />
          </ListItemIcon>
          <ListItemText primary="Profile" />
        </ListItem>
        <ListItem button onClick={handleLogout}>
          <ListItemIcon>
            <ExitToApp />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          {isMobile ? (
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
              onClick={toggleDrawer(true)}
            >
              <MenuIcon />
            </IconButton>
          ) : null}

          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Spoors APP
          </Typography>

          {/* Desktop navigation */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {navItems.map((item) => (
                <Button
                  color="inherit"
                  component={Link}
                  to={item.path}
                  key={item.text}
                  sx={{
                    mx: 0.5,
                    borderBottom: isActive(item.path) ? '2px solid white' : 'none',
                    borderRadius: 0,
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.1)',
                    }
                  }}
                >
                  {item.text}
                </Button>
              ))}
            </Box>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleProfile}>Profile</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile navigation drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Navbar;
