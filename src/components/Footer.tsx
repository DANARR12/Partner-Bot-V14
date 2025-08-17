import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  TextField,
  Button,
  IconButton,
  Link,
  Divider,
} from '@mui/material';
import {
  Facebook,
  Instagram,
  Twitter,
  YouTube,
  Email,
  Phone,
  LocationOn,
} from '@mui/icons-material';

const Footer: React.FC = () => {
  return (
    <Box
      sx={{
        backgroundColor: '#2c2c2c',
        color: 'white',
        py: 6,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Company Info */}
          <Grid item xs={12} md={4}>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: '#ff69b4' }}>
              Glow Beauty
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: '#ccc' }}>
              Discover your natural beauty with our premium cosmetics collection. 
              We offer high-quality products that enhance your natural glow.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton sx={{ color: '#ff69b4' }}>
                <Facebook />
              </IconButton>
              <IconButton sx={{ color: '#ff69b4' }}>
                <Instagram />
              </IconButton>
              <IconButton sx={{ color: '#ff69b4' }}>
                <Twitter />
              </IconButton>
              <IconButton sx={{ color: '#ff69b4' }}>
                <YouTube />
              </IconButton>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} md={2}>
            <Typography variant="h6" sx={{ mb: 2, color: '#ff69b4' }}>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/" sx={{ color: '#ccc', textDecoration: 'none', '&:hover': { color: '#ff69b4' } }}>
                Home
              </Link>
              <Link href="/products" sx={{ color: '#ccc', textDecoration: 'none', '&:hover': { color: '#ff69b4' } }}>
                Products
              </Link>
              <Link href="/about" sx={{ color: '#ccc', textDecoration: 'none', '&:hover': { color: '#ff69b4' } }}>
                About Us
              </Link>
              <Link href="/contact" sx={{ color: '#ccc', textDecoration: 'none', '&:hover': { color: '#ff69b4' } }}>
                Contact
              </Link>
            </Box>
          </Grid>

          {/* Categories */}
          <Grid item xs={12} md={2}>
            <Typography variant="h6" sx={{ mb: 2, color: '#ff69b4' }}>
              Categories
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/products?category=skincare" sx={{ color: '#ccc', textDecoration: 'none', '&:hover': { color: '#ff69b4' } }}>
                Skincare
              </Link>
              <Link href="/products?category=makeup" sx={{ color: '#ccc', textDecoration: 'none', '&:hover': { color: '#ff69b4' } }}>
                Makeup
              </Link>
              <Link href="/products?category=haircare" sx={{ color: '#ccc', textDecoration: 'none', '&:hover': { color: '#ff69b4' } }}>
                Hair Care
              </Link>
              <Link href="/products?category=fragrances" sx={{ color: '#ccc', textDecoration: 'none', '&:hover': { color: '#ff69b4' } }}>
                Fragrances
              </Link>
            </Box>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} md={2}>
            <Typography variant="h6" sx={{ mb: 2, color: '#ff69b4' }}>
              Contact Info
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn sx={{ color: '#ff69b4', fontSize: 20 }} />
                <Typography variant="body2" sx={{ color: '#ccc' }}>
                  123 Beauty St, NY 10001
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Phone sx={{ color: '#ff69b4', fontSize: 20 }} />
                <Typography variant="body2" sx={{ color: '#ccc' }}>
                  +1 (555) 123-4567
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email sx={{ color: '#ff69b4', fontSize: 20 }} />
                <Typography variant="body2" sx={{ color: '#ccc' }}>
                  info@glowbeauty.com
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Newsletter */}
          <Grid item xs={12} md={2}>
            <Typography variant="h6" sx={{ mb: 2, color: '#ff69b4' }}>
              Newsletter
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: '#ccc' }}>
              Subscribe for beauty tips and exclusive offers!
            </Typography>
            <TextField
              size="small"
              placeholder="Your email"
              sx={{
                mb: 1,
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': {
                    borderColor: '#ccc',
                  },
                  '&:hover fieldset': {
                    borderColor: '#ff69b4',
                  },
                },
              }}
            />
            <Button
              variant="contained"
              sx={{
                backgroundColor: '#ff69b4',
                '&:hover': {
                  backgroundColor: '#e91e63',
                },
              }}
            >
              Subscribe
            </Button>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: '#444' }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography variant="body2" sx={{ color: '#ccc' }}>
            © 2024 Glow Beauty. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Link href="/privacy" sx={{ color: '#ccc', textDecoration: 'none', '&:hover': { color: '#ff69b4' } }}>
              Privacy Policy
            </Link>
            <Link href="/terms" sx={{ color: '#ccc', textDecoration: 'none', '&:hover': { color: '#ff69b4' } }}>
              Terms of Service
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;