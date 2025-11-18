# Image Optimization Guide

This guide will help you optimize images before uploading them to your Advent Calendar to ensure fast loading times and a great user experience.

## Why Optimize Images?

- **Faster Loading**: Smaller file sizes mean faster page loads
- **Better UX**: Users won't wait for large images to load
- **Cost Savings**: Less bandwidth usage on Supabase Storage
- **CDN Performance**: Optimized images perform better on CDN

## Recommended Image Specifications

### For Photo Content
- **Format**: JPEG for photos, PNG for graphics with transparency
- **Dimensions**: 1200px × 800px (or maintain 3:2 aspect ratio)
- **File Size**: Target < 200KB per image
- **Quality**: 80-85% JPEG quality is optimal

### For Message Content Images
- **Format**: JPEG or PNG
- **Dimensions**: 800px × 600px (or maintain 4:3 aspect ratio)
- **File Size**: Target < 150KB per image
- **Quality**: 80% JPEG quality

## Optimization Tools

### Online Tools (No Installation Required)

1. **TinyPNG** (https://tinypng.com/)
   - Excellent for PNG and JPEG compression
   - Maintains visual quality while reducing file size
   - Free tier available

2. **Squoosh** (https://squoosh.app/)
   - Google's image compression tool
   - Advanced options for format conversion
   - Works offline as PWA

3. **ImageOptim Online** (https://imageoptim.com/online)
   - Simple drag-and-drop interface
   - Good for batch processing

### Desktop Tools

1. **ImageOptim** (Mac) - https://imageoptim.com/
   ```bash
   # Install via Homebrew
   brew install --cask imageoptim
   ```

2. **GIMP** (Cross-platform) - https://www.gimp.org/
   - Free and open-source
   - Export with quality slider

3. **XnConvert** (Cross-platform) - https://www.xnview.com/en/xnconvert/
   - Batch processing
   - Many format options

### Command Line Tools

#### ImageMagick
```bash
# Install
brew install imagemagick  # Mac
sudo apt-get install imagemagick  # Linux

# Resize and optimize
convert input.jpg -resize 1200x800 -quality 85 output.jpg

# Batch process all images in a folder
for img in *.jpg; do
  convert "$img" -resize 1200x800 -quality 85 "optimized_$img"
done
```

#### Sharp (Node.js)
```bash
# Install globally
pnpm add -g sharp-cli

# Resize and optimize
sharp -i input.jpg -o output.jpg resize 1200 800 --quality 85

# Batch process
sharp -i "*.jpg" -o optimized resize 1200 800 --quality 85
```

## Optimization Checklist

Before uploading images, ensure you've completed these steps:

- [ ] Resize images to recommended dimensions (1200×800 or 800×600)
- [ ] Compress images to target file size (< 200KB)
- [ ] Convert images to appropriate format (JPEG for photos, PNG for graphics)
- [ ] Remove EXIF data if privacy is a concern
- [ ] Test image quality on different devices
- [ ] Verify images look good on both desktop and mobile

## Quick Optimization Script

Create a script to automate image optimization:

```bash
#!/bin/bash
# optimize-images.sh

QUALITY=85
MAX_WIDTH=1200
MAX_HEIGHT=800

mkdir -p optimized

for img in *.{jpg,jpeg,png,JPG,JPEG,PNG}; do
  if [ -f "$img" ]; then
    echo "Optimizing $img..."
    convert "$img" \
      -resize "${MAX_WIDTH}x${MAX_HEIGHT}>" \
      -quality $QUALITY \
      -strip \
      "optimized/$img"
  fi
done

echo "✅ All images optimized! Check the 'optimized' folder."
```

Usage:
```bash
chmod +x optimize-images.sh
./optimize-images.sh
```

## Best Practices

1. **Always keep original images**: Save your originals before optimizing
2. **Optimize before upload**: Don't upload originals and optimize later
3. **Test on mobile**: Check how images look on smaller screens
4. **Use descriptive filenames**: Makes organization easier
5. **Consider WebP format**: Modern browsers support it with better compression
6. **Remove metadata**: Strip EXIF data to reduce file size

## Format Comparison

| Format | Best For | Pros | Cons |
|--------|----------|------|------|
| JPEG | Photos, gradients | Small file size, wide support | Lossy, no transparency |
| PNG | Graphics, logos, text | Lossless, transparency | Larger file size |
| WebP | Modern web | Better compression, transparency | Limited older browser support |
| AVIF | Cutting edge | Best compression | Very limited support |

## Supabase Storage Limits

- **Free tier**: 1GB storage
- **Max file size**: 50MB (but aim for much smaller!)
- **Recommended**: Keep images under 500KB for best performance

## CDN Benefits

Supabase Storage automatically provides CDN benefits:
- **Edge caching**: Images served from locations near your users
- **Fast delivery**: Reduced latency worldwide
- **Automatic optimization**: Some CDNs can serve different formats based on browser support

## Testing Your Images

After optimization, verify:
1. **File size**: Use `ls -lh` or check file properties
2. **Dimensions**: Open in image viewer
3. **Quality**: Compare original vs optimized visually
4. **Load time**: Test in browser with throttled network

## Troubleshooting

**Images look blurry?**
- Increase quality setting (try 90 instead of 85)
- Check if image was upscaled (use original size or larger)

**File size still too large?**
- Reduce dimensions further
- Lower quality setting
- Try WebP format
- Remove unnecessary transparency

**Wrong aspect ratio?**
- Use crop before resize
- Or use `^` flag in ImageMagick to maintain aspect ratio

## Additional Resources

- [WebP Conversion Guide](https://developers.google.com/speed/webp)
- [JPEG Optimization](https://web.dev/fast/#optimize-images)
- [Image CDN Best Practices](https://web.dev/image-cdns/)
