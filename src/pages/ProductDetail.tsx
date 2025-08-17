import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  Rating,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Card,
  CardContent,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  ShoppingCart,
  Favorite,
  Share,
  Star,
  CheckCircle,
  ExpandMore,
  LocalShipping,
  Security,
  Support,
} from '@mui/icons-material';
import { useParams, Link } from 'react-router-dom';
import { getProductById, products } from '../data/products';

const ProductDetail: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { id } = useParams<{ id: string }>();
  const product = getProductById(Number(id));

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  if (!product) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          Product not found
        </Typography>
        <Button variant="contained" component={Link} to="/products">
          Back to Products
        </Button>
      </Container>
    );
  }

  // Mock related products
  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    if (value > 0) {
      setQuantity(value);
    }
  };

  const handleAddToCart = () => {
    // TODO: Implement add to cart functionality
    console.log(`Added ${quantity} of ${product.name} to cart`);
  };

  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumb */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary">
          <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
          {' > '}
          <Link to="/products" style={{ color: 'inherit', textDecoration: 'none' }}>Products</Link>
          {' > '}
          <Link to={`/products?category=${product.category}`} style={{ color: 'inherit', textDecoration: 'none' }}>
            {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
          </Link>
          {' > '}
          {product.name}
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Product Images */}
        <Grid item xs={12} md={6}>
          <Box sx={{ position: 'relative' }}>
            <Box
              component="img"
              src={product.image}
              alt={product.name}
              sx={{
                width: '100%',
                height: '500px',
                objectFit: 'cover',
                borderRadius: 2,
                mb: 2,
              }}
            />
            {discountPercentage > 0 && (
              <Chip
                label={`${discountPercentage}% OFF`}
                color="error"
                sx={{
                  position: 'absolute',
                  top: 16,
                  left: 16,
                  fontWeight: 'bold',
                }}
              />
            )}
          </Box>
        </Grid>

        {/* Product Info */}
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              {product.brand}
            </Typography>
            <Typography variant="h3" sx={{ mb: 2, fontWeight: 600 }}>
              {product.name}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Rating value={product.rating} precision={0.1} readOnly />
              <Typography variant="body2" sx={{ ml: 1, color: 'text.secondary' }}>
                ({product.reviews} reviews)
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold', mr: 2 }}>
                ${product.price}
              </Typography>
              {product.originalPrice && (
                <Typography
                  variant="h6"
                  sx={{
                    textDecoration: 'line-through',
                    color: 'text.secondary',
                  }}
                >
                  ${product.originalPrice}
                </Typography>
              )}
            </Box>

            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
              {product.description}
            </Typography>

            {/* Tags */}
            <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
              {product.tags.map((tag) => (
                <Chip key={tag} label={tag} size="small" />
              ))}
            </Box>

            {/* Size */}
            {product.size && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Size: {product.size}
                </Typography>
              </Box>
            )}

            {/* Quantity and Add to Cart */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Quantity
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                  type="number"
                  value={quantity}
                  onChange={handleQuantityChange}
                  inputProps={{ min: 1 }}
                  sx={{ width: 100 }}
                />
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<ShoppingCart />}
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  sx={{ flexGrow: 1 }}
                >
                  {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                </Button>
              </Box>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <Button
                variant="outlined"
                startIcon={<Favorite />}
                sx={{ flex: 1 }}
              >
                Add to Wishlist
              </Button>
              <Button
                variant="outlined"
                startIcon={<Share />}
                sx={{ flex: 1 }}
              >
                Share
              </Button>
            </Box>

            {/* Benefits */}
            {product.benefits && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Key Benefits
                </Typography>
                <List dense>
                  {product.benefits.map((benefit, index) => (
                    <ListItem key={index} sx={{ py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckCircle color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={benefit} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Box>
        </Grid>
      </Grid>

      {/* Product Details Tabs */}
      <Box sx={{ mt: 6 }}>
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6">Product Details</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              {product.ingredients && (
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Key Ingredients
                  </Typography>
                  <List dense>
                    {product.ingredients.map((ingredient, index) => (
                      <ListItem key={index} sx={{ py: 0.5 }}>
                        <ListItemText primary={ingredient} />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              )}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  How to Use
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Apply a small amount to clean, dry skin. Use as directed on the packaging. 
                  For best results, use consistently as part of your daily skincare routine.
                </Typography>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6">Shipping & Returns</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LocalShipping sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">Free Shipping</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Free shipping on orders over $50. Standard delivery 3-5 business days.
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Security sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">Secure Payment</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  100% secure payment processing. Your information is protected.
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Support sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">Easy Returns</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  30-day return policy. Contact us for any issues with your order.
                </Typography>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      </Box>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <Box sx={{ mt: 6 }}>
          <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
            Related Products
          </Typography>
          <Grid container spacing={3}>
            {relatedProducts.map((relatedProduct) => (
              <Grid item xs={12} sm={6} md={3} key={relatedProduct.id}>
                <Card
                  component={Link}
                  to={`/product/${relatedProduct.id}`}
                  sx={{
                    textDecoration: 'none',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                    },
                  }}
                >
                  <Box
                    component="img"
                    src={relatedProduct.image}
                    alt={relatedProduct.name}
                    sx={{
                      height: 200,
                      objectFit: 'cover',
                    }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      {relatedProduct.brand}
                    </Typography>
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                      {relatedProduct.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Rating value={relatedProduct.rating} precision={0.1} size="small" readOnly />
                      <Typography variant="body2" sx={{ ml: 1, color: 'text.secondary' }}>
                        ({relatedProduct.reviews})
                      </Typography>
                    </Box>
                    <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                      ${relatedProduct.price}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Container>
  );
};

export default ProductDetail;