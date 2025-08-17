# Glow Beauty - Cosmetics Shopping Website

A modern, responsive e-commerce website for cosmetics and beauty products built with React, TypeScript, and Material-UI.

## 🌟 Features

### 🛍️ Shopping Experience
- **Product Catalog**: Browse through skincare, makeup, haircare, and fragrances
- **Advanced Filtering**: Filter by category, price range, and search functionality
- **Product Details**: Comprehensive product information with ingredients, benefits, and reviews
- **Shopping Cart**: Add items, manage quantities, and apply coupon codes
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### 🎨 Design & UX
- **Modern UI**: Beautiful pink-themed design with Material-UI components
- **Smooth Animations**: Hover effects and transitions for enhanced user experience
- **Category Navigation**: Easy browsing by product categories
- **Product Ratings**: Star ratings and review counts for informed decisions
- **Promotional Features**: Special offers and discount codes

### 📱 Responsive Features
- **Mobile-First**: Optimized for all screen sizes
- **Touch-Friendly**: Easy navigation on mobile devices
- **Collapsible Filters**: Mobile-optimized filtering system
- **Sticky Navigation**: Always accessible header and cart

## 🚀 Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cosmetics-shop
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000` to view the website

### Available Scripts

- `npm start` - Runs the app in development mode
- `npm run build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm run eject` - Ejects from Create React App (not recommended)

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.tsx      # Navigation header with cart
│   └── Footer.tsx      # Footer with links and info
├── pages/              # Main page components
│   ├── Home.tsx        # Landing page with hero and featured products
│   ├── Products.tsx    # Product catalog with filtering
│   ├── ProductDetail.tsx # Individual product page
│   └── Cart.tsx        # Shopping cart and checkout
├── data/               # Static data and utilities
│   └── products.ts     # Product data and helper functions
└── App.tsx             # Main app component with routing
```

## 🛍️ Product Categories

### Skincare
- Face serums and treatments
- Cleansers and toners
- Anti-aging products
- Moisturizers and creams

### Makeup
- Foundations and concealers
- Lipsticks and lip products
- Mascaras and eye makeup
- Makeup tools and accessories

### Hair Care
- Shampoos and conditioners
- Hair masks and treatments
- Styling products
- Heat protectants

### Fragrances
- Perfumes and colognes
- Body mists
- Gift sets
- Travel sizes

## 🎨 Design System

### Color Palette
- **Primary**: Pink (#ff69b4) - Main brand color
- **Secondary**: Light Pink (#f8bbd9) - Accent color
- **Background**: Light Pink (#fff5f8) - Page background
- **Text**: Dark Gray (#2c2c2c) - Primary text

### Typography
- **Font Family**: Poppins (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700
- **Responsive**: Scales appropriately across devices

### Components
- **Material-UI**: Consistent component library
- **Custom Styling**: Brand-specific modifications
- **Responsive Grid**: Flexible layout system

## 🔧 Customization

### Adding New Products
1. Edit `src/data/products.ts`
2. Add new product objects following the Product interface
3. Include all required fields: id, name, brand, category, price, etc.

### Modifying Categories
1. Update the `categories` array in `src/data/products.ts`
2. Add new category objects with id, name, and icon

### Styling Changes
1. Modify the theme in `src/App.tsx`
2. Update component styles using Material-UI's sx prop
3. Customize colors, typography, and spacing

## 📱 Mobile Optimization

### Responsive Breakpoints
- **xs**: 0px - 599px (Mobile)
- **sm**: 600px - 899px (Tablet)
- **md**: 900px - 1199px (Small Desktop)
- **lg**: 1200px+ (Large Desktop)

### Mobile Features
- Collapsible navigation menu
- Touch-friendly buttons and interactions
- Optimized product grid layouts
- Mobile-first filtering system

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy Options
- **Netlify**: Drag and drop the `build` folder
- **Vercel**: Connect your GitHub repository
- **AWS S3**: Upload build files to S3 bucket
- **Heroku**: Deploy using Heroku CLI

## 🔮 Future Enhancements

### Planned Features
- User authentication and accounts
- Wishlist functionality
- Product reviews and ratings
- Advanced search with filters
- Payment gateway integration
- Order tracking
- Email notifications
- Admin dashboard

### Technical Improvements
- State management with Redux or Context API
- API integration for dynamic data
- Image optimization and lazy loading
- Performance optimizations
- SEO improvements
- PWA capabilities

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Material-UI**: Component library and design system
- **React**: Frontend framework
- **TypeScript**: Type safety and developer experience
- **Unsplash**: Product images
- **Google Fonts**: Typography

## 📞 Support

For support and questions:
- Email: support@glowbeauty.com
- Phone: +1 (555) 123-4567
- Website: www.glowbeauty.com

---

**Glow Beauty** - Discover your natural beauty with premium cosmetics and skincare products. ✨
