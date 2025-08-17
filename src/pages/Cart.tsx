import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  TextField,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Add,
  Remove,
  Delete,
  ShoppingCart,
  ArrowBack,
  LocalShipping,
  Security,
  Support,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { products } from '../data/products';

// Mock cart data
const mockCartItems = [
  {
    id: 1,
    productId: 1,
    quantity: 2,
  },
  {
    id: 2,
    productId: 4,
    quantity: 1,
  },
  {
    id: 3,
    productId: 7,
    quantity: 1,
  },
];

const Cart: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [cartItems, setCartItems] = useState(mockCartItems);
  const [couponCode, setCouponCode] = useState('');

  const getProductById = (id: number) => {
    return products.find(product => product.id === id);
  };

  const updateQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
      return;
    }
    setCartItems(items =>
      items.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (itemId: number) => {
    setCartItems(items => items.filter(item => item.id !== itemId));
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const product = getProductById(item.productId);
      return total + (product?.price || 0) * item.quantity;
    }, 0);
  };

  const calculateDiscount = () => {
    // Mock discount calculation
    const subtotal = calculateSubtotal();
    return couponCode === 'BEAUTY20' ? subtotal * 0.2 : 0;
  };

  const calculateShipping = () => {
    const subtotal = calculateSubtotal();
    return subtotal >= 50 ? 0 : 5.99;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    const shipping = calculateShipping();
    return subtotal - discount + shipping;
  };

  const handleCheckout = () => {
    // TODO: Implement checkout functionality
    console.log('Proceeding to checkout...');
  };

  if (cartItems.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center' }}>
          <ShoppingCart sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h4" sx={{ mb: 2 }}>
            Your cart is empty
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Looks like you haven't added any products to your cart yet.
          </Typography>
          <Button
            variant="contained"
            size="large"
            component={Link}
            to="/products"
            startIcon={<ArrowBack />}
          >
            Continue Shopping
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ mb: 2, fontWeight: 600, color: theme.palette.primary.main }}>
          Shopping Cart
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Review your items and proceed to checkout
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Cart Items */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Cart Items ({cartItems.length})
              </Typography>
              
              <List>
                {cartItems.map((item, index) => {
                  const product = getProductById(item.productId);
                  if (!product) return null;

                  return (
                    <React.Fragment key={item.id}>
                      <ListItem sx={{ py: 3 }}>
                        <Box
                          component="img"
                          src={product.image}
                          alt={product.name}
                          sx={{
                            width: 80,
                            height: 80,
                            objectFit: 'cover',
                            borderRadius: 1,
                            mr: 2,
                          }}
                        />
                        
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="h6" sx={{ mb: 1 }}>
                            {product.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {product.brand}
                          </Typography>
                          {product.size && (
                            <Typography variant="body2" color="text.secondary">
                              Size: {product.size}
                            </Typography>
                          )}
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mr: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', border: 1, borderColor: 'divider', borderRadius: 1 }}>
                            <IconButton
                              size="small"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Remove />
                            </IconButton>
                            <Typography sx={{ px: 2, minWidth: 40, textAlign: 'center' }}>
                              {item.quantity}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Add />
                            </IconButton>
                          </Box>
                        </Box>

                        <Box sx={{ textAlign: 'right', mr: 2 }}>
                          <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                            ${(product.price * item.quantity).toFixed(2)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            ${product.price} each
                          </Typography>
                        </Box>

                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            onClick={() => removeItem(item.id)}
                            color="error"
                          >
                            <Delete />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                      
                      {index < cartItems.length - 1 && <Divider />}
                    </React.Fragment>
                  );
                })}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Order Summary */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ position: 'sticky', top: 20 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Order Summary
              </Typography>

              {/* Coupon Code */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Coupon Code
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    size="small"
                    placeholder="Enter code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    sx={{ flexGrow: 1 }}
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      if (couponCode === 'BEAUTY20') {
                        alert('Coupon applied! 20% discount added.');
                      } else {
                        alert('Invalid coupon code');
                      }
                    }}
                  >
                    Apply
                  </Button>
                </Box>
                {couponCode === 'BEAUTY20' && (
                  <Chip
                    label="20% OFF applied"
                    color="success"
                    size="small"
                    sx={{ mt: 1 }}
                  />
                )}
              </Box>

              {/* Price Breakdown */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Subtotal</Typography>
                  <Typography variant="body2">${calculateSubtotal().toFixed(2)}</Typography>
                </Box>
                
                {calculateDiscount() > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="success.main">
                      Discount
                    </Typography>
                    <Typography variant="body2" color="success.main">
                      -${calculateDiscount().toFixed(2)}
                    </Typography>
                  </Box>
                )}
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Shipping</Typography>
                  <Typography variant="body2">
                    {calculateShipping() === 0 ? 'Free' : `$${calculateShipping().toFixed(2)}`}
                  </Typography>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Total
                  </Typography>
                  <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                    ${calculateTotal().toFixed(2)}
                  </Typography>
                </Box>
              </Box>

              {/* Checkout Button */}
              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={handleCheckout}
                sx={{ mb: 2 }}
              >
                Proceed to Checkout
              </Button>

              {/* Continue Shopping */}
              <Button
                variant="outlined"
                fullWidth
                component={Link}
                to="/products"
                startIcon={<ArrowBack />}
              >
                Continue Shopping
              </Button>

              {/* Shipping Info */}
              <Box sx={{ mt: 3, p: 2, backgroundColor: '#f8f9fa', borderRadius: 1 }}>
                <Typography variant="body2" sx={{ mb: 2, fontWeight: 600 }}>
                  Shipping Information
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocalShipping sx={{ fontSize: 16, mr: 1, color: 'primary.main' }} />
                  <Typography variant="body2" color="text.secondary">
                    Free shipping on orders over $50
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Security sx={{ fontSize: 16, mr: 1, color: 'primary.main' }} />
                  <Typography variant="body2" color="text.secondary">
                    Secure payment processing
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Support sx={{ fontSize: 16, mr: 1, color: 'primary.main' }} />
                  <Typography variant="body2" color="text.secondary">
                    30-day return policy
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Cart;