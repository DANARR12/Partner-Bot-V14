import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Rating,
  Chip,
  Paper,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  ShoppingCart,
  Star,
  LocalShipping,
  Security,
  Support,
  Refresh,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { products, categories } from '../data/products';

const Home: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const featuredProducts = products.slice(0, 4);

  const features = [
    {
      icon: <LocalShipping sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      title: 'Free Shipping',
      description: 'Free shipping on orders over $50'
    },
    {
      icon: <Security sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      title: 'Secure Payment',
      description: '100% secure payment processing'
    },
    {
      icon: <Support sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      title: '24/7 Support',
      description: 'Round the clock customer support'
    },
    {
      icon: <Refresh sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      title: 'Easy Returns',
      description: '30-day return policy'
    }
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #ff69b4 0%, #f8bbd9 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant={isMobile ? 'h3' : 'h2'}
                sx={{
                  fontWeight: 'bold',
                  mb: 2,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
                }}
              >
                Discover Your Natural Beauty
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  mb: 4,
                  opacity: 0.9,
                  lineHeight: 1.6,
                }}
              >
                Premium cosmetics and skincare products to enhance your natural glow. 
                Shop the latest trends in beauty and wellness.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  component={Link}
                  to="/products"
                  sx={{
                    backgroundColor: 'white',
                    color: theme.palette.primary.main,
                    '&:hover': {
                      backgroundColor: '#f5f5f5',
                    },
                  }}
                >
                  Shop Now
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                    },
                  }}
                >
                  Learn More
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '400px',
                }}
              >
                <Typography variant="h1" sx={{ fontSize: '8rem', opacity: 0.1 }}>
                  ✨
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Box
                sx={{
                  textAlign: 'center',
                  p: 3,
                  borderRadius: 2,
                  backgroundColor: 'white',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                  },
                }}
              >
                {feature.icon}
                <Typography variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 600 }}>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Categories Section */}
      <Box sx={{ backgroundColor: '#f8f9fa', py: 6 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            sx={{
              textAlign: 'center',
              mb: 4,
              fontWeight: 600,
              color: theme.palette.primary.main,
            }}
          >
            Shop by Category
          </Typography>
          <Grid container spacing={3}>
            {categories.map((category) => (
              <Grid item xs={12} sm={6} md={3} key={category.id}>
                <Card
                  component={Link}
                  to={`/products?category=${category.id}`}
                  sx={{
                    textDecoration: 'none',
                    height: '200px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'white',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                    },
                  }}
                >
                  <Typography variant="h1" sx={{ fontSize: '3rem', mb: 2 }}>
                    {category.icon}
                  </Typography>
                  <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 600 }}>
                    {category.name}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Featured Products */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography
          variant="h3"
          sx={{
            textAlign: 'center',
            mb: 4,
            fontWeight: 600,
            color: theme.palette.primary.main,
          }}
        >
          Featured Products
        </Typography>
        <Grid container spacing={4}>
          {featuredProducts.map((product) => (
            <Grid item xs={12} sm={6} md={3} key={product.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                  },
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={product.image}
                  alt={product.name}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
                    {product.brand}
                  </Typography>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                    {product.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Rating value={product.rating} precision={0.1} size="small" readOnly />
                    <Typography variant="body2" sx={{ ml: 1, color: 'text.secondary' }}>
                      ({product.reviews})
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                      ${product.price}
                    </Typography>
                    {product.originalPrice && (
                      <Typography
                        variant="body2"
                        sx={{
                          textDecoration: 'line-through',
                          color: 'text.secondary',
                          ml: 1,
                        }}
                      >
                        ${product.originalPrice}
                      </Typography>
                    )}
                  </Box>
                  <Button
                    variant="contained"
                    startIcon={<ShoppingCart />}
                    component={Link}
                    to={`/product/${product.id}`}
                    sx={{ mt: 'auto' }}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Promotional Section */}
      <Box sx={{ backgroundColor: theme.palette.primary.main, color: 'white', py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h3" sx={{ mb: 2, fontWeight: 'bold' }}>
                Special Offer
              </Typography>
              <Typography variant="h5" sx={{ mb: 3, opacity: 0.9 }}>
                Get 20% off on your first order!
              </Typography>
              <Typography variant="body1" sx={{ mb: 4, opacity: 0.8 }}>
                Join our beauty community and enjoy exclusive discounts on premium cosmetics. 
                Use code: BEAUTY20 at checkout.
              </Typography>
              <Button
                variant="contained"
                size="large"
                component={Link}
                to="/products"
                sx={{
                  backgroundColor: 'white',
                  color: theme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                  },
                }}
              >
                Shop Now
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '300px',
                }}
              >
                <Typography variant="h1" sx={{ fontSize: '6rem', opacity: 0.2 }}>
                  💄
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;