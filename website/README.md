# Sylang Website

This folder contains the **sylang.dev** website - a beautiful single-page application that serves as the official documentation for Sylang (Systems and Safety Engineering Language).

## Features

- **Modern SPA Design**: Single-page application with elegant left sidebar navigation
- **Markdown-Driven**: All content managed in a single `content.md` file
- **Professional Styling**: Beautiful typography, responsive design, and professional color scheme
- **Syntax Highlighting**: Custom Sylang syntax highlighting with Prism.js
- **Mobile Responsive**: Works perfectly on all device sizes
- **SEO Optimized**: Proper meta tags and semantic HTML

## Files

- `index.html` - Main single-page application
- `content.md` - All website content in markdown format
- `README.md` - This file

## Local Development

### Option 1: Simple HTTP Server (Python)
```bash
cd website
python3 -m http.server 8000
# Open http://localhost:8000
```

### Option 2: Simple HTTP Server (Node.js)
```bash
cd website
npx http-server -p 8000
# Open http://localhost:8000
```

### Option 3: Live Server (VS Code Extension)
1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

## Deployment to sylang.dev

### Option 1: Static Hosting (Recommended)

**Netlify** (Easy deployment):
1. Create account at [netlify.com](https://netlify.com)
2. Connect your GitHub repository
3. Set build directory to `website`
4. Deploy automatically on git push

**Vercel**:
1. Create account at [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Set output directory to `website`
4. Deploy

**GitHub Pages**:
1. Push website folder to GitHub
2. Enable GitHub Pages in repository settings
3. Set source to `website` folder

### Option 2: Custom Server

Upload the `website` folder contents to your web server:
```bash
# Example with rsync
rsync -avz website/ user@sylang.dev:/var/www/html/
```

### Option 3: Docker Deployment

```dockerfile
FROM nginx:alpine
COPY website/ /usr/share/nginx/html/
EXPOSE 80
```

## Domain Configuration

To point **sylang.dev** to your hosting:

1. **DNS Configuration**:
   - Add A record: `sylang.dev` → Your server IP
   - Add CNAME record: `www.sylang.dev` → `sylang.dev`

2. **SSL Certificate**:
   - Use Let's Encrypt for free SSL
   - Most hosting providers (Netlify, Vercel) provide SSL automatically

## Content Updates

To update the website content:

1. Edit `content.md` with your changes
2. The single-page app will automatically parse and render the markdown
3. Deploy the updated files

## Customization

### Colors and Branding
Edit the CSS variables in `index.html`:
```css
:root {
    --primary-color: #2563eb;    /* Main brand color */
    --accent-color: #0ea5e9;     /* Accent color */
    --sidebar-bg: #f8fafc;       /* Sidebar background */
    /* ... */
}
```

### Logo
- Current logo is `/sl` text-based
- To use custom logo image, replace the `.logo-icon` div with an `<img>` tag
- Update the favicon link to point to your custom icon

### Content Structure
The navigation is automatically generated from markdown headers (H1-H4):
- H1: Main sections
- H2: Sub-sections
- H3: Sub-sub-sections (indented in nav)
- H4: Minor sections (indented in nav)

## Architecture

- **Frontend**: Pure HTML/CSS/JavaScript (no build process needed)
- **Markdown Parser**: Marked.js (4.3.0)
- **Syntax Highlighting**: Prism.js (1.29.0) with custom Sylang language
- **Fonts**: Inter (UI) + JetBrains Mono (code)
- **Icons**: Custom `/sl` logo matching VS Code extension

## Browser Support

- Chrome/Edge 88+
- Firefox 78+
- Safari 14+
- Mobile Safari/Chrome (responsive design)

## Performance

- Lightweight: ~50KB total (excluding external CDN resources)
- Fast loading: All resources cached via CDN
- Smooth scrolling: Hardware-accelerated CSS animations
- SEO friendly: Semantic HTML structure

---

**Ready to deploy to sylang.dev! 🚀** 