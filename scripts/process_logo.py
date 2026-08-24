from PIL import Image, ImageFilter

source = Image.open('public/adamaq-logo.jpeg').convert('RGBA')
pixels = source.load()
for y in range(source.height):
    for x in range(source.width):
        r, g, b, _ = pixels[x, y]
        maximum = max(r, g, b)
        if maximum > 245 and min(r, g, b) > 235:
            pixels[x, y] = (255, 255, 255, 0)
        elif maximum > 225 and min(r, g, b) > 210:
            pixels[x, y] = (r, g, b, round((255 - maximum) / 30 * 255))

alpha = source.getchannel('A').filter(ImageFilter.MaxFilter(3))
output = Image.new('RGBA', source.size, (0, 0, 0, 0))
output.paste(source, (0, 0), alpha)
output.crop(output.getbbox()).save('public/adamaq-logo-transparent.png')
