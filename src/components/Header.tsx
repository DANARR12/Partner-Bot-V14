import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  ShoppingCart,
  Menu,
  Close,
  Search,
  Person,
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: 'Home', path: '/' },
    { text: 'Products', path: '/products' },
    { text: 'About', path: '/about' },
    { text: 'Contact', path: '/contact' },
  ];

  const drawer = (
    <Box sx={{ width: 250 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
        <Typography variant="h6" color="primary">
          Glow Beauty
        </Typography>
        <IconButton onClick={handleDrawerToggle}>
          <Close />
        </IconButton>
      </Box>
      <List>
        {menuItems.map((item) => (
          <ListItem
            key={item.text}
            onClick={() => {
              navigate(item.path);
              setMobileOpen(false);
            }}
            sx={{ cursor: 'pointer' }}
          >
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="sticky" sx={{ backgroundColor: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <Toolbar>
          {isMobile && (
            <IconButton
              color="primary"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <Menu />
            </IconButton>
          )}

          <Typography
            variant="h4"
            component={Link}
            to="/"
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              color: 'primary.main',
              fontWeight: 'bold',
              fontFamily: 'cursive',
            }}
          >
            Glow Beauty
          </Typography>

          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 2, mr: 2 }}>
              {menuItems.map((item) => (
                <Button
                  key={item.text}
                  component={Link}
                  to={item.path}
                  color="inherit"
                  sx={{
                    color: 'text.primary',
                    '&:hover': {
                      color: 'primary.main',
                    },
                  }}
                >
                  {item.text}
                </Button>
              ))}
            </Box>
          )}

          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton color="primary">
              <Search />
            </IconButton>
            <IconButton color="primary">
              <Person />
            </IconButton>
            <IconButton
              color="primary"
              component={Link}
              to="/cart"
            >
              <Badge badgeContent={3} color="secondary">
                <ShoppingCart />
              </Badge>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Header;